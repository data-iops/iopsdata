"""Provider router and fallback handling for multi-provider LLMs."""

from __future__ import annotations

from typing import Any

from iopsdata.llm.base import BaseLLMProvider, LLMProviderError, RateLimitError
from iopsdata.llm.providers.anthropic import AnthropicProvider
from iopsdata.llm.providers.gemini import GeminiProvider
from iopsdata.llm.providers.groq import GroqProvider
from iopsdata.llm.providers.ollama import OllamaProvider
from iopsdata.llm.providers.openai import OpenAIProvider
from iopsdata.llm.providers.openrouter import OpenRouterProvider


PROVIDER_REGISTRY: dict[str, type[BaseLLMProvider]] = {
    "groq": GroqProvider,
    "gemini": GeminiProvider,
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "ollama": OllamaProvider,
    "openrouter": OpenRouterProvider,
}


def get_provider(name: str) -> BaseLLMProvider:
    """Factory helper to instantiate a provider by name."""

    provider_cls = PROVIDER_REGISTRY.get(name.lower())
    if not provider_cls:
        raise ValueError(f"Unknown provider: {name}")
    return provider_cls()


def configured_providers() -> list[str]:
    """Return providers that are configured via environment variables."""

    configured: list[str] = []
    for name, provider_cls in PROVIDER_REGISTRY.items():
        provider = provider_cls()
        if provider.is_configured():
            configured.append(name)
    return configured


async def generate_with_fallback(
    prompt: str,
    primary: str = "groq",
    fallbacks: list[str] | None = None,
    **kwargs: Any,
) -> tuple[str, BaseLLMProvider]:
    """Generate text using a fallback chain when providers fail."""

    chain = [primary]
    if fallbacks:
        chain.extend(fallbacks)

    last_error: Exception | None = None
    for name in chain:
        provider = get_provider(name)
        if not provider.is_configured():
            continue
        try:
            response = await provider.generate(prompt, **kwargs)
            return response.content, provider
        except RateLimitError as exc:
            last_error = exc
            continue
        except LLMProviderError as exc:
            last_error = exc
            continue
        finally:
            await provider.close()

    if last_error:
        raise last_error
    raise LLMProviderError("No configured providers available")


async def stream_with_fallback(
    prompt: str,
    primary: str = "groq",
    fallbacks: list[str] | None = None,
    **kwargs: Any,
):
    """Stream text using a fallback chain when providers fail."""

    chain = [primary]
    if fallbacks:
        chain.extend(fallbacks)

    last_error: Exception | None = None
    for name in chain:
        provider = get_provider(name)
        if not provider.is_configured():
            continue
        try:
            async for chunk in provider.stream(prompt, **kwargs):
                yield chunk
            return
        except RateLimitError as exc:
            last_error = exc
            continue
        except LLMProviderError as exc:
            last_error = exc
            continue
        finally:
            await provider.close()

    if last_error:
        raise last_error
    raise LLMProviderError("No configured providers available")
