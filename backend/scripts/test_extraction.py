#!/usr/bin/env python3
"""Standalone test script for LLM extraction.

Run directly without FastAPI:
    PYTHONPATH=. python scripts/test_extraction.py

Iterate on prompts.py and re-run this script to validate extraction output.
"""

import asyncio
from datetime import datetime, timezone

from app.schemas.llm_extraction import LLMExtractionResult
from app.services.llm_service import LLMService
from app.utils.prompts import build_extraction_prompt

SAMPLE_TRANSCRIPT = """
Quick standup today. Status update — the staging environment is stable now, all
green on the dashboard.

We need someone to fix the broken CSV export before the client demo tomorrow.
This is a blocker, please prioritize.

Sarah, weren't you already looking into the CSV export bug?
Yeah, I'm on it, should have it fixed by end of day tomorrow.

Also we need to send the client the updated invoice by end of month.

Nothing else major, discussion was mostly around timeline confidence, feels good
overall but nothing to action there."""


async def main() -> None:
    """Run the extraction test and print results."""
    meeting_date = datetime(2026, 7, 7, tzinfo=timezone.utc)

    print("=" * 60)
    print("TRANSCRIPT")
    print("=" * 60)
    print(SAMPLE_TRANSCRIPT.strip())
    print()

    print("=" * 60)
    print("PROMPT")
    print("=" * 60)
    prompt = build_extraction_prompt(
        SAMPLE_TRANSCRIPT.strip(), meeting_date.strftime("%Y-%m-%d"),
    )
    print(prompt)
    print()

    print("=" * 60)
    print("LLM EXTRACTION")
    print("=" * 60)
    service = LLMService()

    try:
        result = await service.extract_tasks(
            SAMPLE_TRANSCRIPT.strip(), meeting_date,
        )

        print(f"\nExtracted {len(result)} tasks:\n")
        for i, task in enumerate(result, 1):
            print(f"  Task {i}:")
            print(f"    description:    {task['description']}")
            print(f"    owners:         {task['owners']}")
            print(f"    due_date:       {task['due_date']}")
            print(f"    priority:       {task['priority']}")
            print(f"    evidence_quote: {task['evidence_quote']}")
            print()

        print("=" * 60)
        print("VALIDATION AGAINST LLMExtractionResult")
        print("=" * 60)
        raw_payload = {
            "meeting_title": "test",
            "tasks": [
                {
                    "description": t["description"],
                    "owners": t["owners"],
                    "due_date": t["due_date"].strftime("%Y-%m-%d") if t["due_date"] else None,
                    "priority": "High" if t["priority"].value == "high" else "Medium" if t["priority"].value == "medium" else "Low",
                    "evidence_quote": t["evidence_quote"],
                }
                for t in result
            ],
        }
        validated = LLMExtractionResult.model_validate(raw_payload)
        print(f"  Meeting title: {validated.meeting_title}")
        print(f"  Tasks: {len(validated.tasks)}")
        print("  ✓ LLMExtractionResult validation passed")
        print()

    except Exception as e:
        print(f"\n  ✗ Error: {e}")
        return


if __name__ == "__main__":
    asyncio.run(main())
