"""Google AI Studio (Gemini) LLM provider implementation."""

from __future__ import annotations

import json
import os
from typing import Any, AsyncIterator

import httpx

from iopsdata.llm.base import BaseLLMProvider, LLMProviderError, LLMResponse, RateLimitError


class GeminiProvider(BaseLLMProvider):
    """Gemini provider for Google AI Studio."""

    def __init__(self, model: str = "gemini-1.5-flash") -> None:
        super().__init__(model=model)
        self._api_key = os.getenv("GEMINI_API_KEY")
        self._base_url = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")
        self._client = httpx.AsyncClient(timeout=30)

    @property
    def name(self) -> str:
        return "gemini"

    def is_configured(self) -> bool:
        return bool(self._api_key)

    async def generate(self, prompt: str, **kwargs: Any) -> LLMResponse:
        if not self._api_key:
            raise LLMProviderError("GEMINI_API_KEY is not set")

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": kwargs.get("temperature", 0.2),
            },
        }
        url = f"{self._base_url}/models/{self.model}:generateContent"
        response = await self._client.post(url, params={"key": self._api_key}, json=payload)
        if response.status_code == 429:
            raise RateLimitError("Gemini rate limit exceeded")
        if response.status_code >= 400:
            raise LLMProviderError(f"Gemini error: {response.text}")

        data = response.json()
        candidate = (data.get("candidates") or [{}])[0]
        parts = (candidate.get("content") or {}).get("parts", [])
        content = "".join(part.get("text", "") for part in parts)
        usage = data.get("usageMetadata", {})
        return LLMResponse(
            content=content,
            model=self.model,
            provider=self.name,
            prompt_tokens=usage.get("promptTokenCount"),
            completion_tokens=usage.get("candidatesTokenCount"),
            total_tokens=usage.get("totalTokenCount"),
            raw=data,
        )

    async def stream(self, prompt: str, **kwargs: Any) -> AsyncIterator[str]:
        if not self._api_key:
            raise LLMProviderError("GEMINI_API_KEY is not set")

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": kwargs.get("temperature", 0.2),
            },
        }
        url = f"{self._base_url}/models/{self.model}:streamGenerateContent"

        async with self._client.stream(
            "POST",
            url,
            params={"key": self._api_key},
            json=payload,
        ) as response:
            if response.status_code == 429:
                raise RateLimitError("Gemini rate limit exceeded")
            if response.status_code >= 400:
                raise LLMProviderError(f"Gemini error: {await response.aread()}")
            async for line in response.aiter_lines():
                if not line:
                    continue
                if line.startswith("data:"):
                    line = line.replace("data:", "").strip()
                chunk = json.loads(line)
                candidate = (chunk.get("candidates") or [{}])[0]
                parts = (candidate.get("content") or {}).get("parts", [])
                for part in parts:
                    text = part.get("text")
                    if text:
                        yield text

    async def close(self) -> None:
        await self._client.aclose()
