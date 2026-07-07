"""Pydantic schema for validating Gemini's JSON output."""

from typing import Literal

from pydantic import BaseModel, Field


LLMPriority = Literal["Low", "Medium", "High"]


class LLMExtractedTask(BaseModel):
    """A single task as returned by the LLM."""

    description: str
    owners: list[str]
    due_date: str | None = Field(
        None, pattern=r"^\d{4}-\d{2}-\d{2}$",
    )
    priority: LLMPriority
    evidence_quote: str


class LLMExtractionResult(BaseModel):
    """Top-level result from the LLM extraction."""

    meeting_title: str
    tasks: list[LLMExtractedTask]
