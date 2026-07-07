"""Business logic for Meeting operations."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.meeting import Meeting
from app.models.task import Task
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.meeting import MeetingCreate, MeetingResponse
from app.schemas.task import TaskCreate
from app.services.llm_service import LLMService
from app.services.task_service import TaskService


class MeetingService:
    """Encapsulates meeting business rules and orchestration."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.meeting_repository = MeetingRepository()
        self.task_repository = TaskRepository()
        self.llm_service = LLMService()

    async def create_meeting_from_transcript(
        self, data: MeetingCreate,
    ) -> MeetingResponse:
        """Create a meeting and extract tasks from its transcript."""
        meeting = Meeting(
            title=data.title or "",
            transcript=data.transcript,
            meeting_date=data.meeting_date,
        )
        meeting = await self.meeting_repository.create(self.db, meeting)

        raw_tasks = await self.llm_service.extract_tasks(
            data.transcript, data.meeting_date,
        )

        validated_tasks: list[TaskCreate] = []
        for raw in raw_tasks:
            raw["meeting_id"] = meeting.id
            validated = TaskCreate.model_validate(raw)
            TaskService.validate_due_date(validated.due_date, data.meeting_date)
            validated_tasks.append(validated)

        task_objects = [
            Task(
                meeting_id=meeting.id,
                description=t.description,
                owners=t.owners,
                due_date=t.due_date,
                priority=t.priority,
                evidence_quote=t.evidence_quote,
            )
            for t in validated_tasks
        ]

        await self.task_repository.create_many(self.db, task_objects)

        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        meeting = await self.meeting_repository.get_by_id(self.db, meeting.id)
        return MeetingResponse.model_validate(meeting)

    async def get_meeting(self, meeting_id: uuid.UUID) -> MeetingResponse:
        """Fetch a single meeting by id with its tasks."""
        meeting = await self.meeting_repository.get_by_id(self.db, meeting_id)
        if not meeting:
            raise NotFoundException("Meeting", str(meeting_id))
        return MeetingResponse.model_validate(meeting)
