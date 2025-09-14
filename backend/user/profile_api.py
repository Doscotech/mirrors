from fastapi import APIRouter, Depends, HTTPException
from utils.auth_utils import verify_and_get_user_id_from_jwt
from utils.logger import logger
from services.supabase import DBConnection
from services import billing
from services import redis as redis_service
import json

router = APIRouter()

PROFILE_PREFERENCES_KEY_PREFIX = "user:preferences:"

async def _get_preferences(user_id: str):
    try:
        client = await redis_service.get_client()
        raw = await client.get(f"{PROFILE_PREFERENCES_KEY_PREFIX}{user_id}")
        if raw:
            if isinstance(raw, bytes):
                raw = raw.decode('utf-8')
            return json.loads(raw)
    except Exception as e:
        logger.warning(f"Failed to load preferences for {user_id}: {e}")
    return {}

async def _set_preferences(user_id: str, prefs: dict):
    try:
        client = await redis_service.get_client()
        await client.set(f"{PROFILE_PREFERENCES_KEY_PREFIX}{user_id}", json.dumps(prefs))
    except Exception as e:
        logger.error(f"Failed to store preferences for {user_id}: {e}")

@router.get('/user/profile')
async def get_user_profile(user_id: str = Depends(verify_and_get_user_id_from_jwt)):
    """Aggregate user profile, subscription & usage, credential/profile counts (light)."""
    try:
        db = DBConnection()
        await db.initialize()
        client = await db.client

        # Base user/account info
        account_result = await client.schema('basejump').table('accounts').select(
            'id, primary_owner_user_id, personal_account, created_at'
        ).eq('primary_owner_user_id', user_id).limit(1).execute()
        account = account_result.data[0] if account_result.data else None

        # Subscription / usage
        subscription_info = None
        current_usage = None
        cost_limit = None
        try:
            subscription = await billing.get_user_subscription(user_id)
            subscription_info = subscription
            usage_info = await billing.get_user_usage(user_id)
            current_usage = usage_info.get('dollar_total') if usage_info else None
            cost_limit = usage_info.get('dollar_limit') if usage_info else None
        except Exception as e:
            logger.warning(f"Failed to gather billing info for {user_id}: {e}")

        # Credential profile count
        credential_profiles = 0
        try:
            profiles_result = await client.table('credential_profiles').select('id').eq('account_id', user_id).execute()
            credential_profiles = len(profiles_result.data or [])
        except Exception:
            pass

        preferences = await _get_preferences(user_id)

        return {
            'user_id': user_id,
            'account': account,
            'subscription': subscription_info,
            'current_usage': current_usage,
            'cost_limit': cost_limit,
            'credential_profile_count': credential_profiles,
            'preferences': preferences,
        }
    except Exception as e:
        logger.error(f"Error building profile for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to load profile")

@router.post('/user/preferences')
async def update_preferences(prefs: dict, user_id: str = Depends(verify_and_get_user_id_from_jwt)):
    """Update user preferences (stored in Redis)."""
    try:
        existing = await _get_preferences(user_id)
        existing.update(prefs)
        await _set_preferences(user_id, existing)
        return {'status': 'ok', 'preferences': existing}
    except Exception as e:
        logger.error(f"Failed to update preferences for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update preferences")