"""Groq LLM provider implementation."""

from __future__ import annotations

import json
import os
from typing import Any, AsyncIterator

import httpx

from iopsdata.llm.base import BaseLLMProvider, LLMProviderError, LLMResponse, RateLimitError


class GroqProvider(BaseLLMProvider):
    """Groq provider using the OpenAI-compatible API."""

    def __init__(self, model: str = "llama-3.3-70b-versatile") -> None:
        super().__init__(model=model)
        self._api_key = os.getenv("GROQ_API_KEY")
        self._base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
        self._client = httpx.AsyncClient(timeout=30)

    @property
    def name(self) -> str:
        return "groq"

    def is_configured(self) -> bool:
        return bool(self._api_key)

    async def generate(self, prompt: str, **kwargs: Any) -> LLMResponse:
        if not self._api_key:
            raise LLMProviderError("GROQ_API_KEY is not set")

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": kwargs.get("temperature", 0.2),
        }
        url = f"{self._base_url}/chat/completions"
        headers = {"Authorization": f"Bearer {self._api_key}"}

        response = await self._client.post(url, json=payload, headers=headers)
        if response.status_code == 429:
            raise RateLimitError("Groq rate limit exceeded")
        if response.status_code >= 400:
            raise LLMProviderError(f"Groq error: {response.text}")

        data = response.json()
        message = data.get("choices", [{}])[0].get("message", {})
        usage = data.get("usage", {})
        return LLMResponse(
            content=message.get("content", ""),
            model=data.get("model", self.model),
            provider=self.name,
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
            total_tokens=usage.get("total_tokens"),
            raw=data,
        )

    async def stream(self, prompt: str, **kwargs: Any) -> AsyncIterator[str]:
        if not self._api_key:
            raise LLMProviderError("GROQ_API_KEY is not set")

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": kwargs.get("temperature", 0.2),
            "stream": True,
        }
        url = f"{self._base_url}/chat/completions"
        headers = {"Authorization": f"Bearer {self._api_key}"}

        async with self._client.stream("POST", url, json=payload, headers=headers) as response:
            if response.status_code == 429:
                raise RateLimitError("Groq rate limit exceeded")
            if response.status_code >= 400:
                raise LLMProviderError(f"Groq error: {await response.aread()}")
            async for line in response.aiter_lines():
                if not line.startswith("data:"):
                    continue
                data = line.replace("data:", "").strip()
                if data == "[DONE]":
                    break
                chunk = json.loads(data)
                delta = chunk.get("choices", [{}])[0].get("delta", {})
                content = delta.get("content")
                if content:
                    yield content

    async def close(self) -> None:
        await self._client.aclose()
