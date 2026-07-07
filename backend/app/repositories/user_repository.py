"""Repository for User database operations."""

import uuid

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DatabaseException
from app.models.user import User


class UserRepository:
    """Handles database access for the User model."""

    async def get_by_name(
        self, db: AsyncSession, name: str,
    ) -> User | None:
        """Fetch a single user by name."""
        try:
            stmt = select(User).where(User.name == name)
            result = await db.execute(stmt)
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to fetch user by name '{name}': {exc}") from exc

    async def create(self, db: AsyncSession, user: User) -> User:
        """Add a new user to the session and return it with generated fields."""
        try:
            db.add(user)
            await db.flush()
            await db.refresh(user)
            return user
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to create user '{user.name}': {exc}") from exc

    async def list_all(
        self, db: AsyncSession,
    ) -> list[User]:
        """Fetch all users ordered by name."""
        try:
            stmt = select(User).order_by(User.name)
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            raise DatabaseException(f"Failed to list users: {exc}") from exc
