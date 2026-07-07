"""Business logic for User operations."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse


class UserService:
    """Encapsulates user business rules."""

    def __init__(self) -> None:
        self.repository = UserRepository()

    async def sync_owners(
        self, db: AsyncSession, owner_names: list[str],
    ) -> None:
        """Ensure every unique owner name has a matching User record.

        Idempotent — skips names that already exist.
        """
        if not owner_names:
            return

        existing = await self.repository.list_all(db)
        existing_names = {u.name for u in existing}

        for name in set(owner_names):
            if name not in existing_names:
                user = User(
                    name=name,
                    email=None,
                    role=UserRole.MEMBER,
                )
                await self.repository.create(db, user)

    async def list_users(self, db: AsyncSession) -> list[UserResponse]:
        """Return all users."""
        users = await self.repository.list_all(db)
        return [UserResponse.model_validate(u) for u in users]
