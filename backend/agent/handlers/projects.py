from fastapi import APIRouter, Depends, HTTPException, Query
from utils.auth_utils import verify_and_get_user_id_from_jwt, verify_and_authorize_thread_access
from utils.logger import logger
from .. import utils
from typing import Optional

router = APIRouter()

@router.get('/projects')
async def list_projects(
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
    q: Optional[str] = Query(None, description="Search text for project name or description"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    include_counts: bool = Query(True, description="Include thread_count and message_count aggregations")
):
    """List projects for the authenticated user with optional search and counts."""
    client = await utils.db.client
    try:
        # Fetch projects for user
        query = client.table('projects').select('*').eq('account_id', user_id).order('created_at', desc=True)
        projects_result = await query.execute()
        projects = projects_result.data or []

        # In-memory search filter (small user project counts; optimize later with FTS)
        if q:
            q_lower = q.lower()
            projects = [p for p in projects if (p.get('name','') and q_lower in p.get('name','').lower()) or (p.get('description','') and q_lower in p.get('description','').lower())]

        total = len(projects)
        projects_paginated = projects[offset: offset + limit]

        # Collect counts + latest thread if needed
        thread_counts = {}
        message_counts = {}
        latest_threads = {}
        if include_counts and projects_paginated:
            project_ids = [p['project_id'] for p in projects_paginated]
            # Thread counts
            threads_result = await client.table('threads').select('project_id, thread_id, updated_at, created_at').in_('project_id', project_ids).execute()
            for t in threads_result.data or []:
                pid = t.get('project_id')
                thread_counts[pid] = thread_counts.get(pid, 0) + 1
                # Track latest thread by updated_at then created_at
                current = latest_threads.get(pid)
                if not current:
                    latest_threads[pid] = t
                else:
                    try:
                        cur_ts = current.get('updated_at') or current.get('created_at')
                        new_ts = t.get('updated_at') or t.get('created_at')
                        if new_ts and cur_ts and new_ts > cur_ts:
                            latest_threads[pid] = t
                    except Exception:
                        pass
            # Message counts (batch per project; simple loop)
            for pid in project_ids:
                try:
                    msg_count_res = await client.table('messages').select('message_id', count='exact').eq('project_id', pid).limit(1).execute()
                    # If messages table doesn't have project_id column fallback to thread aggregation
                    if msg_count_res.count is None:
                        # Fallback: sum across thread IDs for project
                        project_threads = [t.get('thread_id') for t in (threads_result.data or []) if t.get('project_id') == pid]
                        total_msgs = 0
                        for thid in project_threads:
                            msg_cnt_res = await client.table('messages').select('message_id', count='exact').eq('thread_id', thid).limit(1).execute()
                            total_msgs += msg_cnt_res.count or 0
                        message_counts[pid] = total_msgs
                    else:
                        message_counts[pid] = msg_count_res.count or 0
                except Exception:
                    # Fallback handled above
                    pass

        mapped = []
        for p in projects_paginated:
            pid = p['project_id']
            mapped.append({
                'project_id': pid,
                'name': p.get('name',''),
                'description': p.get('description',''),
                'is_public': p.get('is_public', False),
                'created_at': p.get('created_at'),
                'updated_at': p.get('updated_at'),
                'thread_count': thread_counts.get(pid, 0) if include_counts else None,
                'message_count': message_counts.get(pid, 0) if include_counts else None,
                'latest_thread_id': latest_threads.get(pid, {}).get('thread_id') if include_counts else None,
            })

        return {
            'projects': mapped,
            'pagination': {
                'total': total,
                'limit': limit,
                'offset': offset,
            }
        }
    except Exception as e:
        logger.error(f"Error listing projects for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to list projects")

@router.get('/projects/{project_id}')
async def get_project_detail(
    project_id: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
    include_threads: bool = Query(True, description="Include threads for this project")
):
    client = await utils.db.client
    try:
        proj_res = await client.table('projects').select('*').eq('project_id', project_id).single().execute()
        if not proj_res.data:
            raise HTTPException(status_code=404, detail="Project not found")
        project = proj_res.data
        if project.get('account_id') != user_id:
            # TODO: handle shared / public access later
            raise HTTPException(status_code=403, detail="Access denied")

        threads_data = []
        if include_threads:
            threads_res = await client.table('threads').select('*').eq('project_id', project_id).order('created_at', desc=True).execute()
            for t in threads_res.data or []:
                # message count per thread (cheap count)
                msg_cnt_res = await client.table('messages').select('message_id', count='exact').eq('thread_id', t['thread_id']).limit(1).execute()
                threads_data.append({
                    'thread_id': t['thread_id'],
                    'created_at': t.get('created_at'),
                    'updated_at': t.get('updated_at'),
                    'message_count': msg_cnt_res.count or 0,
                    'metadata': t.get('metadata', {}),
                    'is_public': t.get('is_public', False),
                })

        # total messages across project threads
        total_messages = sum(t['message_count'] for t in threads_data) if threads_data else 0

        return {
            'project': {
                'project_id': project['project_id'],
                'name': project.get('name',''),
                'description': project.get('description',''),
                'is_public': project.get('is_public', False),
                'created_at': project.get('created_at'),
                'updated_at': project.get('updated_at'),
                'total_messages': total_messages,
                'thread_count': len(threads_data),
            },
            'threads': threads_data if include_threads else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch project detail")