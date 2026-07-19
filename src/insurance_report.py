from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd

from .insurance_classifier import PHONE_PATTERN, redact_phone_numbers
from .storage import Storage


REPORT_SECTIONS = (
    "Executive summary", "Research coverage", "Top customer complaints",
    "Premium-increase discussions", "Claim problems", "Agent-service complaints",
    "Product confusion", "Most-mentioned insurers", "Insurance products customers seek",
    "Recommendation and comparison requests", "Switching and cancellation signals",
    "Existing spending and stated budgets", "Trust and scam concerns", "What customers praise",
    "Growing and declining topics", "Strong commercial opportunities",
    "Weak or misleading assumptions", "Limitations",
)


def generate_insurance_reports(
    storage: Storage,
    output_dir: Path = Path("data/reports"),
) -> dict[str, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    findings = _safe_findings(storage.read_frame("insurance_findings"))
    metrics = storage.read_frame("insurance_crawl_metrics")
    searches = storage.read_frame("search_queries")
    evidence_path = output_dir / "insurance_malaysia_evidence.csv"
    customer_json_path = output_dir / "insurance_malaysia_customer_voice.json"
    customer_md_path = output_dir / "insurance_malaysia_customer_voice.md"
    sales_csv_path = output_dir / "insurance_malaysia_sales_opportunities.csv"
    sales_json_path = output_dir / "insurance_malaysia_sales_opportunities.json"
    sales_md_path = output_dir / "insurance_malaysia_sales_opportunities.md"
    free_path = output_dir / "insurance_malaysia_free_summary.json"
    paid_path = output_dir / "insurance_malaysia_paid_detail.json"

    findings.to_csv(evidence_path, index=False)
    customer = _customer_payload(findings, metrics, searches)
    customer_json_path.write_text(json.dumps(customer, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    customer_md_path.write_text(_customer_markdown(customer), encoding="utf-8")

    sales = _sales_rows(findings)
    pd.DataFrame(sales).to_csv(sales_csv_path, index=False)
    sales_payload = {
        "generated_at": _now(),
        "safety_note": "Public-source research only. Do not mass-message users or treat complaint-only records as sales-ready.",
        "opportunities": sales,
    }
    sales_json_path.write_text(json.dumps(sales_payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    sales_md_path.write_text(_sales_markdown(sales), encoding="utf-8")

    free = {
        "generated_at": _now(),
        "top_complaint_categories": customer["top_customer_complaints"],
        "insurer_mention_counts": customer["insurer_mentions"],
        "trending_customer_questions": customer["trends"],
        "anonymised_opportunity_counts": _counts(findings, "sales_opportunity_level"),
    }
    _assert_free_summary_anonymous(free)
    free_path.write_text(json.dumps(free, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    paid = {
        "generated_at": _now(),
        "records": sales,
        "interface": {
            "save_status_values": ["new", "reviewed", "saved", "expired"],
            "claim_status_values": ["unclaimed", "claimed"],
        },
    }
    paid_path.write_text(json.dumps(paid, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    return {
        "customer_markdown": customer_md_path, "customer_json": customer_json_path,
        "evidence": evidence_path, "sales_markdown": sales_md_path,
        "sales_json": sales_json_path, "sales_csv": sales_csv_path,
        "free_summary": free_path, "paid_detail": paid_path,
    }


def _safe_findings(frame: pd.DataFrame) -> pd.DataFrame:
    required = {
        "finding_id": "", "source_type": "", "source_id": "", "source_url": None,
        "author_name": None, "published_at": None, "location_signal": None,
        "classification": "general_discussion", "complaint_category": None,
        "insurer": None, "insurance_product": None, "premium_amount": None,
        "premium_currency": None, "premium_period": None, "old_premium": None,
        "new_premium": None, "percentage_increase": None, "claim_status": None,
        "agent_service_issue": None, "cancellation_intent": False,
        "considering_switch": False, "explicit_switch": False,
        "recommendation_request": False, "comparison_request": False,
        "purchase_request": False, "claim_assistance_request": False,
        "sales_opportunity_level": "no_sales_signal", "research_value_score": 0.0,
        "sales_opportunity_score": 0.0, "evidence_text": "", "confidence": 0.0,
        "suggested_public_response": None, "status": "new", "detected_at": None,
    }
    result = frame.copy()
    for column, default in required.items():
        if column not in result:
            result[column] = default
    if not result.empty:
        result["evidence_text"] = result["evidence_text"].fillna("").map(redact_phone_numbers)
        result["published_at"] = pd.to_datetime(result["published_at"], utc=True, errors="coerce")
        result["detected_at"] = pd.to_datetime(result["detected_at"], utc=True, errors="coerce")
    return result


def _customer_payload(findings: pd.DataFrame, metrics: pd.DataFrame, searches: pd.DataFrame) -> dict[str, Any]:
    complaints = findings[findings["complaint_category"].notna()] if not findings.empty else findings
    purchases = findings[findings["purchase_request"] == True] if not findings.empty else findings  # noqa: E712
    recommendations = findings[findings["recommendation_request"] == True] if not findings.empty else findings  # noqa: E712
    comparisons = findings[findings["comparison_request"] == True] if not findings.empty else findings  # noqa: E712
    opportunities = findings[findings["sales_opportunity_level"].isin(["high", "very_high"])] if not findings.empty else findings
    return {
        "generated_at": _now(),
        "executive_summary": {
            "evidence_records": int(len(findings)),
            "complaint_records": int(len(complaints)),
            "active_purchase_requests": int(len(purchases)),
            "recommendation_requests": int(len(recommendations)),
            "high_or_very_high_opportunities": int(len(opportunities)),
            "warning": "Complaint volume is not market size, and complaint-only posts are not automatically leads.",
        },
        "coverage": {
            "searches": int(len(searches[searches.get("keyword", pd.Series(dtype=str)).fillna("").str.contains("insurance|保险|医疗卡|takaful", case=False, regex=True)])) if not searches.empty else 0,
            "unique_sources": int(findings["source_id"].nunique()) if not findings.empty else 0,
            "public_source_links": int(findings["source_url"].nunique()) if not findings.empty else 0,
            "latest_run_metrics": metrics.tail(1).to_dict(orient="records")[0] if not metrics.empty else {},
        },
        "top_customer_complaints": _counts(complaints, "complaint_category"),
        "premium_increase_discussions": _records(findings[findings["complaint_category"] == "premium_increase"]),
        "claim_problems": _records(findings[findings["claim_status"].notna()]),
        "agent_service_complaints": _records(findings[findings["agent_service_issue"].notna()]),
        "product_confusion": _records(findings[findings["complaint_category"] == "product_confusion"]),
        "insurer_mentions": _counts(findings, "insurer"),
        "products_sought": _counts(pd.concat([purchases, recommendations]), "insurance_product"),
        "recommendation_and_comparison_requests": _records(pd.concat([recommendations, comparisons]).drop_duplicates("finding_id")),
        "switching_and_cancellation": _records(findings[
            findings[["considering_switch", "explicit_switch", "cancellation_intent"]].fillna(False).any(axis=1)
        ]),
        "spending_and_budgets": _spending(findings),
        "trust_and_scam": _records(findings[findings["complaint_category"] == "trust_and_scam"]),
        "praise": _records(findings[findings["classification"] == "positive_feedback"]),
        "trends": _trends(findings),
        "strong_commercial_opportunities": _records(opportunities),
        "weak_assumptions": [
            "A complaint without a request for help is not a sales-ready opportunity.",
            "Insurer mention counts do not measure market share or satisfaction.",
            "Search-result personalization prevents population-level prevalence claims.",
        ],
        "limitations": [
            "Only public XHS content visible to the authenticated account is included.",
            "No hidden contact details, private profile data, phone numbers, or private email addresses are retained.",
            "Rule-based classifications require human review before commercial use.",
        ],
    }


def _records(frame: pd.DataFrame, limit: int = 20) -> list[dict[str, Any]]:
    columns = [
        "source_url", "published_at", "location_signal", "insurer", "insurance_product",
        "classification", "complaint_category", "sales_opportunity_level",
        "sales_opportunity_score", "confidence", "evidence_text",
    ]
    if frame.empty:
        return []
    rows = frame.sort_values("research_value_score", ascending=False).head(limit)
    return rows[columns].where(pd.notna(rows[columns]), None).to_dict(orient="records")


def _counts(frame: pd.DataFrame, column: str) -> list[dict[str, Any]]:
    if frame.empty or column not in frame:
        return []
    counts = frame[column].dropna().astype(str).value_counts()
    return [{column: key, "count": int(value)} for key, value in counts.items()]


def _spending(findings: pd.DataFrame) -> list[dict[str, Any]]:
    if findings.empty:
        return []
    rows = findings[findings["premium_amount"].notna()]
    return _records(rows)


def _trends(findings: pd.DataFrame) -> list[dict[str, Any]]:
    if findings.empty:
        return []
    now = pd.Timestamp.now(tz="UTC")
    rows = findings.copy()
    rows["topic"] = rows["complaint_category"].fillna(rows["classification"])
    result = []
    for topic, group in rows.groupby("topic"):
        current = int((group["detected_at"] >= now - pd.Timedelta(days=30)).sum())
        prior = int(((group["detected_at"] < now - pd.Timedelta(days=30)) & (group["detected_at"] >= now - pd.Timedelta(days=60))).sum())
        direction = "growing" if current >= 3 and current > prior else ("shrinking" if prior >= 3 and current < prior else "insufficient_evidence")
        result.append({"topic": topic, "current_30_days": current, "prior_30_days": prior, "direction": direction})
    return sorted(result, key=lambda row: row["current_30_days"], reverse=True)


def _sales_rows(findings: pd.DataFrame) -> list[dict[str, Any]]:
    if findings.empty:
        return []
    rank = {"very_high": 0, "high": 1, "medium": 2, "low": 3, "no_sales_signal": 4}
    rows = findings.copy()
    rows["_rank"] = rows["sales_opportunity_level"].map(rank).fillna(5)
    rows = rows.sort_values(["_rank", "sales_opportunity_score"], ascending=[True, False])
    result = []
    for _, row in rows.iterrows():
        complaint_only = row.get("classification") == "complaint_only"
        result.append({
            "opportunity_category": row.get("classification"),
            "public_source_url": row.get("source_url"),
            "public_author_name": row.get("author_name"),
            "published_date": row.get("published_at"),
            "location_signal": row.get("location_signal"),
            "insurance_product": row.get("insurance_product"),
            "insurer_mentioned": row.get("insurer"),
            "short_evidence_excerpt": redact_phone_numbers(str(row.get("evidence_text") or ""))[:300],
            "opportunity_type": "complaint_only_not_sales_ready" if complaint_only else row.get("classification"),
            "sales_opportunity_score": float(row.get("sales_opportunity_score") or 0),
            "sales_opportunity_level": row.get("sales_opportunity_level"),
            "confidence": float(row.get("confidence") or 0),
            "suggested_helpful_response_angle": row.get("suggested_public_response"),
            "safety_note": "Public helpful response only; no unsolicited DM, claim promise, or savings promise.",
            "status": row.get("status") or "new",
            "claimed_status": "unclaimed",
        })
    return result


def _customer_markdown(payload: dict[str, Any]) -> str:
    lines = ["# Malaysia Insurance Customer Voice Report", ""]
    key_map = {
        "Executive summary": "executive_summary", "Research coverage": "coverage",
        "Top customer complaints": "top_customer_complaints",
        "Premium-increase discussions": "premium_increase_discussions",
        "Claim problems": "claim_problems", "Agent-service complaints": "agent_service_complaints",
        "Product confusion": "product_confusion", "Most-mentioned insurers": "insurer_mentions",
        "Insurance products customers seek": "products_sought",
        "Recommendation and comparison requests": "recommendation_and_comparison_requests",
        "Switching and cancellation signals": "switching_and_cancellation",
        "Existing spending and stated budgets": "spending_and_budgets",
        "Trust and scam concerns": "trust_and_scam", "What customers praise": "praise",
        "Growing and declining topics": "trends",
        "Strong commercial opportunities": "strong_commercial_opportunities",
        "Weak or misleading assumptions": "weak_assumptions", "Limitations": "limitations",
    }
    for index, title in enumerate(REPORT_SECTIONS, start=1):
        lines.extend([f"## {index}. {title}", ""])
        value = payload.get(key_map[title])
        if not value:
            lines.append("- No verified evidence in the current dataset.")
        elif isinstance(value, dict):
            lines.extend(f"- {key.replace('_', ' ').title()}: {item}" for key, item in value.items())
        elif isinstance(value, list):
            for item in value[:20]:
                lines.append(f"- {json.dumps(item, ensure_ascii=False, default=str)}" if isinstance(item, dict) else f"- {item}")
        lines.append("")
    return "\n".join(lines)


def _sales_markdown(rows: list[dict[str, Any]]) -> str:
    lines = [
        "# Malaysia Insurance Sales Opportunity Report", "",
        "Complaint-only records are research evidence, not necessarily sales-ready. Use public, helpful responses only and never automate unsolicited messages.", "",
    ]
    if not rows:
        lines.append("No verified opportunities in the current dataset.")
    for index, row in enumerate(rows, start=1):
        lines.extend([
            f"## {index}. {row['opportunity_type']}",
            f"- Score: {row['sales_opportunity_score']} ({row['sales_opportunity_level']})",
            f"- Product / insurer: {row.get('insurance_product') or 'unknown'} / {row.get('insurer_mentioned') or 'unknown'}",
            f"- Evidence: {row.get('short_evidence_excerpt') or 'none'}",
            f"- Source: {row.get('public_source_url') or 'unavailable'}",
            f"- Helpful response: {row.get('suggested_helpful_response_angle') or 'Human review required; no outreach recommendation.'}",
            f"- Safety: {row['safety_note']}", "",
        ])
    return "\n".join(lines)


def _assert_free_summary_anonymous(payload: dict[str, Any]) -> None:
    serialized = json.dumps(payload, ensure_ascii=False)
    forbidden = ("source_url", "author_name", "http://", "https://")
    if any(term in serialized for term in forbidden):
        raise ValueError("Free summary contains source-identifying data")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
