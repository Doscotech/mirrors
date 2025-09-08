from fastapi import APIRouter, HTTPException, Depends, Query, Request
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import time
import asyncio

from utils.logger import logger
from utils.auth_utils import verify_and_get_user_id_from_jwt
from services.supabase import DBConnection
from utils.pagination import PaginationParams

from .template_service import (
    get_template_service,
    AgentTemplate,
    TemplateNotFoundError,
    TemplateAccessDeniedError,
    SunaDefaultAgentTemplateError
)
from .installation_service import (
    get_installation_service,
    TemplateInstallationRequest,
    TemplateInstallationResult,
    TemplateInstallationError,
    InvalidCredentialError
)
from .utils import format_template_for_response

router = APIRouter()

db: Optional[DBConnection] = None

# Simple in-memory rate limiter (per-process) for preview endpoints
# NOTE: For multi-instance deployments, move this to a shared store (Redis) for correctness.
_preview_rate_state: Dict[str, Dict[str, Any]] = {}
_rate_lock = asyncio.Lock()
PREVIEW_LIMIT_PER_MINUTE = 10

async def _check_preview_rate_limit(user_id: str) -> None:
    now = int(time.time())
    window = 60
    async with _rate_lock:
        st = _preview_rate_state.get(user_id)
        if not st or now >= st.get("reset", 0):
            _preview_rate_state[user_id] = {"count": 0, "reset": now + window}
            st = _preview_rate_state[user_id]
        if st["count"] >= PREVIEW_LIMIT_PER_MINUTE:
            retry_after = max(1, st["reset"] - now)
            raise HTTPException(status_code=429, detail={
                "message": "Too many preview requests. Please wait a bit and try again.",
                "retry_after": retry_after,
                "limit_per_minute": PREVIEW_LIMIT_PER_MINUTE,
            })
        st["count"] += 1


class CreateTemplateRequest(BaseModel):
    agent_id: str
    make_public: bool = False
    tags: Optional[List[str]] = None


class InstallTemplateRequest(BaseModel):
    template_id: str
    instance_name: Optional[str] = None
    custom_system_prompt: Optional[str] = None
    profile_mappings: Optional[Dict[str, str]] = None
    custom_mcp_configs: Optional[Dict[str, Dict[str, Any]]] = None


class PublishTemplateRequest(BaseModel):
    tags: Optional[List[str]] = None


class TemplateResponse(BaseModel):
    template_id: str
    creator_id: str
    name: str
    description: Optional[str] = None
    system_prompt: str
    mcp_requirements: List[Dict[str, Any]]
    agentpress_tools: Dict[str, Any]
    tags: List[str]
    is_public: bool
    is_kortix_team: Optional[bool] = False
    marketplace_published_at: Optional[str] = None
    download_count: int
    created_at: str
    updated_at: str
    avatar: Optional[str]
    avatar_color: Optional[str]
    profile_image_url: Optional[str] = None
    icon_name: Optional[str] = None
    icon_color: Optional[str] = None
    icon_background: Optional[str] = None
    metadata: Dict[str, Any]
    creator_name: Optional[str] = None


class InstallationResponse(BaseModel):
    status: str
    instance_id: Optional[str] = None
    name: Optional[str] = None
    missing_regular_credentials: List[Dict[str, Any]] = []
    missing_custom_configs: List[Dict[str, Any]] = []
    template_info: Optional[Dict[str, Any]] = None


class TryChatMessage(BaseModel):
    role: str
    content: str


class TryChatRequest(BaseModel):
    # Either provide a single message or a full messages array
    message: Optional[str] = None
    messages: Optional[List[TryChatMessage]] = None
    # Optional overrides
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 600
    top_p: Optional[float] = 0.9


class TryChatResponse(BaseModel):
    reply: str
    model: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None


def initialize(database: DBConnection):
    global db
    db = database


