"""Local Ollama LLM provider implementation."""

from __future__ import annotations

import json
import os
from typing import Any, AsyncIterator

import httpx

from iopsdata.llm.base import BaseLLMProvider, LLMProviderError, LLMResponse, RateLimitError


class OllamaProvider(BaseLLMProvider):
    """Ollama provider for local models."""

    def __init__(self, model: str | None = None) -> None:
        super().__init__(model=model or os.getenv("OLLAMA_MODEL", "llama3"))
        self._base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self._client = httpx.AsyncClient(timeout=30)

    @property
    def name(self) -> str:
        return "ollama"

    def is_configured(self) -> bool:
        return True

    async def generate(self, prompt: str, **kwargs: Any) -> LLMResponse:
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
        }
        url = f"{self._base_url}/api/chat"

        response = await self._client.post(url, json=payload)
        if response.status_code == 429:
            raise RateLimitError("Ollama rate limit exceeded")
        if response.status_code >= 400:
            raise LLMProviderError(f"Ollama error: {response.text}")

        data = response.json()
        message = data.get("message", {})
        usage = data.get("usage", {})
        return LLMResponse(
            content=message.get("content", ""),
            model=data.get("model", self.model),
            provider=self.name,
            prompt_tokens=usage.get("prompt_eval_count"),
            completion_tokens=usage.get("eval_count"),
            total_tokens=usage.get("prompt_eval_count", 0) + usage.get("eval_count", 0),
            raw=data,
        )

    async def stream(self, prompt: str, **kwargs: Any) -> AsyncIterator[str]:
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": True,
        }
        url = f"{self._base_url}/api/chat"

        async with self._client.stream("POST", url, json=payload) as response:
            if response.status_code == 429:
                raise RateLimitError("Ollama rate limit exceeded")
            if response.status_code >= 400:
                raise LLMProviderError(f"Ollama error: {await response.aread()}")
            async for line in response.aiter_lines():
                if not line:
                    continue
                chunk = json.loads(line)
                if chunk.get("done"):
                    break
                content = (chunk.get("message") or {}).get("content")
                if content:
                    yield content

    async def close(self) -> None:
        await self._client.aclose()
