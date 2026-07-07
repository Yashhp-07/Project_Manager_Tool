"""Business logic for Task operations."""

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ValidationException
from app.models.meeting import Meeting
from app.models.task import Task
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskResponse, TaskUpdate


class TaskService:
    """Encapsulates task business rules and persistence."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repository = TaskRepository()
        self.meeting_repository = MeetingRepository()

    async def list_tasks(
        self, filters: dict | None = None,
    ) -> list[TaskResponse]:
        """Return all tasks matching the given filters."""
        tasks = await self.repository.list_all(self.db, filters)
        return [TaskResponse.model_validate(t) for t in tasks]

    async def update_task(
        self, task_id: uuid.UUID, update_data: TaskUpdate,
    ) -> TaskResponse:
        """Apply partial updates to a task and persist the change."""
        task = await self.repository.get_by_id(self.db, task_id)
        if not task:
            raise NotFoundException("Task", str(task_id))

        if update_data.due_date is not None:
            result = await self.db.execute(
                select(Meeting.meeting_date).where(Meeting.id == task.meeting_id),
            )
            meeting_date = result.scalar_one()
            self.validate_due_date(update_data.due_date, meeting_date)

        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            return TaskResponse.model_validate(task)

        task = await self.repository.update(self.db, task_id, update_dict)

        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return TaskResponse.model_validate(task)

    @staticmethod
    def validate_due_date(
        due_date: datetime | None, meeting_date: datetime,
    ) -> None:
        """Ensure a task's due date is not before the related meeting date."""
        if due_date is not None and due_date < meeting_date:
            raise ValidationException(
                f"Due date ({due_date.isoformat()}) cannot be "
                f"before meeting date ({meeting_date.isoformat()})",
            )
