"""Centralized logging configuration."""

import logging
import sys

from app.core.config import settings


def setup_logging() -> None:
    """Configure the root logger for the application.

    Sets log level, format, and stream handler.  Called once at startup.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        stream=sys.stdout,
    )

    if settings.api_key:
        logging.getLogger("httpx").setLevel(logging.WARNING)


logger = logging.getLogger("project_manager")
