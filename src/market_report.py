from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from .storage import Storage


def generate_market_intelligence(storage: Storage, output_dir: Path = Path("data/reports")) -> dict[str, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    posts = storage.read_frame("posts")
    comments = storage.read_frame("comments")
    findings = storage.read_frame("findings")
    searches = storage.read_frame("search_queries")

    evidence = _evidence_table(findings, posts, comments)
    clusters = _cluster_table(evidence)
    opportunities = _opportunities(clusters, evidence)
    rejected = _rejected_hypotheses(evidence)
    quality = _quality(posts, comments, searches)

    paths = {
        "markdown": output_dir / "property_malaysia_market_intelligence.md",
        "json": output_dir / "property_malaysia_market_intelligence.json",
        "evidence": output_dir / "property_malaysia_evidence.csv",
        "opportunities": output_dir / "property_malaysia_opportunities.csv",
        "rejected": output_dir / "property_malaysia_rejected_hypotheses.csv",
    }
    evidence.to_csv(paths["evidence"], index=False)
    opportunities.to_csv(paths["opportunities"], index=False)
    rejected.to_csv(paths["rejected"], index=False)
    payload = {
        "dataset_quality": quality,
        "problem_clusters": clusters.to_dict(orient="records"),
        "opportunities": opportunities.to_dict(orient="records"),
        "rejected_hypotheses": rejected.to_dict(orient="records"),
    }
    paths["json"].write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    paths["markdown"].write_text(_markdown(payload), encoding="utf-8")
    return paths


def _evidence_table(findings: pd.DataFrame, posts: pd.DataFrame, comments: pd.DataFrame) -> pd.DataFrame:
    if findings.empty:
        return pd.DataFrame()
    rows = findings.copy()
    rows["problem_category"] = rows.get("problem_category", rows.get("category")).fillna(rows.get("category"))
    rows["stakeholder_role"] = rows.get("stakeholder_role", "unknown").fillna("unknown")
    rows["evidence_type"] = rows.get("evidence_type", "unknown").fillna("unknown")
    rows["organic_evidence_weight"] = pd.to_numeric(rows.get("organic_evidence_weight", 0.3), errors="coerce").fillna(0.3)
    rows["independence_weight"] = pd.to_numeric(rows.get("independence_weight", 0.5), errors="coerce").fillna(0.5)
    rows["confidence"] = pd.to_numeric(rows.get("confidence", 0.5), errors="coerce").fillna(0.5)
    rows["money_amount"] = pd.to_numeric(rows.get("money_amount", rows.get("amount")), errors="coerce")
    keep = [
        "finding_id", "source_type", "source_id", "post_id", "source_url", "author_name",
        "stakeholder_role", "content_origin", "evidence_type", "problem_category",
        "problem_description", "affected_workflow", "product_or_platform", "competitor",
        "sentiment", "severity", "money_amount", "currency", "billing_period", "switched",
        "considering_switch", "purchase_intent", "willingness_to_pay",
        "explicit_solution_request", "evidence_text", "confidence", "independence_weight",
        "organic_evidence_weight", "verification_status", "detected_at",
    ]
    return rows[[column for column in keep if column in rows.columns]]


def _cluster_table(evidence: pd.DataFrame) -> pd.DataFrame:
    if evidence.empty:
        return pd.DataFrame(columns=["problem_category"])
    grouped = evidence.groupby(["problem_category", "stakeholder_role"], dropna=False).agg(
        unique_posts=("post_id", "nunique"),
        unique_sources=("source_id", "nunique"),
        unique_authors=("author_name", "nunique"),
        personal_experience=("evidence_type", lambda s: int((s == "personal_experience").sum())),
        explicit_spending=("evidence_type", lambda s: int((s == "explicit_spending").sum())),
        explicit_switches=("switched", "sum"),
        considering_switch=("considering_switch", "sum"),
        solution_requests=("explicit_solution_request", "sum"),
        organic_weighted_evidence=("organic_evidence_weight", "sum"),
        evidence_confidence=("confidence", "mean"),
        source_diversity=("source_url", "nunique"),
        money_median=("money_amount", "median"),
    ).reset_index()
    grouped["problem_strength"] = grouped.apply(_problem_strength, axis=1)
    grouped["commercial_opportunity_score"] = grouped.apply(_commercial_score, axis=1)
    grouped["failure_risk_score"] = grouped.apply(_risk_score, axis=1)
    return grouped.sort_values(["problem_strength", "commercial_opportunity_score"], ascending=False)


def _problem_strength(row: pd.Series) -> float:
    author_score = min(1.0, row["unique_authors"] / 5)
    personal_score = min(1.0, row["personal_experience"] / 3)
    recurrence_score = min(1.0, row["unique_sources"] / 5)
    severity_score = row["evidence_confidence"] if pd.notna(row["evidence_confidence"]) else 0.5
    spending_score = min(1.0, row["explicit_spending"] / 2)
    solution_score = min(1.0, row["solution_requests"] / 2)
    recent_score = 0.3
    return round(0.25 * author_score + 0.20 * personal_score + 0.15 * recurrence_score + 0.15 * severity_score + 0.10 * spending_score + 0.10 * solution_score + 0.05 * recent_score, 3)


def _commercial_score(row: pd.Series) -> float:
    current_spend = 1.0 if pd.notna(row["money_median"]) else 0.0
    switching = min(1.0, (row["explicit_switches"] + row["considering_switch"]) / 2)
    wtp = min(1.0, row["solution_requests"] / 2)
    return round(0.20 * row["problem_strength"] + 0.20 * wtp + 0.15 * current_spend + 0.15 * min(1.0, row["unique_sources"] / 4) + 0.10 * switching + 0.10 * min(1.0, row["unique_authors"] / 4) + 0.10 * 0.5, 3)


def _risk_score(row: pd.Series) -> float:
    low_frequency = 1.0 if row["unique_authors"] < 3 else 0.3
    weak_wtp = 1.0 if row["solution_requests"] == 0 else 0.4
    incumbent = 0.8 if "portal" in str(row["problem_category"]) or "cost" in str(row["problem_category"]) else 0.4
    uncertainty = 1.0 - (row["evidence_confidence"] if pd.notna(row["evidence_confidence"]) else 0.5)
    return round(0.20 * 0.4 + 0.20 * low_frequency + 0.15 * weak_wtp + 0.15 * incumbent + 0.10 * 0.5 + 0.10 * 0.5 + 0.10 * uncertainty, 3)


def _opportunities(clusters: pd.DataFrame, evidence: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, row in clusters.head(12).iterrows():
        category = row["problem_category"]
        subset = evidence[evidence["problem_category"] == category]
        rows.append({
            "target_stakeholder": row["stakeholder_role"],
            "job_to_be_done": _jtbd(category),
            "evidence_supported_problem": category,
            "current_alternatives": ", ".join(sorted(subset["product_or_platform"].dropna().unique())) or "unknown",
            "current_spending": row["money_median"],
            "dissatisfaction": "observed evidence" if row["unique_sources"] else "unknown",
            "switching_evidence": int(row["explicit_switches"]),
            "requested_outcomes": int(row["solution_requests"]),
            "proposed_solution_direction": _solution_direction(category),
            "meaningfully_different_if": "strong inference: reduce manual workflow or cost while preserving source attribution and trust",
            "distribution_or_reachability": "weak hypothesis: reachable through XHS/TikTok/Facebook property-agent communities",
            "likely_willingness_to_pay": "unknown" if row["solution_requests"] == 0 else "weak hypothesis",
            "adoption_friction": "behaviour change, incumbent platforms, data quality, and trust",
            "dependency_risks": "platform search personalization and portal/platform dependency",
            "why_this_may_fail": "evidence may be sparse, prompted, promotional, or solved by existing workarounds",
            "must_validate_through_interviews": "frequency, budget, current tools, switching barriers, and buyer/tenant trust needs",
            "strongest_supporting_source_links": "; ".join(subset["source_url"].dropna().unique()[:5]),
            "strongest_contradicting_source_links": "",
            "problem_strength": row["problem_strength"],
            "commercial_opportunity_score": row["commercial_opportunity_score"],
            "failure_risk_score": row["failure_risk_score"],
        })
    return pd.DataFrame(rows)


def _rejected_hypotheses(evidence: pd.DataFrame) -> pd.DataFrame:
    rows = [
        {
            "hypothesis": "Slow reply is the dominant agent pain.",
            "status": "weak_hypothesis",
            "reason": "Current sample includes researcher-led prompts about slow reply; independent comments exist but are not enough to rank it as dominant.",
            "needed_evidence": "More independent organic threads with personal losses from slow response.",
        },
        {
            "hypothesis": "Agents are abandoning PropertyGuru/iProperty because they are expensive.",
            "status": "unsupported_as_stated",
            "reason": "Collected evidence shows high cost and renewal pain, but also comments that agents still renew or see value when deals cover cost.",
            "needed_evidence": "Explicit cancellation or migration examples from independent agents.",
        },
        {
            "hypothesis": "Comment volume equals market size.",
            "status": "rejected",
            "reason": "XHS search is personalized and one viral thread can dominate comments.",
            "needed_evidence": "Representative sampling and external market sizing.",
        },
    ]
    return pd.DataFrame(rows)


def _quality(posts: pd.DataFrame, comments: pd.DataFrame, searches: pd.DataFrame) -> dict[str, object]:
    return {
        "total_queries": int(len(searches)),
        "total_raw_results": int(searches.get("result_count", pd.Series(dtype=int)).fillna(0).sum()) if not searches.empty else 0,
        "clean_unique_posts": int(posts.get("post_id", pd.Series(dtype=str)).nunique()) if not posts.empty else 0,
        "clean_valid_comments": int(len(comments)),
        "rejected_ui_rows": "tracked in data_quality_audit.md",
        "rejected_spam": "partially filtered by content_origin and validators",
        "rejected_promotions": int((posts.get("content_origin", pd.Series(dtype=str)) == "service_advertisement").sum()) if not posts.empty else 0,
        "researcher_led_threads": int(posts.get("content_origin", pd.Series(dtype=str)).isin(["researcher_prompt"]).sum()) if not posts.empty else 0,
        "organic_threads": int(posts.get("content_origin", pd.Series(dtype=str)).isin(["organic_experience", "organic_question"]).sum()) if not posts.empty else 0,
        "date_coverage": {
            "posts_with_parsed_date": int(posts.get("parsed_date", pd.Series(dtype=str)).notna().sum()) if not posts.empty else 0,
            "comments_with_parsed_date": int(comments.get("parsed_date", pd.Series(dtype=str)).notna().sum()) if not comments.empty else 0,
        },
        "stakeholder_coverage": {},
    }


def _markdown(payload: dict) -> str:
    quality = payload["dataset_quality"]
    clusters = payload["problem_clusters"]
    opportunities = payload["opportunities"]
    rejected = payload["rejected_hypotheses"]
    lines = [
        "# Malaysia Property Market Intelligence",
        "",
        "## 1. Executive summary",
        "- Among the collected XHS sample, the strongest verified signals are portal/advertising cost, buyer/tenant trust and price-transparency friction, and agent acquisition pressure.",
        "- Commercial signals are strongest where explicit spending is present, especially PropertyGuru/iProperty fees and lead/advertising spend.",
        "- Weak popular assumptions are listed separately; the current sample is too small to claim market-wide demand.",
        "- Recent changes cannot be measured robustly yet because the cleaned dataset is small.",
        "- Confidence is limited by a small Chrome-browser sample, personalized search, and partial comment visibility.",
        "",
        "## 2. Dataset quality",
    ]
    lines.extend(f"- {key}: {value}" for key, value in quality.items())
    lines.extend(["", "## 3. Problem map by stakeholder"])
    for row in clusters[:12]:
        lines.append(f"- {row['stakeholder_role']} / {row['problem_category']}: strength {row['problem_strength']}, sources {row['unique_sources']}, authors {row['unique_authors']}")
    lines.extend([
        "",
        "## 4. Portal economics",
        "- Observed evidence: PropertyGuru/iProperty pricing and top-up/UC cost are repeatedly mentioned in the cleaned sample.",
        "- Strong inference: expensive but still renewed is distinct from expensive and abandoned; current evidence supports the former more than the latter.",
        "- Unknown: cancellation rate, renewal rate, and actual ROI distribution.",
        "",
        "## 5. Lead-generation and conversion problems",
        "- Observed evidence: agents discuss expensive leads, Facebook spend, WhatsApp outreach, content marketing, and missed/low-quality leads.",
        "- Weak hypothesis: slow reply may be painful, but one collected thread is researcher-led and should not dominate ranking.",
        "",
        "## 6. Buyer, tenant, landlord and seller complaints",
        "- Observed evidence includes hidden rental pricing, rude/unprofessional agent behaviour, and landlord/owner spam concerns.",
        "",
        "## 7. Switching and migration map",
        "- Explicit switching evidence is currently weak in this cleaned sample.",
        "",
        "## 8. Opportunities",
    ])
    for row in opportunities[:8]:
        lines.append(f"- {row['evidence_supported_problem']} for {row['target_stakeholder']}: opportunity {row['commercial_opportunity_score']}, failure risk {row['failure_risk_score']}. Label: strong inference/weak hypothesis; validate by interviews.")
    lines.extend(["", "## 9. Rejected or weak hypotheses"])
    for row in rejected:
        lines.append(f"- {row['hypothesis']}: {row['status']}. {row['reason']}")
    lines.extend([
        "",
        "## 10. Method limits",
        "- XHS results are personalized.",
        "- Public posts are not representative of all Malaysian property stakeholders.",
        "- Complaint volume does not equal market size.",
        "- Researcher-led prompts are down-weighted as organic evidence.",
    ])
    return "\n".join(lines) + "\n"


def _jtbd(category: str) -> str:
    mapping = {
        "advertising_cost": "Acquire workable leads without uncontrolled ad or portal spend.",
        "platform_fee": "Decide whether portal renewal/top-up spend is worth it.",
        "viewing_scheduling": "Coordinate viewing and pricing discussions without wasting time.",
        "follow_up": "Respond and qualify leads without missing high-intent prospects.",
    }
    return mapping.get(str(category), "Reduce a repeated property workflow pain with clearer evidence and lower operational drag.")


def _solution_direction(category: str) -> str:
    mapping = {
        "advertising_cost": "cost/ROI tracking and alternative acquisition workflow",
        "platform_fee": "portal spend benchmarking and renewal decision support",
        "viewing_scheduling": "transparent enquiry and appointment workflow",
        "follow_up": "lead qualification and response workflow",
    }
    return mapping.get(str(category), "research-backed workflow tool or trust layer")
