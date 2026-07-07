"""Application-wide constants, enums, and default values."""

from enum import Enum


class Priority(str, Enum):
    """Task priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(str, Enum):
    """Task lifecycle states."""

    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    BLOCKED = "blocked"


class UserRole(str, Enum):
    """User roles within the system."""

    ADMIN = "admin"
    MANAGER = "manager"
    MEMBER = "member"


PRIORITY_ORDER: dict[Priority, int] = {
    Priority.LOW: 1,
    Priority.MEDIUM: 2,
    Priority.HIGH: 3,
    Priority.CRITICAL: 4,
}

DEFAULT_PAGE_SIZE: int = 20
MAX_PAGE_SIZE: int = 100
