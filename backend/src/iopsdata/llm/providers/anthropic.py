"""Anthropic LLM provider implementation."""

from __future__ import annotations

import json
import os
from typing import Any, AsyncIterator

import httpx

from iopsdata.llm.base import BaseLLMProvider, LLMProviderError, LLMResponse, RateLimitError


class AnthropicProvider(BaseLLMProvider):
    """Anthropic provider for Claude models."""

    def __init__(self, model: str = "claude-3-haiku-20240307") -> None:
        super().__init__(model=model)
        self._api_key = os.getenv("ANTHROPIC_API_KEY")
        self._base_url = os.getenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com/v1")
        self._client = httpx.AsyncClient(timeout=30)

    @property
    def name(self) -> str:
        return "anthropic"

    def is_configured(self) -> bool:
        return bool(self._api_key)

    async def generate(self, prompt: str, **kwargs: Any) -> LLMResponse:
        if not self._api_key:
            raise LLMProviderError("ANTHROPIC_API_KEY is not set")

        payload = {
            "model": self.model,
            "max_tokens": kwargs.get("max_tokens", 1024),
            "messages": [{"role": "user", "content": prompt}],
        }
        url = f"{self._base_url}/messages"
        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
        }

        response = await self._client.post(url, json=payload, headers=headers)
        if response.status_code == 429:
            raise RateLimitError("Anthropic rate limit exceeded")
        if response.status_code >= 400:
            raise LLMProviderError(f"Anthropic error: {response.text}")

        data = response.json()
        content_blocks = data.get("content", [])
        content = "".join(block.get("text", "") for block in content_blocks)
        usage = data.get("usage", {})
        return LLMResponse(
            content=content,
            model=data.get("model", self.model),
            provider=self.name,
            prompt_tokens=usage.get("input_tokens"),
            completion_tokens=usage.get("output_tokens"),
            total_tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
            raw=data,
        )

    async def stream(self, prompt: str, **kwargs: Any) -> AsyncIterator[str]:
        if not self._api_key:
            raise LLMProviderError("ANTHROPIC_API_KEY is not set")

        payload = {
            "model": self.model,
            "max_tokens": kwargs.get("max_tokens", 1024),
            "messages": [{"role": "user", "content": prompt}],
            "stream": True,
        }
        url = f"{self._base_url}/messages"
        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": "2023-06-01",
        }

        async with self._client.stream("POST", url, json=payload, headers=headers) as response:
            if response.status_code == 429:
                raise RateLimitError("Anthropic rate limit exceeded")
            if response.status_code >= 400:
                raise LLMProviderError(f"Anthropic error: {await response.aread()}")
            async for line in response.aiter_lines():
                if not line.startswith("data:"):
                    continue
                data = line.replace("data:", "").strip()
                if data == "[DONE]":
                    break
                chunk = json.loads(data)
                if chunk.get("type") == "content_block_delta":
                    delta = chunk.get("delta", {})
                    text = delta.get("text")
                    if text:
                        yield text

    async def close(self) -> None:
        await self._client.aclose()
