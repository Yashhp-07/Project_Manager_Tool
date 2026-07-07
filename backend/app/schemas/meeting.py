"""Pydantic schemas for Meeting requests and responses."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.task import TaskResponse


class MeetingCreate(BaseModel):
    """Schema for creating a meeting from a user-provided transcript."""

    title: str | None = None
    transcript: str
    meeting_date: datetime


class MeetingResponse(BaseModel):
    """Schema for meeting responses returned to clients."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    transcript: str
    meeting_date: datetime
    created_at: datetime
    tasks: list[TaskResponse]
