"""Task API routes."""

import csv
import io
import uuid

from fastapi import APIRouter, Depends, Query
from starlette.responses import Response

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


@router.get("/export")
async def export_tasks_csv(
    owner: str | None = Query(None, description="Filter by owner name"),
    status: str | None = Query(None, description="Filter by task status"),
    priority: str | None = Query(None, description="Filter by priority level"),
    service: TaskService = Depends(get_task_service),
) -> Response:
    """Export tasks matching filters as a CSV file."""
    filters: dict[str, str] = {}
    if owner is not None:
        filters["owner"] = owner
    if status is not None:
        filters["status"] = status
    if priority is not None:
        filters["priority"] = priority

    tasks = await service.list_tasks(filters or None)

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "description", "owners", "due_date", "priority",
        "status", "confirmed", "evidence_quote",
        "created_at", "updated_at", "meeting_id",
    ])
    for t in tasks:
        writer.writerow([
            t.description,
            ", ".join(t.owners),
            t.due_date.isoformat() if t.due_date else "",
            t.priority.value,
            t.status.value,
            "yes" if t.confirmed else "no",
            t.evidence_quote or "",
            t.created_at.isoformat(),
            t.updated_at.isoformat(),
            str(t.meeting_id),
        ])

    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=tasks.csv",
        },
    )
