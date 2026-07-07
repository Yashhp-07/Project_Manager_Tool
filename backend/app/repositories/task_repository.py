"""Repository for Task database operations."""

import uuid

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import Priority, TaskStatus
from app.core.exceptions import DatabaseException, ValidationException
from app.models.task import Task


class TaskRepository:
    """Handles database access for the Task model."""

    async def create(self, db: AsyncSession, task: Task) -> Task:
        """Add a single task to the session and return it with generated fields."""
        try:
            db.add(task)
            await db.flush()
            await db.refresh(task)
            return task
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to create task: {exc}") from exc

    async def create_many(self, db: AsyncSession, tasks: list[Task]) -> list[Task]:
        """Add multiple tasks in one batch and return them with generated fields."""
        try:
            db.add_all(tasks)
            await db.flush()
            for task in tasks:
                await db.refresh(task)
            return tasks
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to create tasks: {exc}") from exc

    async def get_by_id(
        self, db: AsyncSession, task_id: uuid.UUID,
    ) -> Task | None:
        """Fetch a single task by id."""
        try:
            stmt = select(Task).where(Task.id == task_id)
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to fetch task {task_id}: {exc}") from exc

    async def list_by_meeting(
        self, db: AsyncSession, meeting_id: uuid.UUID,
    ) -> list[Task]:
        """Fetch all tasks belonging to a meeting."""
        try:
            stmt = select(Task).where(Task.meeting_id == meeting_id)
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to list tasks for meeting {meeting_id}: {exc}") from exc

    async def list_all(
        self,
        db: AsyncSession,
        filters: dict | None = None,
    ) -> list[Task]:
        """Fetch tasks with optional AND-combined filters.

        Supported filter keys: meeting_id, owner, status, priority.
        """
        try:
            stmt = select(Task)

            if filters:
                if "meeting_id" in filters:
                    stmt = stmt.where(Task.meeting_id == filters["meeting_id"])
                if "owner" in filters:
                    stmt = stmt.where(Task.owners.any(filters["owner"]))
                if "status" in filters:
                    try:
                        status_val = TaskStatus(filters["status"])
                    except ValueError as exc:
                        raise ValidationException(
                            f"Invalid status '{filters['status']}'. "
                            f"Valid values: {[e.value for e in TaskStatus]}",
                        ) from exc
                    stmt = stmt.where(Task.status == status_val)
                if "priority" in filters:
                    try:
                        priority_val = Priority(filters["priority"])
                    except ValueError as exc:
                        raise ValidationException(
                            f"Invalid priority '{filters['priority']}'. "
                            f"Valid values: {[e.value for e in Priority]}",
                        ) from exc
                    stmt = stmt.where(Task.priority == priority_val)

            result = await db.execute(stmt)
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to list tasks: {exc}") from exc

    async def update(
        self,
        db: AsyncSession,
        task_id: uuid.UUID,
        update_data: dict,
    ) -> Task | None:
        """Apply partial updates to a task and return the updated object."""
        try:
            result = await db.execute(select(Task).where(Task.id == task_id))
            task = result.scalar_one_or_none()
            if not task:
                return None

            for key, value in update_data.items():
                setattr(task, key, value)

            await db.flush()
            await db.refresh(task)
            return task
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to update task {task_id}: {exc}") from exc
