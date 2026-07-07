"""Business logic for Task operations."""

import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DatabaseException, NotFoundException, ValidationException
from app.core.logger import logger
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
            meeting_date = await self.meeting_repository.get_meeting_date(
                self.db, task.meeting_id,
            )
            if meeting_date is None:
                raise NotFoundException("Meeting", str(task.meeting_id))
            self.validate_due_date(update_data.due_date, meeting_date)

        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            return TaskResponse.model_validate(task)

        task = await self.repository.update(self.db, task_id, update_dict)

        try:
            await self.db.commit()
        except Exception as exc:
            await self.db.rollback()
            logger.error("Failed to save task %s: %s", task_id, exc)
            raise DatabaseException("Failed to save task") from exc

        return TaskResponse.model_validate(task)

    @staticmethod
    def validate_due_date(
        due_date: datetime | None, meeting_date: datetime,
    ) -> None:
        """Ensure a task's due date is not before the related meeting date."""
        if due_date is None:
            return

        dd = due_date.replace(tzinfo=timezone.utc) if due_date.tzinfo is None else due_date
        md = meeting_date.replace(tzinfo=timezone.utc) if meeting_date.tzinfo is None else meeting_date

        if dd < md:
            raise ValidationException(
                f"Due date ({due_date.isoformat()}) cannot be "
                f"before meeting date ({meeting_date.isoformat()})",
            )
