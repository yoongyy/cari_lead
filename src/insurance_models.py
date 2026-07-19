from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from .models import utc_now


OpportunityLevel = Literal["no_sales_signal", "low", "medium", "high", "very_high"]


class InsuranceFinding(BaseModel):
    finding_id: str
    source_type: Literal["post", "comment"]
    source_id: str
    post_id: str | None = None
    source_url: str | None = None
    author_name: str | None = None
    published_at: datetime | None = None
    location_signal: str | None = None
    stakeholder_role: str = "unknown"
    insurer: str | None = None
    insurance_product: str | None = None
    current_policy: str | None = None
    classification: str = "general_discussion"
    complaint_category: str | None = None
    complaint_description: str | None = None
    premium_amount: float | None = None
    premium_currency: str | None = None
    premium_period: str | None = None
    old_premium: float | None = None
    new_premium: float | None = None
    percentage_increase: float | None = None
    claim_status: str | None = None
    claim_reason: str | None = None
    agent_service_issue: str | None = None
    cancellation_intent: bool = False
    considering_switch: bool = False
    explicit_switch: bool = False
    switching_from: str | None = None
    switching_to: str | None = None
    recommendation_request: bool = False
    comparison_request: bool = False
    purchase_request: bool = False
    claim_assistance_request: bool = False
    desired_coverage: str | None = None
    target_person: str | None = None
    age_if_publicly_stated: int | None = None
    stated_budget: float | None = None
    urgency: str | None = None
    sales_opportunity_level: OpportunityLevel = "no_sales_signal"
    research_value_score: float = 0.0
    sales_opportunity_score: float = 0.0
    evidence_text: str
    confidence: float = 0.5
    organic_evidence_weight: float = 0.5
    promotional_probability: float = 0.0
    verification_status: str = "rules_unverified"
    suggested_public_response: str | None = None
    status: Literal["new", "reviewed", "saved", "expired"] = "new"
    detected_at: datetime = Field(default_factory=utc_now)


class DiscoveryCandidate(BaseModel):
    post_id: str
    canonical_url: str
    title: str | None = None
    snippet: str | None = None
    author_name: str | None = None
    date_label: str | None = None
    search_query: str
    search_rank: int
    result_type: str = "post"
    first_seen_at: datetime = Field(default_factory=utc_now)
    last_seen_at: datetime = Field(default_factory=utc_now)
    priority_score: float = 0.0
    rejection_reason: str | None = None


class CrawlMetrics(BaseModel):
    run_id: str
    queries_planned: int = 0
    queries_completed: int = 0
    discovered_posts: int = 0
    detail_posts_opened: int = 0
    comment_threads_fetched: int = 0
    comments_seen: int = 0
    duplicate_posts: int = 0
    duplicate_comments: int = 0
    rejected_promotional_posts: int = 0
    requests_total: int = 0
    requests_avoided: int = 0
    active_purchase_requests: int = 0
    recommendation_requests: int = 0
    switching_signals: int = 0
    claim_help_signals: int = 0
    stopped_reason: str | None = None
