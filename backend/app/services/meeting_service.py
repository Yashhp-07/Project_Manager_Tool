"""Business logic for Meeting operations."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DatabaseException, NotFoundException, ValidationException
from app.core.logger import logger
from app.models.meeting import Meeting
from app.models.task import Task
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.meeting import MeetingCreate, MeetingResponse, MeetingSummaryResponse
from app.schemas.task import TaskCreate
from app.services.llm_service import LLMService
from app.services.task_service import TaskService
from app.services.user_service import UserService


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
        # 1. Call LLM extraction first. This is a slow network call.
        #    Because no DB queries have been executed yet, this does NOT
        #    acquire a connection from the asyncpg pool, preventing exhaustion.
        try:
            generated_title, raw_tasks = await self.llm_service.extract_tasks(
                data.transcript, data.meeting_date,
            )
        except Exception as exc:
            logger.error("Failed to extract tasks from LLM: %s", exc)
            raise

        # 2. Validate LLM output before any DB writes
        validated_tasks: list[TaskCreate] = []
        for raw in raw_tasks:
            validated = TaskCreate.model_validate(raw)
            TaskService.validate_due_date(validated.due_date, data.meeting_date)
            validated_tasks.append(validated)

        if not validated_tasks:
            raise ValidationException(
                "No tasks could be extracted from this transcript.",
            )

        # 3. Use user provided title, fallback to LLM generated, fallback to default
        title = data.title or generated_title or "Untitled Meeting"

        # 4. Create the meeting and tasks in a single atomic transaction
        meeting = Meeting(
            title=title,
            transcript=data.transcript,
            meeting_date=data.meeting_date,
        )

        try:
            meeting = await self.meeting_repository.create(self.db, meeting)

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

            # Sync extracted owner names to the users table
            all_owners = list({
                owner
                for t in validated_tasks
                for owner in t.owners
            })
            if all_owners:
                user_service = UserService()
                await user_service.sync_owners(self.db, all_owners)

            await self.db.commit()
        except Exception as exc:
            await self.db.rollback()
            # Handle case where meeting wasn't flushed successfully and lacks id
            mid = getattr(meeting, 'id', 'unknown')
            logger.error("Failed to commit meeting %s: %s", mid, exc)
            raise DatabaseException("Failed to save meeting and tasks") from exc

        meeting = await self.meeting_repository.get_by_id(self.db, meeting.id)
        return MeetingResponse.model_validate(meeting)

    async def list_meetings(
        self, search: str | None = None,
    ) -> list[MeetingSummaryResponse]:
        """Return all meetings as lightweight summaries (no tasks)."""
        meetings = await self.meeting_repository.list_all(self.db, search)
        return [MeetingSummaryResponse.model_validate(m) for m in meetings]

    async def get_meeting(self, meeting_id: uuid.UUID) -> MeetingResponse:
        """Fetch a single meeting by id with its tasks."""
        meeting = await self.meeting_repository.get_by_id(self.db, meeting_id)
        if not meeting:
            raise NotFoundException("Meeting", str(meeting_id))
        return MeetingResponse.model_validate(meeting)
