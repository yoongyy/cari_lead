from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ClassificationResult(BaseModel):
    score: float
    signals: list[str] = Field(default_factory=list)
    language: str = "unknown"
    is_relevant: bool


class Post(BaseModel):
    platform: str = "xhs"
    post_id: str
    url: str
    title: str | None = None
    body: str | None = None
    author_id: str | None = None
    author_name: str | None = None
    author_bio: str | None = None
    published_at: datetime | None = None
    crawled_at: datetime = Field(default_factory=utc_now)
    likes: int | None = None
    favorites: int | None = None
    comment_count: int | None = None
    share_count: int | None = None
    hashtags: list[str] = Field(default_factory=list)
    search_keyword: str | None = None
    raw_json: dict[str, Any] = Field(default_factory=dict)
    malaysia_score: float = 0.0
    malaysia_signals: list[str] = Field(default_factory=list)
    language: str = "unknown"
    is_malaysia_relevant: bool = False
    post_body: str | None = None
    author_profile_url: str | None = None
    edited_at: datetime | None = None
    location_label: str | None = None
    canonical_url: str | None = None
    original_date_text: str | None = None
    parsed_date: str | None = None
    date_confidence: float | None = None
    extraction_method: str | None = None
    extraction_confidence: float | None = None
    extraction_warnings: list[str] = Field(default_factory=list)
    content_origin: str = "unknown"
    leading_question_score: float = 0.0
    promotional_score: float = 0.0
    organic_evidence_weight: float = 0.3
    discovered_by_queries: list[str] = Field(default_factory=list)
    best_search_rank: int | None = None
    number_of_queries_matched: int = 1
    first_discovered_at: datetime | None = None
    last_seen_at: datetime | None = None


class Comment(BaseModel):
    platform: str = "xhs"
    comment_id: str
    post_id: str
    parent_comment_id: str | None = None
    url: str | None = None
    author_id: str | None = None
    author_name: str | None = None
    text: str
    created_at: datetime | None = None
    crawled_at: datetime = Field(default_factory=utc_now)
    likes: int | None = None
    raw_json: dict[str, Any] = Field(default_factory=dict)
    malaysia_score: float = 0.0
    malaysia_signals: list[str] = Field(default_factory=list)
    language: str = "unknown"
    is_malaysia_relevant: bool = False
    depth: int = 0
    location_label: str | None = None
    is_author_reply: bool = False
    canonical_post_url: str | None = None
    original_date_text: str | None = None
    parsed_date: str | None = None
    date_confidence: float | None = None
    extraction_method: str | None = None
    extraction_confidence: float | None = None
    extraction_warnings: list[str] = Field(default_factory=list)


class ResearchFinding(BaseModel):
    finding_id: str | None = None
    source_type: Literal["post", "comment"]
    source_id: str
    post_id: str | None = None
    source_url: str | None = None
    author_name: str | None = None
    stakeholder_role: str = "unknown"
    content_origin: str = "unknown"
    evidence_type: str | None = None
    problem_category: str | None = None
    problem_description: str | None = None
    affected_workflow: str | None = None
    cause: str | None = None
    consequence: str | None = None
    current_solution: str | None = None
    workaround: str | None = None
    desired_outcome: str | None = None
    product_or_platform: str | None = None
    industry: str = "property"
    category: str
    subcategory: str | None = None
    brand: str | None = None
    competitor: str | None = None
    sentiment: str | None = None
    complaint: bool = False
    pain_point: str | None = None
    feature_request: bool = False
    pricing_mentioned: bool = False
    amount: float | None = None
    money_amount: float | None = None
    currency: str | None = None
    billing_period: str | None = None
    time_cost: str | None = None
    opportunity_cost: str | None = None
    switched: bool = False
    switching_from: str | None = None
    switching_to: str | None = None
    considering_switch: bool = False
    stopped_using: bool = False
    renewal_intent: str | None = None
    purchase_intent: bool = False
    willingness_to_pay: bool = False
    explicit_solution_request: bool = False
    urgency: str | None = None
    emotion: str | None = None
    severity: float | None = None
    frequency_claim: str | None = None
    confidence: float = 0.5
    independence_weight: float = 0.5
    organic_evidence_weight: float = 0.3
    relevance_score: float = 0.0
    evidence_text: str
    evidence_start: int | None = None
    evidence_end: int | None = None
    extraction_model: str | None = None
    verifier_model: str | None = None
    extraction_prompt_version: str | None = None
    verifier_prompt_version: str | None = None
    verification_status: str = "unverified"
    verification_notes: str | None = None
    detected_at: datetime = Field(default_factory=utc_now)
