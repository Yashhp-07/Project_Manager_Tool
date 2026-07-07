"""Pydantic schemas for User responses."""

import uuid

from pydantic import BaseModel, ConfigDict

from app.core.constants import UserRole


class UserResponse(BaseModel):
    """Schema for user responses returned to clients."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str
    role: UserRole
