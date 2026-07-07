"""Repository for Task database operations."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import Priority, TaskStatus
from app.models.task import Task


class TaskRepository:
    """Handles database access for the Task model."""

    async def create(self, db: AsyncSession, task: Task) -> Task:
        """Add a single task to the session and return it with generated fields."""
        db.add(task)
        await db.flush()
        await db.refresh(task)
        return task

    async def create_many(self, db: AsyncSession, tasks: list[Task]) -> list[Task]:
        """Add multiple tasks in one batch and return them with generated fields."""
        db.add_all(tasks)
        await db.flush()
        for task in tasks:
            await db.refresh(task)
        return tasks

    async def get_by_id(
        self, db: AsyncSession, task_id: uuid.UUID,
    ) -> Task | None:
        """Fetch a single task by id."""
        stmt = select(Task).where(Task.id == task_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_meeting(
        self, db: AsyncSession, meeting_id: uuid.UUID,
    ) -> list[Task]:
        """Fetch all tasks belonging to a meeting."""
        stmt = select(Task).where(Task.meeting_id == meeting_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def list_all(
        self,
        db: AsyncSession,
        filters: dict | None = None,
    ) -> list[Task]:
        """Fetch tasks with optional AND-combined filters.

        Supported filter keys: owner, status, priority.
        """
        stmt = select(Task)

        if filters:
            if "owner" in filters:
                stmt = stmt.where(Task.owners.any(filters["owner"]))
            if "status" in filters:
                stmt = stmt.where(Task.status == TaskStatus(filters["status"]))
            if "priority" in filters:
                stmt = stmt.where(Task.priority == Priority(filters["priority"]))

        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def update(
        self,
        db: AsyncSession,
        task_id: uuid.UUID,
        update_data: dict,
    ) -> Task | None:
        """Apply partial updates to a task and return the updated object."""
        result = await db.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            return None

        for key, value in update_data.items():
            setattr(task, key, value)

        await db.flush()
        await db.refresh(task)
        return task
