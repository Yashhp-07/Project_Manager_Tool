"""Repository for Meeting database operations."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.meeting import Meeting


class MeetingRepository:
    """Handles database access for the Meeting model."""

    async def create(self, db: AsyncSession, meeting: Meeting) -> Meeting:
        """Add a new meeting to the session and return it with generated fields."""
        db.add(meeting)
        await db.flush()
        await db.refresh(meeting)
        return meeting

    async def get_by_id(
        self, db: AsyncSession, meeting_id: uuid.UUID,
    ) -> Meeting | None:
        """Fetch a single meeting by id, eagerly loading its tasks."""
        stmt = (
            select(Meeting)
            .options(selectinload(Meeting.tasks))
            .where(Meeting.id == meeting_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
