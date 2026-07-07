"""LLM extraction service — calls Gemini to extract tasks from transcripts."""

import json
import re
from datetime import datetime, timezone

from google.genai import Client

from app.core.config import settings
from app.core.constants import Priority
from app.core.exceptions import LLMExtractionException
from app.schemas.llm_extraction import LLMExtractionResult
from app.utils.prompts import build_extraction_prompt


def _strip_markdown_fences(text: str) -> str:
    """Remove markdown code fences (```json ... ```) if the LLM wraps the response."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _parse_date(date_str: str | None) -> datetime | None:
    """Convert a YYYY-MM-DD string to a timezone-aware datetime at midnight UTC."""
    if date_str is None:
        return None
    try:
        parts = date_str.split("-")
        return datetime(
            int(parts[0]), int(parts[1]), int(parts[2]),
            tzinfo=timezone.utc,
        )
    except (ValueError, IndexError):
        return None


_PRIORITY_MAP: dict[str, Priority] = {
    "low": Priority.LOW,
    "medium": Priority.MEDIUM,
    "high": Priority.HIGH,
}


def _map_priority(raw: str) -> Priority:
    """Map LLM priority string to internal Priority enum (case-insensitive)."""
    return _PRIORITY_MAP.get(raw.lower(), Priority.MEDIUM)


def _map_to_task_dicts(result: LLMExtractionResult) -> list[dict]:
    """Convert validated LLM output into the format expected by MeetingService."""
    tasks = []
    for t in result.tasks:
        tasks.append({
            "description": t.description,
            "owners": t.owners,
            "due_date": _parse_date(t.due_date),
            "priority": _map_priority(t.priority),
            "evidence_quote": t.evidence_quote,
        })
    return tasks


class LLMService:
    """Handles extraction of structured tasks from meeting transcripts."""

    async def extract_tasks(
        self, transcript: str, meeting_date: datetime,
    ) -> list[dict]:
        """Extract tasks from a transcript via Gemini.

        Returns a list of dicts matching the TaskCreate schema shape
        (description, owners, due_date, priority, evidence_quote).

        Raises:
            LLMExtractionException: If the response cannot be parsed or validated.
        """
        prompt = build_extraction_prompt(
            transcript, meeting_date.strftime("%Y-%m-%d"),
        )

        client = Client(api_key=settings.gemini_api_key)

        try:
            response = await client.aio.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
            )
        except Exception as exc:
            raise LLMExtractionException(
                f"Gemini API call failed: {exc}",
            ) from exc

        raw_text = response.text

        cleaned = _strip_markdown_fences(raw_text)

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise LLMExtractionException(
                f"Failed to parse LLM response as JSON: {exc}",
                raw_output=raw_text,
            ) from exc

        try:
            validated = LLMExtractionResult.model_validate(data)
        except Exception as exc:
            raise LLMExtractionException(
                f"LLM response failed validation: {exc}",
                raw_output=raw_text,
            ) from exc

        return _map_to_task_dicts(validated)
