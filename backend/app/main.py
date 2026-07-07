"""Application entry point."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.api.v1 import router as api_v1_router
from app.core.config import settings
from app.core.exceptions import (
    DatabaseException,
    LLMExtractionException,
    NotFoundException,
    ValidationException,
)
from app.core.logger import logger, setup_logging


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown lifecycle."""
    setup_logging()
    logger.info("Application started")
    yield
    logger.info("Application shutting down")


app = FastAPI(
    title="Mini AI Project Manager",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router)


@app.exception_handler(NotFoundException)
async def not_found_handler(
    request: Request, exc: NotFoundException,
) -> JSONResponse:
    """Convert NotFoundException to a 404 response."""
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(ValidationException)
async def validation_handler(
    request: Request, exc: ValidationException,
) -> JSONResponse:
    """Convert ValidationException to a 422 response."""
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(LLMExtractionException)
async def llm_extraction_handler(
    request: Request, exc: LLMExtractionException,
) -> JSONResponse:
    """Convert LLMExtractionException to a 502 response."""
    # Do not leak exc.raw_output to the client.
    logger.error("LLM Extraction failed: %s | Raw output: %s", exc, getattr(exc, 'raw_output', 'N/A'))
    return JSONResponse(status_code=502, content={"detail": str(exc)})


@app.exception_handler(DatabaseException)
async def database_handler(
    request: Request, exc: DatabaseException,
) -> JSONResponse:
    """Convert DatabaseException to a 500 response."""
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.exception_handler(Exception)
async def unhandled_handler(
    request: Request, exc: Exception,
) -> JSONResponse:
    """Catch-all for any unhandled exception — logs and returns a safe 500."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return a simple health-check response."""
    return {"status": "ok"}
