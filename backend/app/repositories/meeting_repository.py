"""Repository for Meeting database operations."""

import uuid

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import DatabaseException
from app.models.meeting import Meeting


class MeetingRepository:
    """Handles database access for the Meeting model."""

    async def create(self, db: AsyncSession, meeting: Meeting) -> Meeting:
        """Add a new meeting to the session and return it with generated fields."""
        try:
            db.add(meeting)
            await db.flush()
            await db.refresh(meeting)
            return meeting
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to create meeting: {exc}") from exc

    async def get_by_id(
        self, db: AsyncSession, meeting_id: uuid.UUID,
    ) -> Meeting | None:
        """Fetch a single meeting by id, eagerly loading its tasks."""
        try:
            stmt = (
                select(Meeting)
                .options(selectinload(Meeting.tasks))
                .where(Meeting.id == meeting_id)
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to fetch meeting {meeting_id}: {exc}") from exc

    async def get_meeting_date(
        self, db: AsyncSession, meeting_id: uuid.UUID,
    ) -> Meeting | None:
        """Fetch only the meeting_date for a meeting — lightweight query."""
        try:
            stmt = select(Meeting.meeting_date).where(Meeting.id == meeting_id)
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to fetch meeting date for {meeting_id}: {exc}") from exc

    async def list_all(
        self, db: AsyncSession, search: str | None = None,
    ) -> list[Meeting]:
        """Fetch all meetings ordered by created_at descending.

        No eager-loading of tasks — this is for lightweight list views.
        Supports optional case-insensitive title search via ILIKE.
        """
        try:
            stmt = select(Meeting).order_by(Meeting.created_at.desc())

            if search:
                stmt = stmt.where(Meeting.title.ilike(f"%{search}%"))

            result = await db.execute(stmt)
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to list meetings: {exc}") from exc
