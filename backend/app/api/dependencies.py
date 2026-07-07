"""FastAPI dependency injection for service instances."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.meeting_service import MeetingService
from app.services.task_service import TaskService


async def get_meeting_service(
    db: AsyncSession = Depends(get_db),
) -> MeetingService:
    """Provide a MeetingService instance scoped to the current request."""
    return MeetingService(db=db)


async def get_task_service(
    db: AsyncSession = Depends(get_db),
) -> TaskService:
    """Provide a TaskService instance scoped to the current request."""
    return TaskService(db=db)
