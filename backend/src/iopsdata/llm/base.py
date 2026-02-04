"""Base interfaces and shared primitives for LLM providers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, AsyncIterator


class LLMProviderError(RuntimeError):
    """Base error for provider failures."""


class RateLimitError(LLMProviderError):
    """Raised when a provider returns a rate-limit response."""


@dataclass
class LLMResponse:
    """Normalized LLM response returned by providers."""

    content: str
    model: str
    provider: str
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None
    raw: Any | None = None


class BaseLLMProvider(ABC):
    """Abstract base class for all LLM providers."""

    def __init__(self, model: str) -> None:
        self.model = model

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable provider name."""

    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if the provider is configured via environment variables."""

    @abstractmethod
    async def generate(self, prompt: str, **kwargs: Any) -> LLMResponse:
        """Generate a completion response for the given prompt."""

    async def stream(self, prompt: str, **kwargs: Any) -> AsyncIterator[str]:
        """Stream tokens for the given prompt when supported."""

        response = await self.generate(prompt, **kwargs)
        yield response.content

    async def close(self) -> None:
        """Close any underlying HTTP clients."""

        return None