async def validate_template_ownership_and_get(template_id: str, user_id: str) -> AgentTemplate:
    template_service = get_template_service(db)
    template = await template_service.get_template(template_id)
    
    if not template:
        logger.warning(f"Template {template_id} not found")
        raise HTTPException(status_code=404, detail="Template not found")
    
    if template.creator_id != user_id:
        logger.warning(f"User {user_id} attempted to access template {template_id} owned by {template.creator_id}")
        raise HTTPException(status_code=403, detail="You don't have permission to access this template")
    
    return template


async def validate_template_access_and_get(template_id: str, user_id: str) -> AgentTemplate:
    template_service = get_template_service(db)
    template = await template_service.get_template(template_id)
    
    if not template:
        logger.warning(f"Template {template_id} not found")
        raise HTTPException(status_code=404, detail="Template not found")
    
    if template.creator_id != user_id and not template.is_public:
        logger.warning(f"User {user_id} attempted to access private template {template_id} owned by {template.creator_id}")
        raise HTTPException(status_code=403, detail="Access denied to private template")
    
    return template


async def validate_agent_ownership(agent_id: str, user_id: str) -> Dict[str, Any]:
    template_service = get_template_service(db)
    agent = await template_service._get_agent_by_id(agent_id)
    
    if not agent:
        logger.warning(f"Agent {agent_id} not found")
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if agent['account_id'] != user_id:
        logger.warning(f"User {user_id} attempted to access agent {agent_id} owned by {agent['account_id']}")
        raise HTTPException(status_code=403, detail="You don't have permission to access this agent")
    
    return agent


