from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml


INSURANCE_RESEARCH_QUESTIONS = (
    "customer_complaints", "purchase_requests", "recommendation_requests", "comparison_intent",
    "premium_increase", "claim_problems", "switching", "cancellation", "agent_service",
    "policy_confusion", "trust_and_scam", "family_insurance", "SME_insurance", "takaful",
    "agent_tools_and_spending", "agent_lead_demand", "willingness_to_pay", "all",
)

QUESTION_GROUPS: dict[str, tuple[str, ...]] = {
    "customer_complaints": ("premium_increase", "claim_problem", "agent_service", "policy_confusion", "trust_and_scam"),
    "purchase_requests": ("purchase_request",),
    "recommendation_requests": ("recommendation_request",),
    "comparison_intent": ("comparison",),
    "premium_increase": ("premium_increase",),
    "claim_problems": ("claim_problem",),
    "switching": ("switching",),
    "cancellation": ("cancellation",),
    "agent_service": ("agent_service",),
    "policy_confusion": ("policy_confusion",),
    "trust_and_scam": ("trust_and_scam",),
    "family_insurance": ("family_and_parents",),
    "SME_insurance": ("SME_and_group_insurance",),
    "takaful": ("takaful",),
    "agent_tools_and_spending": ("software_and_service_spending", "insurance_agent_workflow"),
    "agent_lead_demand": ("insurance_agent_workflow",),
    "willingness_to_pay": ("software_and_service_spending",),
}

SCHEDULE_GROUPS = {
    "daily": ("purchase_request", "recommendation_request", "switching", "claim_problem", "insurer_specific"),
    "weekly": ("premium_increase", "agent_service", "comparison", "cancellation", "family_and_parents", "SME_and_group_insurance", "takaful"),
    "monthly": ("policy_confusion", "trust_and_scam", "software_and_service_spending", "insurance_agent_workflow"),
}

CONTROLLED_QUERIES = (
    "马来西亚 医疗卡 求推荐",
    "大马 父母 医疗保险 哪个好",
    "Great Eastern medical card 涨价",
    "Malaysia insurance claim rejected what to do",
    "想换保险 马来西亚",
    "找可靠保险代理 雪兰莪",
)


def load_query_groups(path: Path = Path("config/insurance_malaysia.yaml")) -> dict[str, list[str]]:
    raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    return {str(key): [str(item) for item in values] for key, values in raw.get("query_groups", {}).items()}


def insurance_queries(research_question: str = "all", limit: int | None = None) -> list[str]:
    groups = load_query_groups()
    selected_groups = tuple(groups) if research_question == "all" else QUESTION_GROUPS.get(research_question, ())
    result: list[str] = []
    seen: set[str] = set()
    for group in selected_groups:
        for query in groups.get(group, []):
            if query not in seen:
                seen.add(query)
                result.append(query)
    return result[:limit] if limit else result


def scheduled_queries(frequency: str) -> list[str]:
    groups = load_query_groups()
    return [query for group in SCHEDULE_GROUPS.get(frequency, ()) for query in groups.get(group, [])]


@dataclass(frozen=True)
class CrawlPlan:
    frequency: str
    selected_queries: tuple[str, ...]
    expected_max_requests: int
    expected_max_post_opens: int
    estimated_runtime_minutes: int


def build_crawl_plan(frequency: str, query_limit: int | None = None, posts_per_query: int = 10) -> CrawlPlan:
    queries = scheduled_queries(frequency)
    if query_limit:
        queries = queries[:query_limit]
    opens = min(100, len(queries) * min(15, max(1, int(posts_per_query * 0.30))))
    requests = len(queries) + opens + opens
    return CrawlPlan(
        frequency=frequency,
        selected_queries=tuple(queries),
        expected_max_requests=requests,
        expected_max_post_opens=opens,
        estimated_runtime_minutes=max(1, int((requests * 8 + opens * 7) / 60)),
    )
