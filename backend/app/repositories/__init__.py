"""Repository registry — import all repositories here for clean imports."""

from app.repositories.meeting_repository import MeetingRepository
from app.repositories.task_repository import TaskRepository

__all__ = [
    "MeetingRepository",
    "TaskRepository",
]
