"""API v1 router aggregator."""

from fastapi import APIRouter

from app.api.v1.meetings import router as meetings_router
from app.api.v1.tasks import router as tasks_router

router = APIRouter(prefix="/api/v1")
router.include_router(meetings_router)
router.include_router(tasks_router)
