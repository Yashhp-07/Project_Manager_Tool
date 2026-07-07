"""Application-wide constants, enums, and default values."""

from enum import Enum


class Priority(str, Enum):
    """Task priority levels."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TaskStatus(str, Enum):
    """Task lifecycle states."""

    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class UserRole(str, Enum):
    """User roles within the system."""

    ADMIN = "admin"
    MANAGER = "manager"
    MEMBER = "member"


PRIORITY_ORDER: dict[Priority, int] = {
    Priority.LOW: 1,
    Priority.MEDIUM: 2,
    Priority.HIGH: 3,
}

DEFAULT_PAGE_SIZE: int = 20
MAX_PAGE_SIZE: int = 100
