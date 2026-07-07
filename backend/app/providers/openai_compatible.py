"""LLM provider using OpenAI-compatible chat completions API.

Supports any provider that speaks the OpenAI format (OpenAI, Groq, Together,
Perplexity, OpenRouter, DeepSeek, Fireworks, etc.).
"""

import httpx
from openai import AsyncClient, APIError as OpenAIError

from app.core.config import settings
from app.core.exceptions import LLMExtractionException
from app.core.logger import logger


class LLMProvider:
    """Wraps an OpenAI-compatible chat completions endpoint."""

    def __init__(self) -> None:
        self.client = AsyncClient(
            api_key=settings.api_key,
            base_url=settings.llm_base_url,
            timeout=httpx.Timeout(60.0),
        )
        self.model = settings.llm_model

    async def generate(self, prompt: str) -> str:
        """Send a prompt and return the raw text response."""
        try:
            resp = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=4096,
            )
        except OpenAIError as exc:
            body = exc.body
            if isinstance(body, dict):
                error = body.get("error", {})
                msg = (error.get("message", str(exc))
                       if isinstance(error, dict) else str(exc))
            else:
                msg = str(exc)
            logger.error("LLM API error (model=%s): %s", self.model, msg)
            raise LLMExtractionException(
                "Extraction service unavailable, please try again.",
            ) from exc
        except Exception as exc:
            logger.error("LLM API call failed (model=%s): %s", self.model, exc)
            raise LLMExtractionException(
                "Extraction service unavailable, please try again.",
            ) from exc

        content = resp.choices[0].message.content
        return content or ""
