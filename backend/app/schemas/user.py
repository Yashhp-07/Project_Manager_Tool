"""Pydantic schemas for User responses."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict

from app.core.constants import UserRole


class UserResponse(BaseModel):
    """Schema for user data returned to clients."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str | None
    role: UserRole
