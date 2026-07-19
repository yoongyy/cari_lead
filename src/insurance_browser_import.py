from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from hashlib import sha1
from pathlib import Path

from .date_parser import MALAYSIA_TZ, parse_xhs_date
from .deduplicator import Deduplicator
from .extraction_quality import canonicalize_rednote_url, classify_content_origin
from .insurance_classifier import InsuranceClassifier, redact_phone_numbers, should_fetch_comments
from .insurance_models import CrawlMetrics
from .models import Comment, Post
from .storage import Storage
from .utils import clean_text


def import_browser_insurance(
    storage: Storage,
    discovery_path: Path,
    details_path: Path,
) -> CrawlMetrics:
    discovery = json.loads(discovery_path.read_text(encoding="utf-8"))
    details = json.loads(details_path.read_text(encoding="utf-8"))
    run_id = storage.create_run("insurance", json.dumps({
        "source": "chrome", "discovery_path": str(discovery_path), "details_path": str(details_path),
    }))
    metrics = CrawlMetrics(run_id=str(run_id), queries_planned=len(discovery.get("queries", {})))
    classifier = InsuranceClassifier()
    comment_dedupe = Deduplicator()
    discovered_ids: set[str] = set()
    query_matches: dict[str, list[str]] = {}
    best_ranks: dict[str, int] = {}
    for query, rows in discovery.get("queries", {}).items():
        query_key = sha1(query.encode()).hexdigest()[:16]
        storage.upsert_state("queries", query_key, {"query": query, "industry": "insurance"})
        storage.save_search_query(run_id, query, "chrome-latest", len(rows))
        for row in rows:
            post_id = _post_id(row.get("url"))
            if not post_id:
                continue
            if post_id in discovered_ids:
                metrics.duplicate_posts += 1
            discovered_ids.add(post_id)
            query_matches.setdefault(post_id, []).append(query)
            best_ranks[post_id] = min(best_ranks.get(post_id, 9999), int(row.get("rank") or 9999))
            storage.upsert_state("discovered_posts", post_id, {
                "post_id": post_id,
                "canonical_url": canonicalize_rednote_url(row.get("url"), post_id),
                "title": clean_text(row.get("title")),
                "snippet": redact_phone_numbers(row.get("cardText")),
                "author_name": _card_author(row.get("cardText"), row.get("title")),
                "date_label": _card_date(row.get("cardText")),
                "discovered_by_queries": list(dict.fromkeys(query_matches[post_id])),
                "best_search_rank": best_ranks[post_id],
                "first_seen_at": _now(), "last_seen_at": _now(),
                "priority_score": row.get("priority_score", 0),
                "detail_status": "pending", "comments_status": "not_fetched",
            })
        storage.upsert_state("query_runs", f"{run_id}:{query_key}", {
            "run_id": run_id, "query": query, "query_key": query_key,
            "status": "completed", "completed_at": _now(),
        })
        metrics.queries_completed += 1
    metrics.discovered_posts = len(discovered_ids)

    for detail in details:
        post_id = str(detail.get("post_id") or _post_id(detail.get("currentUrl")) or "")
        if not post_id:
            continue
        metrics.detail_posts_opened += 1
        url = canonicalize_rednote_url(detail.get("currentUrl") or detail.get("url"), post_id)
        title = redact_phone_numbers(detail.get("title"))
        body = redact_phone_numbers(detail.get("body"))
        date_info = parse_xhs_date(_clean_date(detail.get("date")))
        published = _parsed_datetime(date_info.parsed_date)
        location = "Malaysia" if _has_malaysia(detail.get("date"), title, body) else None
        origin, leading, promo, organic = classify_content_origin(title, body, detail.get("author"))
        post = Post(
            platform="rednote-web", post_id=post_id, url=url, canonical_url=url,
            title=title, body=body, post_body=body, author_name=clean_text(detail.get("author")) or None,
            published_at=published, search_keyword=detail.get("query"), raw_json={},
            is_malaysia_relevant=bool(location), malaysia_score=0.8 if location else 0.4,
            malaysia_signals=["browser_location:malaysia"] if location else [],
            location_label=location, original_date_text=detail.get("date"),
            parsed_date=date_info.parsed_date, date_confidence=date_info.date_confidence,
            extraction_method="chrome_visible_dom", extraction_confidence=0.9,
            content_origin=origin, leading_question_score=leading,
            promotional_score=promo, organic_evidence_weight=organic,
            discovered_by_queries=query_matches.get(post_id, [detail.get("query")]),
            best_search_rank=best_ranks.get(post_id, detail.get("rank")),
            number_of_queries_matched=len(set(query_matches.get(post_id, [detail.get("query")]))),
        )
        finding = classifier.classify(
            "post", post_id, url, f"{title} {body}", author_name=post.author_name,
            published_at=published, location_signal=location,
        )
        if not finding:
            storage.upsert_state("post_fetch_state", post_id, {
                "post_id": post_id, "detail_status": "rejected", "comments_status": "not_fetched",
                "rejection_reason": "unrelated", "last_detail_fetch_at": _now(),
            })
            continue
        rejected = finding.classification in {"vendor_advertisement", "insurance_agent_promotion", "recruitment_content"}
        if rejected:
            metrics.rejected_promotional_posts += 1
            storage.upsert_state("post_fetch_state", post_id, {
                "post_id": post_id, "detail_status": "rejected", "comments_status": "not_fetched",
                "rejection_reason": "promotion_or_recruitment", "last_detail_fetch_at": _now(),
            })
            continue
        storage.save_post(post)
        _save_finding(storage, finding, metrics)
        comments_status = "not_qualified"
        if should_fetch_comments(finding, len(detail.get("comments") or [])):
            comments_status = "fetched"
            metrics.comment_threads_fetched += 1
            for index, raw_comment in enumerate((detail.get("comments") or [])[:30]):
                author, text, date_label, comment_location = _parse_comment(raw_comment)
                text = redact_phone_numbers(text)
                if not text:
                    continue
                comment_id = sha1(f"{post_id}|{author}|{text}".encode()).hexdigest()[:20]
                if comment_dedupe.is_duplicate(comment_id, None, text):
                    metrics.duplicate_comments += 1
                    continue
                metrics.comments_seen += 1
                parsed = parse_xhs_date(date_label)
                comment = Comment(
                    platform="rednote-web", comment_id=comment_id, post_id=post_id, url=url,
                    author_name=author, text=text, created_at=_parsed_datetime(parsed.parsed_date),
                    raw_json={}, is_malaysia_relevant=bool(comment_location or location),
                    location_label=comment_location or location, original_date_text=date_label,
                    parsed_date=parsed.parsed_date, date_confidence=parsed.date_confidence,
                    extraction_method="chrome_visible_comment",
                )
                comment_finding = classifier.classify(
                    "comment", comment_id, url, text, author_name=author,
                    published_at=comment.created_at, location_signal=comment.location_label,
                    post_id=post_id,
                )
                if not comment_finding or comment_finding.promotional_probability >= 0.8:
                    metrics.rejected_promotional_posts += int(bool(comment_finding))
                    continue
                storage.save_comment(comment)
                _save_finding(storage, comment_finding, metrics)
        storage.upsert_state("post_fetch_state", post_id, {
            "post_id": post_id, "canonical_url": url, "detail_status": "fetched",
            "comments_status": comments_status, "last_detail_fetch_at": _now(),
            "last_comment_fetch_at": _now() if comments_status == "fetched" else None,
            "content_hash": sha1(f"{title}|{body}".encode()).hexdigest(),
            "priority_score": detail.get("priority_score", 0), "rejection_reason": None,
        })
        storage.upsert_state("comment_fetch_state", post_id, {
            "post_id": post_id, "comments_status": comments_status,
            "last_comment_fetch_at": _now() if comments_status == "fetched" else None,
        })
    total_discovery_rows = sum(len(rows) for rows in discovery.get("queries", {}).values())
    metrics.requests_avoided = max(0, total_discovery_rows - metrics.detail_posts_opened)
    metrics.requests_total = len(discovery.get("queries", {})) + metrics.detail_posts_opened
    storage.upsert_state("insurance_crawl_metrics", str(run_id), metrics.model_dump(mode="python"))
    storage.finish_run(run_id, "completed")
    return metrics


