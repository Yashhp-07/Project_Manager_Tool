"""Pydantic schemas for Task requests and responses."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.constants import Priority, TaskStatus


class TaskCreate(BaseModel):
    """Internal schema for creating a task after LLM extraction."""

    description: str
    owners: list[str]
    due_date: datetime | None = None
    priority: Priority = Priority.MEDIUM
    evidence_quote: str | None = None
    meeting_id: uuid.UUID


class TaskUpdate(BaseModel):
    """Schema for partial task updates (PATCH)."""

    description: str | None = None
    owners: list[str] | None = None
    owner_user_id: uuid.UUID | None = None
    due_date: datetime | None = None
    priority: Priority | None = None
    status: TaskStatus | None = None
    confirmed: bool | None = None


class TaskResponse(BaseModel):
    """Schema for task responses returned to clients."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    meeting_id: uuid.UUID
    description: str
    owners: list[str]
    owner_user_id: uuid.UUID | None
    due_date: datetime | None
    priority: Priority
    status: TaskStatus
    confirmed: bool
    evidence_quote: str | None
    created_at: datetime
    updated_at: datetime
