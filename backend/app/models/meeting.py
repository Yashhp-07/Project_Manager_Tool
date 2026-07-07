"""Meeting ORM model."""

import uuid

from sqlalchemy import Column, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.base import Base


class Meeting(Base):
    """Represents a project meeting with its transcript."""

    __tablename__ = "meetings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    transcript = Column(Text, nullable=False)
    meeting_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False,
    )

    tasks = relationship("Task", back_populates="meeting", cascade="all, delete-orphan")