def _save_finding(storage: Storage, finding, metrics: CrawlMetrics) -> None:
    storage.upsert_state("insurance_findings", finding.finding_id, finding.model_dump(mode="python"))
    metrics.active_purchase_requests += int(finding.purchase_request)
    metrics.recommendation_requests += int(finding.recommendation_request)
    metrics.switching_signals += int(finding.considering_switch or finding.explicit_switch or finding.cancellation_intent)
    metrics.claim_help_signals += int(finding.claim_assistance_request)


def _parse_comment(raw: str) -> tuple[str | None, str, str | None, str | None]:
    parts = [clean_text(part) for part in str(raw).splitlines() if clean_text(part)]
    if not parts:
        return None, "", None, None
    author = parts[0] if len(parts) > 1 else None
    text = parts[1] if len(parts) > 1 else parts[0]
    date_label = next((part for part in parts[2:] if re.search(r"(?:ago|小时前|天前|昨天|\d{1,2}/\d{1,2}|[A-Z][a-z]{2}\s+\d+)", part)), None)
    location = "Malaysia" if any("马来西亚" in part or "Malaysia" in part for part in parts[2:]) else None
    return author, text, date_label, location


def _post_id(url: str | None) -> str | None:
    match = re.search(r"/(?:search_result|explore)/([^?/#]+)", str(url or ""))
    return match.group(1) if match else None


def _card_author(card_text: str | None, title: str | None) -> str | None:
    parts = [clean_text(part) for part in str(card_text or "").splitlines() if clean_text(part)]
    return parts[1] if len(parts) > 1 and parts[0] == clean_text(title) else None


def _card_date(card_text: str | None) -> str | None:
    parts = [clean_text(part) for part in str(card_text or "").splitlines() if clean_text(part)]
    return parts[2] if len(parts) > 2 else None


def _clean_date(value: str | None) -> str | None:
    text = clean_text(value)
    return re.sub(r"\s*(?:马来西亚|Malaysia)\s*$", "", text, flags=re.I) or None


def _parsed_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value).replace(tzinfo=MALAYSIA_TZ)


def _has_malaysia(*values: str | None) -> bool:
    text = " ".join(str(value or "") for value in values).lower()
    return any(term in text for term in ("malaysia", "马来西亚", "大马", "rm", "myr"))


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
