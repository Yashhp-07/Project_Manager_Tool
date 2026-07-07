"""Application entry point."""

from fastapi import FastAPI

app = FastAPI(title="Mini AI Project Manager", version="0.1.0")


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return a simple health-check response."""
    return {"status": "ok"}
