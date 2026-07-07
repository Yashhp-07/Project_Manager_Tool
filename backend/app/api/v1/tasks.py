"""Task API routes."""

import uuid

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_task_service
from app.schemas.task import TaskResponse, TaskUpdate
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    owner: str | None = Query(None, description="Filter by owner name"),
    status: str | None = Query(None, description="Filter by task status"),
    priority: str | None = Query(None, description="Filter by priority level"),
    service: TaskService = Depends(get_task_service),
) -> list[TaskResponse]:
    """List tasks with optional AND-combined filters."""
    filters: dict[str, str] = {}
    if owner is not None:
        filters["owner"] = owner
    if status is not None:
        filters["status"] = status
    if priority is not None:
        filters["priority"] = priority

    return await service.list_tasks(filters or None)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    body: TaskUpdate,
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    """Partially update a task."""
    return await service.update_task(task_id, body)
