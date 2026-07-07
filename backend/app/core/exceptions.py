"""Domain-specific exceptions for the application."""


class NotFoundException(Exception):
    """Raised when a requested resource does not exist."""

    def __init__(self, entity_name: str, entity_id: str) -> None:
        self.entity_name = entity_name
        self.entity_id = entity_id
        super().__init__(f"{entity_name} with id '{entity_id}' not found")


class ValidationException(Exception):
    """Raised when input data fails validation."""

    def __init__(self, message: str) -> None:
        super().__init__(message)


class LLMExtractionException(Exception):
    """Raised when LLM output cannot be parsed or validated."""

    def __init__(self, message: str, raw_output: str | None = None) -> None:
        self.raw_output = raw_output
        super().__init__(message)


class DatabaseException(Exception):
    """Raised when a database operation fails."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
