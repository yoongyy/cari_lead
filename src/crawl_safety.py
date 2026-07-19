from __future__ import annotations

import random
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Callable

from .config import InsuranceConfig


class CrawlLimitReached(RuntimeError):
    pass


@dataclass
class RequestBudget:
    config: InsuranceConfig
    max_runtime_minutes: int | None = None
    max_total_requests: int | None = None
    sleep_enabled: bool = True
    clock: Callable[[], float] = time.monotonic
    sleeper: Callable[[float], None] = time.sleep
    started_at: float = field(init=False)
    total_requests: int = 0
    error_count: int = 0
    history: dict[str, deque[float]] = field(default_factory=lambda: defaultdict(deque))

    def __post_init__(self) -> None:
        self.started_at = self.clock()
        self.max_runtime_minutes = self.max_runtime_minutes or self.config.crawl_limits.max_runtime_minutes
        self.max_total_requests = self.max_total_requests or self.config.crawl_limits.max_total_requests

    def before_request(self, kind: str) -> None:
        now = self.clock()
        if now - self.started_at >= self.max_runtime_minutes * 60:
            raise CrawlLimitReached("maximum continuous runtime reached")
        if self.total_requests >= self.max_total_requests:
            raise CrawlLimitReached("maximum total requests reached")
        self._enforce_window("all", 60, self.config.crawl_limits.max_requests_per_minute)
        self._enforce_window("all", 3600, self.config.crawl_limits.max_requests_per_hour)
        if kind == "detail":
            self._enforce_window(kind, 60, self.config.crawl_limits.max_detail_opens_per_minute)
            self._enforce_window(kind, 3600, self.config.crawl_limits.max_detail_opens_per_hour)
        if kind == "comments":
            self._enforce_window(kind, 3600, self.config.crawl_limits.max_comment_requests_per_hour)
        if self.sleep_enabled and self.total_requests:
            self.sleeper(random.uniform(self.config.request_delay.min_seconds, self.config.request_delay.max_seconds))
        now = self.clock()
        self.history["all"].append(now)
        self.history[kind].append(now)
        self.total_requests += 1
        self._scheduled_breaks()

    def record_error(self) -> None:
        self.error_count += 1
        if self.total_requests >= 5 and self.error_count / self.total_requests > self.config.risk_control.max_error_rate:
            raise CrawlLimitReached("error rate threshold exceeded")

    def _enforce_window(self, key: str, seconds: int, maximum: int) -> None:
        queue = self.history[key]
        now = self.clock()
        while queue and now - queue[0] >= seconds:
            queue.popleft()
        if len(queue) >= maximum and self.sleep_enabled:
            wait = max(0.0, seconds - (now - queue[0]) + 0.05)
            self.sleeper(wait)

    def _scheduled_breaks(self) -> None:
        limits = self.config.crawl_limits
        if not self.sleep_enabled:
            return
        if self.total_requests and self.total_requests % limits.extended_break_after_requests == 0:
            self.sleeper(random.uniform(limits.extended_break_min_seconds, limits.extended_break_max_seconds))
        elif self.total_requests and self.total_requests % limits.long_pause_after_requests == 0:
            self.sleeper(random.uniform(limits.long_pause_min_seconds, limits.long_pause_max_seconds))


def revisit_allowed(
    state: dict | None,
    *,
    priority_score: float,
    now: datetime | None = None,
    force_refresh: bool = False,
    incremental: bool = True,
) -> tuple[bool, str]:
    if force_refresh or not incremental:
        return True, "forced"
    if not state:
        return True, "never_fetched"
    if state.get("detail_status") != "fetched":
        return True, "detail_incomplete"
    if state.get("rejection_reason") in {"promotion", "recruitment", "unrelated"}:
        return False, "permanently_rejected"
    revisit_after = state.get("revisit_after")
    if not revisit_after:
        return True, "ttl_missing"
    current = now or datetime.now(timezone.utc)
    parsed = datetime.fromisoformat(str(revisit_after).replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return (current >= parsed, "ttl_expired" if current >= parsed else "ttl_active")


def revisit_after(priority_score: float, rejected: bool = False, now: datetime | None = None) -> str | None:
    if rejected:
        return None
    current = now or datetime.now(timezone.utc)
    hours = 24 if priority_score >= 70 else (168 if priority_score >= 35 else 720)
    return (current + timedelta(hours=hours)).isoformat()
