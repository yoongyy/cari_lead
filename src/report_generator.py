from __future__ import annotations

import json
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd

from .storage import Storage


BRANDS = ["PropertyGuru", "iProperty", "EdgeProp", "Propviss", "TikTok", "XHS", "Facebook", "Mudah"]


def generate_report(storage: Storage, industry: str, days: int, top: int = 20, output_dir: Path = Path("data/reports")) -> tuple[Path, Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    posts = storage.read_frame("posts")
    comments = storage.read_frame("comments")
    findings = storage.read_frame("findings")
    searches = storage.read_frame("search_queries")
    cutoff = pd.Timestamp.utcnow() - pd.Timedelta(days=days)

    if not findings.empty:
        findings["detected_at"] = pd.to_datetime(findings["detected_at"], utc=True, errors="coerce")
        findings = findings[(findings["industry"] == industry) & (findings["detected_at"].isna() | (findings["detected_at"] >= cutoff))]
    if not posts.empty:
        posts["published_at"] = pd.to_datetime(posts["published_at"], utc=True, errors="coerce")
    relevant_posts = posts[posts.get("is_malaysia_relevant", pd.Series(dtype=int)) == 1] if not posts.empty else posts
    relevant_comments = comments[comments.get("is_malaysia_relevant", pd.Series(dtype=int)) == 1] if not comments.empty else comments

    top_complaints = _top_complaints(findings, top)
    brand_counts = _brand_counts(findings)
    switching = _switching(findings)
    spending = _spending(findings)
    demand = findings[findings["purchase_intent"] == 1] if not findings.empty and "purchase_intent" in findings else pd.DataFrame()
    trends = _trends(findings)

    stem = f"{industry}_{days}_days"
    md_path = output_dir / f"{stem}.md"
    csv_path = output_dir / f"{stem}.csv"
    json_path = output_dir / f"{stem}.json"

    top_complaints.to_csv(csv_path, index=False)
    payload = {
        "generated_at": datetime.utcnow().isoformat(),
        "coverage": {
            "days": days,
            "searches": int(len(searches)),
            "unique_posts": int(posts["post_id"].nunique()) if "post_id" in posts else 0,
            "unique_comments": int(comments["comment_id"].nunique()) if "comment_id" in comments else 0,
            "malaysia_relevant_records": int(len(relevant_posts) + len(relevant_comments)),
            "source_keywords": sorted(searches["keyword"].dropna().unique().tolist()) if "keyword" in searches else [],
        },
        "top_complaints": top_complaints.to_dict(orient="records"),
        "brands": brand_counts,
        "switching": switching,
        "spending": spending,
        "trends": trends,
    }
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    md_path.write_text(_markdown(payload, findings, demand), encoding="utf-8")
    return md_path, csv_path, json_path


def _top_complaints(findings: pd.DataFrame, top: int) -> pd.DataFrame:
    if findings.empty:
        return pd.DataFrame(columns=["category", "unique_author_count", "unique_source_count", "confidence_adjusted_count", "evidence_links"])
    complaint_rows = findings[findings["complaint"] == 1]
    if complaint_rows.empty:
        complaint_rows = findings
    grouped = complaint_rows.groupby("category").agg(
        unique_source_count=("source_id", "nunique"),
        confidence_adjusted_count=("confidence", "sum"),
        evidence_links=("source_url", lambda s: "; ".join([str(x) for x in s.dropna().unique()[:5]])),
    ).reset_index()
    grouped["unique_author_count"] = None
    return grouped.sort_values(["unique_source_count", "confidence_adjusted_count"], ascending=False).head(top)


def _brand_counts(findings: pd.DataFrame) -> dict[str, int]:
    if findings.empty:
        return {brand: 0 for brand in BRANDS}
    text = " ".join(findings[["brand", "evidence_text"]].fillna("").astype(str).agg(" ".join, axis=1).tolist()).lower()
    return {brand: text.count(brand.lower()) for brand in BRANDS}


def _switching(findings: pd.DataFrame) -> list[dict[str, object]]:
    if findings.empty:
        return []
    rows = findings[(findings["switched"] == 1) | (findings["considering_switch"] == 1)]
    if rows.empty:
        return []
    grouped = rows.groupby(["switching_from", "switching_to"], dropna=False).agg(
        explicit_switch_count=("switched", "sum"),
        considering_switch_count=("considering_switch", "sum"),
        evidence_links=("source_url", lambda s: "; ".join([str(x) for x in s.dropna().unique()[:5]])),
    ).reset_index()
    return grouped.to_dict(orient="records")


def _spending(findings: pd.DataFrame) -> list[dict[str, object]]:
    if findings.empty:
        return []
    rows = findings[findings["pricing_mentioned"] == 1].copy()
    if rows.empty:
        return []
    grouped = rows.groupby("currency", dropna=False).agg(
        count=("amount", "count"), median=("amount", "median"),
        evidence_links=("source_url", lambda s: "; ".join([str(x) for x in s.dropna().unique()[:5]])),
    ).reset_index()
    return grouped.to_dict(orient="records")


def _trends(findings: pd.DataFrame) -> dict[str, dict[str, object]]:
    if findings.empty:
        return {}
    now = pd.Timestamp.utcnow()
    result: dict[str, dict[str, object]] = {}
    for category, rows in findings.groupby("category"):
        cur7 = rows[rows["detected_at"] >= now - pd.Timedelta(days=7)]
        prev7 = rows[(rows["detected_at"] < now - pd.Timedelta(days=7)) & (rows["detected_at"] >= now - pd.Timedelta(days=14))]
        cur30 = rows[rows["detected_at"] >= now - pd.Timedelta(days=30)]
        prev30 = rows[(rows["detected_at"] < now - pd.Timedelta(days=30)) & (rows["detected_at"] >= now - pd.Timedelta(days=60))]
        result[str(category)] = {
            "current_7_days": int(len(cur7)),
            "prior_7_days": int(len(prev7)),
            "current_30_days": int(len(cur30)),
            "prior_30_days": int(len(prev30)),
            "change_7_days": _change(len(cur7), len(prev7)),
            "change_30_days": _change(len(cur30), len(prev30)),
            "source_diversity": int(rows["source_url"].nunique()),
            "confidence_adjusted_count": float(rows["confidence"].sum()),
        }
    return result


def _change(current: int, prior: int) -> str:
    if prior < 2 and current > prior:
        return "newly emerging"
    if prior == 0:
        return "0%"
    return f"{((current - prior) / prior) * 100:.0f}%"


def _markdown(payload: dict, findings: pd.DataFrame, demand: pd.DataFrame) -> str:
    coverage = payload["coverage"]
    lines = [
        f"# {coverage['days']}-Day Malaysia Property XHS Research Report",
        "",
        "## Data coverage",
        f"- Crawl period: last {coverage['days']} days",
        f"- Number of searches: {coverage['searches']}",
        f"- Unique posts: {coverage['unique_posts']}",
        f"- Unique comments: {coverage['unique_comments']}",
        f"- Malaysia-relevant records: {coverage['malaysia_relevant_records']}",
        f"- Source keywords: {', '.join(coverage['source_keywords']) or 'none'}",
        "",
        "## Top complaints",
    ]
    for row in payload["top_complaints"]:
        lines.append(f"- {row['category']}: {row['unique_source_count']} unique sources, confidence-adjusted {row['confidence_adjusted_count']:.2f}. Evidence: {row.get('evidence_links') or 'none'}")
    lines.extend(["", "## Brands and platforms mentioned"])
    for brand, count in payload["brands"].items():
        lines.append(f"- {brand}: {count}")
    lines.extend(["", "## Switching signals"])
    if payload["switching"]:
        for row in payload["switching"]:
            lines.append(f"- From {row.get('switching_from') or 'unknown'} to {row.get('switching_to') or 'unknown'}: explicit {row['explicit_switch_count']}, considering {row['considering_switch_count']}. Evidence: {row.get('evidence_links') or 'none'}")
    else:
        lines.append("- No switching signals found.")
    lines.extend(["", "## Spending signals"])
    if payload["spending"]:
        for row in payload["spending"]:
            lines.append(f"- {row.get('currency') or 'unknown'}: {row['count']} mentions, median {row.get('median')}. Evidence: {row.get('evidence_links') or 'none'}")
    else:
        lines.append("- No pricing or fee amounts found.")
    lines.extend(["", "## Demand signals"])
    if not demand.empty:
        for _, row in demand.head(10).iterrows():
            lines.append(f"- {row['category']}: {row['evidence_text']} ({row.get('source_url') or 'no link'})")
    else:
        lines.append("- No demand signals found.")
    lines.extend([
        "",
        "## Product opportunities",
        "- Evidence-supported opportunities should be inferred from repeated categories above; this report does not invent unsupported opportunities.",
        "",
        "## Limitations",
        "- XHS search results are personalized.",
        "- Public posts are not representative of all agents.",
        "- Complaint volume does not equal market size.",
        "- Public switching intent does not equal actual churn.",
        "- Deleted/private posts are unavailable.",
    ])
    return "\n".join(lines) + "\n"
