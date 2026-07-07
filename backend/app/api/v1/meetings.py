"""Meeting API routes."""

import uuid

from fastapi import APIRouter, Depends

from app.api.dependencies import get_meeting_service
from app.schemas.meeting import MeetingCreate, MeetingResponse
from app.services.meeting_service import MeetingService

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.post(
    "",
    response_model=MeetingResponse,
    status_code=201,
    responses={502: {"description": "LLM extraction failed"}},
)
async def create_meeting(
    body: MeetingCreate,
    service: MeetingService = Depends(get_meeting_service),
) -> MeetingResponse:
    """Create a meeting and extract tasks from its transcript via LLM."""
    return await service.create_meeting_from_transcript(body)


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse,
)
async def get_meeting(
    meeting_id: uuid.UUID,
    service: MeetingService = Depends(get_meeting_service),
) -> MeetingResponse:
    """Fetch a single meeting by id with its nested tasks."""
    return await service.get_meeting(meeting_id)
