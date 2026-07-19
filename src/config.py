from __future__ import annotations

from pathlib import Path
from typing import Any, Literal

import yaml
from pydantic import BaseModel, Field


class RequestDelay(BaseModel):
    min_seconds: float = 2
    max_seconds: float = 5


class RiskControl(BaseModel):
    max_consecutive_errors: int = 3


class CrawlLimits(BaseModel):
    max_requests_per_minute: int = 6
    max_requests_per_hour: int = 240
    max_detail_opens_per_minute: int = 3
    max_detail_opens_per_hour: int = 100
    max_comment_requests_per_hour: int = 60
    max_runtime_minutes: int = 90
    max_total_requests: int = 250
    max_detail_posts_per_query: int = 15
    max_detail_posts_per_run: int = 100
    max_comment_requests_per_run: int = 150
    max_comments_per_post: int = 50
    long_pause_after_requests: int = 12
    long_pause_min_seconds: float = 20
    long_pause_max_seconds: float = 45
    extended_break_after_requests: int = 75
    extended_break_min_seconds: float = 180
    extended_break_max_seconds: float = 480
    cooldown_between_query_groups_seconds: float = 30


class InsuranceRiskControl(RiskControl):
    stop_on_first_risk_event: bool = True
    max_error_rate: float = 0.20


class ResearchConfig(BaseModel):
    industry: str = "property"
    malaysia_threshold: float = 0.60
    request_delay: RequestDelay = Field(default_factory=RequestDelay)
    risk_control: RiskControl = Field(default_factory=RiskControl)
    weights: dict[str, float] = Field(default_factory=dict)
    keyword_groups: dict[str, list[str]] = Field(default_factory=dict)

    def keywords(self, group: Literal["all", "location", "industry", "complaint"]) -> list[str]:
        if group == "all":
            seen: set[str] = set()
            ordered: list[str] = []
            for values in self.keyword_groups.values():
                for keyword in values:
                    if keyword not in seen:
                        seen.add(keyword)
                        ordered.append(keyword)
            return ordered
        return self.keyword_groups.get(group, [])


class InsuranceConfig(BaseModel):
    industry: str = "insurance"
    country: str = "Malaysia"
    timezone: str = "Asia/Kuala_Lumpur"
    default_recent_days: int = 180
    malaysia_threshold: float = 0.55
    discovery_open_threshold: float = 32
    open_fraction: float = 0.30
    request_delay: RequestDelay = Field(default_factory=lambda: RequestDelay(min_seconds=5, max_seconds=10))
    crawl_limits: CrawlLimits = Field(default_factory=CrawlLimits)
    risk_control: InsuranceRiskControl = Field(default_factory=InsuranceRiskControl)
    revisit_ttl_hours: dict[str, int | None] = Field(default_factory=dict)
    weights: dict[str, float] = Field(default_factory=dict)
    insurers: list[str] = Field(default_factory=list)
    insurance_products: list[str] = Field(default_factory=list)
    exclusion_rules: list[str] = Field(default_factory=list)
    query_groups: dict[str, list[str]] = Field(default_factory=dict)


def load_config(path: str | Path) -> ResearchConfig:
    raw = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
    return ResearchConfig.model_validate(raw)


def load_insurance_config(path: str | Path = "config/insurance_malaysia.yaml") -> InsuranceConfig:
    raw = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
    return InsuranceConfig.model_validate(raw)
