"""SQLAlchemy model registry — import all models here for Alembic discovery."""

from app.models.meeting import Meeting
from app.models.task import Task
from app.models.user import User

__all__ = ["Meeting", "Task", "User"]
