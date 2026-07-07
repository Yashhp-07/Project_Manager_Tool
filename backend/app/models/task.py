"""Task ORM model."""

import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship

from app.core.base import Base
from app.core.constants import Priority, TaskStatus


class Task(Base):
    """Represents a task extracted from a meeting transcript."""

    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
    )
    description = Column(Text, nullable=False)
    owners = Column(ARRAY(String), nullable=False, default=list)
    owner_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    due_date = Column(DateTime(timezone=True), nullable=True)
    priority = Column(Enum(Priority), default=Priority.MEDIUM, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.NOT_STARTED, nullable=False)
    confirmed = Column(Boolean, default=False, nullable=False)
    evidence_quote = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(),
        onupdate=func.now(), nullable=False,
    )

    meeting = relationship("Meeting", back_populates="tasks")
    owner_user = relationship("User", back_populates="tasks")
