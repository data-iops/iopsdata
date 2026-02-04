"""Simple in-memory rate limiter."""

from __future__ import annotations

import time
from dataclasses import dataclass, field


@dataclass
class RateLimiter:
    """Token bucket rate limiter."""

    rate: int
    per_seconds: int
    tokens: dict[str, float] = field(default_factory=dict)
    timestamps: dict[str, float] = field(default_factory=dict)

    def allow(self, key: str) -> bool:
        """Return True if the key is allowed to proceed."""

        now = time.time()
        tokens = self.tokens.get(key, float(self.rate))
        last = self.timestamps.get(key, now)
        elapsed = now - last
        refill = elapsed * (self.rate / self.per_seconds)
        tokens = min(float(self.rate), tokens + refill)
        if tokens < 1:
            self.tokens[key] = tokens
            self.timestamps[key] = now
            return False
        self.tokens[key] = tokens - 1
        self.timestamps[key] = now
        return True
