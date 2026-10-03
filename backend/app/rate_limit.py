from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request


class InMemoryRateLimiter:
    """Small single-process guard; production proxies should enforce a second limit."""

    def __init__(self) -> None:
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str, limit: int, window_seconds: int) -> None:
        now = monotonic()
        cutoff = now - window_seconds
        with self._lock:
            events = self._events[key]
            while events and events[0] <= cutoff:
                events.popleft()
            if len(events) >= limit:
                raise HTTPException(status_code=429, detail="Слишком много попыток. Попробуйте позже")
            events.append(now)
            if len(self._events) > 10_000:
                self._events = defaultdict(deque, {k: v for k, v in self._events.items() if v and v[-1] > cutoff})


auth_limiter = InMemoryRateLimiter()


def limit_auth_request(request: Request, scope: str, limit: int = 10, window_seconds: int = 60) -> None:
    client_host = request.client.host if request.client else "unknown"
    auth_limiter.check(f"{scope}:{client_host}", limit=limit, window_seconds=window_seconds)
