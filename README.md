# Task Xtractor

**Task Xtractor** is an AI-powered project management assistant that automatically turns unstructured meeting transcripts into actionable, structured, and filterable tasks using LLM extraction.

## Problem Statement

Project managers spend significant time sifting through raw meeting notes to identify what needs to be done, who owns it, and when it is due. The core objective of this tool is to automate that workflow: users paste a raw meeting transcript, and the backend leverages an LLM to extract actionable tasks (with inferred deadlines, owners, and priorities). These tasks are structured into strict JSON, stored persistently, and managed through a high-fidelity, filterable, and editable dashboard.

## Tech Stack

This application is built with a modern, high-performance stack:

*   **Backend framework:** FastAPI (async)
*   **Database ORM & Migrations:** SQLAlchemy 2.0 (async, via `asyncpg`), Alembic
*   **Database:** PostgreSQL (Supabase)
*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Tailwind CSS (with custom SaaS-grade design system tokens)
*   **LLM Integration:** Provider-agnostic architecture. Native support for Gemini, plus drop-in support for any OpenAI-compatible API provider (OpenAI, Groq, Together, etc.) switchable via environment variables.

## Features Implemented

**Transcript Input & Processing**
*   Transcript input form with optional meeting title and meeting date.
*   Auto-generated meeting title via LLM fallback if no title is provided.

**LLM-Based Task Extraction**
*   **Actionable-task filtering:** Intelligently ignores decisions and FYI-only lines.
*   **Duplicate merging:** Restated or duplicated tasks across a meeting are merged into a single actionable item.
*   **Relative date resolution:** Resolves relative references (e.g., "next Friday") against the anchor meeting date into strict ISO 8601 dates.
*   **Strict mapping:** Missing owners or dates are explicitly left as `null` and are never invented by the LLM.
*   **Priority inference:** Dynamically calculates priority based on urgency keywords in the transcript, proximity to deadlines, and falls back to a default "Medium".
*   **Evidence tracking:** Attaches a verbatim quote from the transcript to every extracted task for human verification.

**Data Persistence & Task Management**
*   Task storage in PostgreSQL with full CRUD (via inline editing).
*   Task list grid with combinable `AND` logic filters (owner, status, priority).
*   Optional meeting-scoping directly from the sidebar.
*   Inline task editing (description, owners, due date, priority, status) without requiring manual page refreshes.
*   "Confirmed" toggle to mark tasks as PM-reviewed.
*   CSV export of currently filtered tasks.

**UI/UX & Roles**
*   Searchable meeting history sidebar.
*   Missing owner/date attributes are visually flagged in the UI.
*   Frontend-simulated PM / Owner view toggles. The UI dynamically adapts to read-only views for non-PMs (e.g., hiding edit actions and disabling toggles).

## Setup & Running Instructions

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   A running PostgreSQL instance (or Supabase account)

### Backend Setup
1. Clone the repository and navigate to the `backend` directory.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
5. Fill in the `.env` file with your `DATABASE_URL` and your LLM provider credentials (`API_KEY`, and optionally `LLM_BASE_URL` / `LLM_MODEL`).
6. Run database migrations:
   ```bash
   alembic upgrade head
   ```
7. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory in a new terminal window.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure the `.env` (if present) points to the backend (default `VITE_API_BASE_URL=http://localhost:8000/api/v1`).
4. Start the development server:
   ```bash
   npm run dev
   ```
   *Note: Ensure the frontend is running on a port (like `5173`) that matches the `CORS_ORIGINS` allowed list in the backend `.env`.*

### Verification
*   **Backend:** Navigate to `http://localhost:8000/docs` to view the interactive Swagger API documentation.
*   **Frontend:** Navigate to `http://localhost:5173`, paste a sample meeting transcript into the "New Meeting" view, and confirm the extracted tasks successfully appear in the dashboard.

## Known Simplifications & Deliberate Scope Decisions

Given the time-constrained nature of this assignment, the following are intentional architectural decisions and scope simplifications, rather than oversights:

*   **No real authentication or RBAC:** The PM vs. Owner access control toggle is fully simulated on the frontend. The backend does not enforce endpoint-level authorization.
*   **No reminder/notification system:** The system tracks due dates but does not dispatch emails or push notifications.
*   **Flat task owner storage:** Task owners are stored as a free-text string array directly on the `Task` model. Only the first matched name loosely links to a mocked `User` record. There is no formalized many-to-many join table for assignments.
*   **Status is strictly user-managed:** Task status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`) is managed by the user post-extraction and is never inferred or set by the LLM.
*   **No manual task creation:** Tasks strictly originate from the LLM transcript extraction pipeline. There is no UI for adding an ad-hoc task.
*   **No rate limiting or payload limits:** Protections like transcript size limits and API rate limiters are omitted for the purpose of this isolated demo.

## Future Enhancements

Things actively considered but explicitly kept out of scope for this initial submission:

*   Full Authentication (JWT) and true Role-Based Access Control (RBAC).
*   A dedicated notification worker (e.g., Celery) for triggering follow-ups prior to task deadlines.
*   A fully normalized many-to-many relationship linking extracted owners to actual verified User database records.
*   A robust audit trail maintaining the edit history and state-change logs for tasks.
*   A manual "Create Task" flow to supplement the AI-driven extraction pipeline.