@router.post("", response_model=Dict[str, str])
async def create_template_from_agent(
    request: CreateTemplateRequest,
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    try:
        await validate_agent_ownership(request.agent_id, user_id)
        
        logger.debug(f"User {user_id} creating template from agent {request.agent_id}")
        
        template_service = get_template_service(db)
        
        template_id = await template_service.create_from_agent(
            agent_id=request.agent_id,
            creator_id=user_id,
            make_public=request.make_public,
            tags=request.tags
        )
        
        logger.debug(f"Successfully created template {template_id} from agent {request.agent_id}")
        return {"template_id": template_id}
        
    except HTTPException:
        raise
    except TemplateNotFoundError as e:
        logger.warning(f"Template creation failed - not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except TemplateAccessDeniedError as e:
        logger.warning(f"Template creation failed - access denied: {e}")
        raise HTTPException(status_code=403, detail=str(e))
    except SunaDefaultAgentTemplateError as e:
        logger.warning(f"Template creation failed - Suna default agent: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating template from agent {request.agent_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{template_id}/publish")
async def publish_template(
    template_id: str,
    request: PublishTemplateRequest,
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    try:
        template = await validate_template_ownership_and_get(template_id, user_id)
        
        logger.debug(f"User {user_id} publishing template {template_id}")
        
        template_service = get_template_service(db)
        
        success = await template_service.publish_template(template_id, user_id)
        
        if not success:
            logger.warning(f"Failed to publish template {template_id} for user {user_id}")
            raise HTTPException(status_code=500, detail="Failed to publish template")
        
        logger.debug(f"Successfully published template {template_id}")
        return {"message": "Template published successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error publishing template {template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{template_id}/unpublish")
async def unpublish_template(
    template_id: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    try:
        template = await validate_template_ownership_and_get(template_id, user_id)
        
        logger.debug(f"User {user_id} unpublishing template {template_id}")
        
        template_service = get_template_service(db)
        
        success = await template_service.unpublish_template(template_id, user_id)
        
        if not success:
            logger.warning(f"Failed to unpublish template {template_id} for user {user_id}")
            raise HTTPException(status_code=500, detail="Failed to unpublish template")
        
        logger.debug(f"Successfully unpublished template {template_id}")
        return {"message": "Template unpublished successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unpublishing template {template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    try:
        template = await validate_template_ownership_and_get(template_id, user_id)
        
        logger.debug(f"User {user_id} deleting template {template_id}")
        
        template_service = get_template_service(db)
        
        success = await template_service.delete_template(template_id, user_id)
        
        if not success:
            logger.warning(f"Failed to delete template {template_id} for user {user_id}")
            raise HTTPException(status_code=500, detail="Failed to delete template")
        
        logger.debug(f"Successfully deleted template {template_id}")
        return {"message": "Template deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting template {template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/install", response_model=InstallationResponse)
async def install_template(
    request: InstallTemplateRequest,
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    try:
        await validate_template_access_and_get(request.template_id, user_id)
        client = await db.client
        from agent.utils import check_agent_count_limit
        limit_check = await check_agent_count_limit(client, user_id)
        
        if not limit_check['can_create']:
            error_detail = {
                "message": f"Maximum of {limit_check['limit']} agents allowed for your current plan. You have {limit_check['current_count']} agents.",
                "current_count": limit_check['current_count'],
                "limit": limit_check['limit'],
                "tier_name": limit_check['tier_name'],
                "error_code": "AGENT_LIMIT_EXCEEDED"
            }
            logger.warning(f"Agent limit exceeded for account {user_id}: {limit_check['current_count']}/{limit_check['limit']} agents")
            raise HTTPException(status_code=402, detail=error_detail)
        
        logger.debug(f"User {user_id} installing template {request.template_id}")
        
        installation_service = get_installation_service(db)
        
        install_request = TemplateInstallationRequest(
            template_id=request.template_id,
            account_id=user_id,
            instance_name=request.instance_name,
            custom_system_prompt=request.custom_system_prompt,
            profile_mappings=request.profile_mappings,
            custom_mcp_configs=request.custom_mcp_configs
        )
        
        result = await installation_service.install_template(install_request)
        
        logger.debug(f"Successfully installed template {request.template_id} as instance {result.instance_id}")
        
        return InstallationResponse(
            status=result.status,
            instance_id=result.instance_id,
            name=result.name,
            missing_regular_credentials=result.missing_regular_credentials,
            missing_custom_configs=result.missing_custom_configs,
            template_info=result.template_info
        )
        
    except HTTPException:
        raise
    except TemplateInstallationError as e:
        logger.warning(f"Template installation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except InvalidCredentialError as e:
        logger.warning(f"Template installation failed - invalid credentials: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error installing template {request.template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


from utils.pagination import PaginationParams

class MarketplacePaginationInfo(BaseModel):
    current_page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool

class MarketplaceTemplatesResponse(BaseModel):
    templates: List[TemplateResponse]
    pagination: MarketplacePaginationInfo

@router.get("/marketplace", response_model=MarketplaceTemplatesResponse)
async def get_marketplace_templates(
    page: Optional[int] = Query(1, ge=1, description="Page number (1-based)"),
    limit: Optional[int] = Query(20, ge=1, le=100, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search term for name and description"),
    tags: Optional[str] = Query(None, description="Comma-separated list of tags to filter by"),
    is_kortix_team: Optional[bool] = Query(None, description="Filter for Kortix team templates"),
    mine: Optional[bool] = Query(None, description="Filter to show only user's own templates"),
    sort_by: Optional[str] = Query("download_count", description="Sort field: download_count, newest, name"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc, desc"),
    request: Request = None
):
    try:
        from templates.services.template_service import TemplateService, MarketplaceFilters
        creator_id_filter = None
        if mine:
            try:
                from utils.auth_utils import verify_and_get_user_id_from_jwt
                user_id = await verify_and_get_user_id_from_jwt(request)
                creator_id_filter = user_id
            except Exception as e:
                raise HTTPException(status_code=401, detail="Authentication required for 'mine' filter")
        
        tags_list = []
        if tags:
            if isinstance(tags, str):
                tags_list = [tag.strip() for tag in tags.split(',') if tag.strip()]

        pagination_params = PaginationParams(
            page=page,
            page_size=limit
        )
        
        filters = MarketplaceFilters(
            search=search,
            tags=tags_list,
            is_kortix_team=is_kortix_team,
            creator_id=creator_id_filter,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        client = await db.client
        template_service = TemplateService(client)
        paginated_result = await template_service.get_marketplace_templates_paginated(
            pagination_params=pagination_params,
            filters=filters
        )
        
        template_responses = []
        for template_data in paginated_result.data:
            template_response = TemplateResponse(**template_data)
            template_responses.append(template_response)
        
        return MarketplaceTemplatesResponse(
            templates=template_responses,
            pagination=MarketplacePaginationInfo(
                current_page=paginated_result.pagination.current_page,
                page_size=paginated_result.pagination.page_size,
                total_items=paginated_result.pagination.total_items,
                total_pages=paginated_result.pagination.total_pages,
                has_next=paginated_result.pagination.has_next,
                has_previous=paginated_result.pagination.has_previous
            )
        )
        
    except Exception as e:
        logger.error(f"Error getting marketplace templates: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/my", response_model=MarketplaceTemplatesResponse)
async def get_my_templates(
    page: Optional[int] = Query(1, ge=1, description="Page number (1-based)"),
    limit: Optional[int] = Query(20, ge=1, le=100, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search term for name and description"),
    sort_by: Optional[str] = Query("created_at", description="Sort field: created_at, name, download_count"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc, desc"),
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    try:
        from templates.services.template_service import TemplateService, MarketplaceFilters
        
        pagination_params = PaginationParams(
            page=page,
            page_size=limit
        )
        
        filters = MarketplaceFilters(
            search=search,
            creator_id=user_id,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        client = await db.client
        template_service = TemplateService(client)
        
        paginated_result = await template_service.get_user_templates_paginated(
            pagination_params=pagination_params,
            filters=filters
        )
        
        template_responses = []
        for template_data in paginated_result.data:
            template_response = TemplateResponse(**template_data)
            template_responses.append(template_response)
        
        return MarketplaceTemplatesResponse(
            templates=template_responses,
            pagination=MarketplacePaginationInfo(
                current_page=paginated_result.pagination.current_page,
                page_size=paginated_result.pagination.page_size,
                total_items=paginated_result.pagination.total_items,
                total_pages=paginated_result.pagination.total_pages,
                has_next=paginated_result.pagination.has_next,
                has_previous=paginated_result.pagination.has_previous
            )
        )
        
    except Exception as e:
        logger.error(f"Error getting templates for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/public/{template_id}", response_model=TemplateResponse)
async def get_public_template(template_id: str):
    """Get a public template by ID without authentication"""
    try:
        logger.info(f"Attempting to fetch public template: {template_id}")
        
        # Validate template_id format (should be UUID)
        if not template_id or len(template_id) < 10:
            logger.warning(f"Invalid template_id format: {template_id}")
            raise HTTPException(status_code=404, detail="Template not found")
        
        template_service = get_template_service(db)
        
        try:
            template = await template_service.get_template(template_id)
        except Exception as db_error:
            logger.error(f"Database error getting template {template_id}: {db_error}")
            raise HTTPException(status_code=404, detail="Template not found")
        
        if not template:
            logger.warning(f"Template {template_id} not found in database")
            raise HTTPException(status_code=404, detail="Template not found")
        
        logger.info(f"Template {template_id} found, is_public: {template.is_public}")
        
        if not template.is_public:
            logger.warning(f"Template {template_id} is not public (is_public={template.is_public})")
            raise HTTPException(status_code=404, detail="Template not found")
        
        logger.info(f"Successfully returning public template {template_id}: {template.name}")
        
        return TemplateResponse(**format_template_for_response(template))
        
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions as-is
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error getting public template {template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    try:
        template = await validate_template_access_and_get(template_id, user_id)
        
        logger.debug(f"User {user_id} accessing template {template_id}")
        
        return TemplateResponse(**format_template_for_response(template))
        
    except HTTPException:
        raise
    except TemplateAccessDeniedError as e:
        logger.warning(f"Access denied to template {template_id} for user {user_id}: {e}")
        raise HTTPException(status_code=403, detail="Access denied to template")
    except Exception as e:
        logger.error(f"Error getting template {template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


# Share link functionality removed - now using direct template ID URLs for simplicity 


@router.post("/{template_id}/try-chat", response_model=TryChatResponse)
async def try_chat_with_template(
    template_id: str,
    request: TryChatRequest,
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    """
    Ephemeral try-in-chat for a template without installing.

    Constraints/safety:
    - Allowed only if user owns the template or the template is public
    - Uses the template's system_prompt and model; tools are disabled for preview
    - Small token + temperature defaults
    """
    try:
        await _check_preview_rate_limit(user_id)
        template = await validate_template_access_and_get(template_id, user_id)

        # Build messages array: include system prompt + user input(s)
        messages: List[Dict[str, Any]] = []
        system_prompt = template.system_prompt or ""
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        # Accept either a single message or multiple
        if request.messages and len(request.messages) > 0:
            for m in request.messages:
                role = m.role if m.role in ["user", "assistant"] else "user"
                content = m.content or ""
                if content:
                    messages.append({"role": role, "content": content})
        else:
            # fallback to single message
            user_msg = (request.message or "Give me a one-sentence overview of what you can do.").strip()
            messages.append({"role": "user", "content": user_msg})

        # Resolve model from template config
        # Default to GPT-5 Mini for preview if template model is not set
        template_model = template.config.get("model") or "openai/gpt-5-mini"

        # Make a short, tool-free completion
        from services.llm import make_llm_api_call
        # Determine top_p usage: avoid for GPT-5 models
        use_top_p = request.top_p if (request.top_p is not None and "gpt-5" not in template_model) else None

        llm_response = await make_llm_api_call(
            messages=messages,
            model_name=template_model,
            temperature=request.temperature if request.temperature is not None else 0.7,
            max_tokens=request.max_tokens if request.max_tokens is not None else 600,
            tools=None,
            tool_choice="none",
            stream=False,
            top_p=use_top_p,
        )

        # Extract reply text robustly from LiteLLM ModelResponse
        reply_text = None
        try:
            # Primary path
            choice = llm_response.choices[0]
            content = None
            # Support both attribute and dict access
            if hasattr(choice, "message") and getattr(choice, "message") is not None:
                msg = getattr(choice, "message")
                content = getattr(msg, "content", None)
                if content is None and isinstance(msg, dict):
                    content = msg.get("content")
            elif isinstance(choice, dict):
                message_obj = choice.get("message") or {}
                content = message_obj.get("content")

            # Handle content formats
            if isinstance(content, list):
                parts = []
                for c in content:
                    if isinstance(c, dict) and c.get("type") in ("text", "output_text"):
                        parts.append(c.get("text") or c.get("output_text") or "")
                    elif isinstance(c, str):
                        parts.append(c)
                merged = "\n".join([p for p in parts if p])
                reply_text = merged if merged else None
            elif isinstance(content, str):
                reply_text = content or None

            # Provider-specific conveniences
            if not reply_text:
                # Many providers include a convenience field
                alt = getattr(llm_response, "output_text", None)
                if not alt and hasattr(llm_response, "model_dump"):
                    try:
                        dump = llm_response.model_dump()
                        alt = dump.get("output_text") or dump.get("content")
                        if not alt and dump.get("choices"):
                            m = dump["choices"][0].get("message", {})
                            alt = m.get("content")
                    except Exception:
                        alt = None
                if isinstance(alt, list):
                    alt = "\n".join([str(a) for a in alt if a])
                if isinstance(alt, str) and alt.strip():
                    reply_text = alt
        except Exception:
            reply_text = None

        if not reply_text:
            # Final fallback: guard against leaking raw object string; provide friendly note
            reply_text = "(No preview text returned by the model.)"

        # Extract usage if available
        usage = None
        try:
            usage = getattr(llm_response, "usage", None)
            if usage and not isinstance(usage, dict):
                usage = usage.model_dump() if hasattr(usage, "model_dump") else dict(usage)
        except Exception:
            usage = None

        return TryChatResponse(
            reply=reply_text,
            model=template_model,
            usage=usage,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in try-chat for template {template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{template_id}/try-chat/stream")
async def try_chat_stream(
    template_id: str,
    request: TryChatRequest,
    user_id: str = Depends(verify_and_get_user_id_from_jwt)
):
    """
    Streaming (SSE) variant of try-chat for faster perceived latency.

    Emits lines prefixed with 'data: ' where JSON payload includes:
    { "type": "chunk" | "done" | "error", "delta"?: string, "usage"?: any }
    """
    try:
        await _check_preview_rate_limit(user_id)
        template = await validate_template_access_and_get(template_id, user_id)

        messages: List[Dict[str, Any]] = []
        system_prompt = template.system_prompt or ""
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        if request.messages and len(request.messages) > 0:
            for m in request.messages:
                role = m.role if m.role in ["user", "assistant"] else "user"
                content = m.content or ""
                if content:
                    messages.append({"role": role, "content": content})
        else:
            user_msg = (request.message or "Give me a one-sentence overview of what you can do.").strip()
            messages.append({"role": "user", "content": user_msg})

        template_model = template.config.get("model") or "openai/gpt-5-mini"

        from services.llm import make_llm_api_call

        async def event_generator():
            try:
                # Avoid top_p for GPT-5
                use_top_p = request.top_p if (request.top_p is not None and "gpt-5" not in template_model) else None
                stream = await make_llm_api_call(
                    messages=messages,
                    model_name=template_model,
                    temperature=request.temperature if request.temperature is not None else 0.7,
                    max_tokens=request.max_tokens if request.max_tokens is not None else 600,
                    tools=None,
                    tool_choice="none",
                    stream=True,
                    top_p=use_top_p,
                )

                async for chunk in stream:  # LiteLLM yields dict-like chunks
                    try:
                        # Try to extract delta text in a provider-agnostic way
                        delta = None
                        if isinstance(chunk, dict):
                            # OpenAI-like
                            ch = chunk.get("choices", [{}])[0]
                            if ch:
                                delta = ch.get("delta", {}).get("content") or ch.get("message", {}).get("content")
                        else:
                            # Fallback to attribute access
                            choices = getattr(chunk, "choices", None)
                            if choices:
                                ch0 = choices[0]
                                delta_obj = getattr(ch0, "delta", None) or getattr(ch0, "message", None)
                                if delta_obj is not None:
                                    delta = getattr(delta_obj, "content", None)
                        if delta:
                            yield f"data: {{\"type\":\"chunk\",\"delta\":{json_dumps(delta)} }}\n\n"
                    except Exception:
                        # Skip malformed chunk
                        continue
                # Done signal
                yield "data: {\"type\":\"done\"}\n\n"
            except HTTPException as he:
                detail = he.detail if isinstance(he.detail, dict) else {"message": str(he.detail)}
                yield f"data: {{\"type\":\"error\",\"error\":{json_dumps(detail)} }}\n\n"
            except Exception as e:
                yield f"data: {{\"type\":\"error\",\"error\":{{\"message\":{json_dumps(str(e))}}}}}\n\n"

        # Local minimal JSON serializer (avoid importing orjson)
        def json_dumps(s: Any) -> str:
            if isinstance(s, str):
                return '"' + s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n') + '"'
            try:
                import json
                return json.dumps(s)
            except Exception:
                return '""'

        return StreamingResponse(event_generator(), media_type="text/event-stream")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in try-chat stream for template {template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")