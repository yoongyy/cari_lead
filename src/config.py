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


def load_config(path: str | Path) -> ResearchConfig:
    raw = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
    return ResearchConfig.model_validate(raw)
