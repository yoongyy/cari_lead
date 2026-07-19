from __future__ import annotations

import json
import math
import time
from datetime import datetime, timezone
from hashlib import sha1
from pathlib import Path
from typing import Iterable

from .config import InsuranceConfig
from .crawl_safety import CrawlLimitReached, RequestBudget, revisit_after, revisit_allowed
from .deduplicator import Deduplicator
from .extraction_quality import canonicalize_rednote_url, classify_content_origin
from .insurance_classifier import (
    InsuranceClassifier,
    insurance_relevance,
    preliminary_value_score,
    redact_phone_numbers,
    should_fetch_comments,
)
from .insurance_models import CrawlMetrics, DiscoveryCandidate, InsuranceFinding
from .malaysia_classifier import MalaysiaClassifier
from .storage import Storage
from .utils import dump_json, is_recent
from .xhs_client import (
    XHSAuthError,
    XHSClient,
    XHSError,
    XHSRateLimitError,
    XHSRiskControlError,
    normalize_comment,
    normalize_post,
)


class InsuranceCrawler:
    def __init__(
        self,
        storage: Storage,
        client: XHSClient,
        config: InsuranceConfig,
        *,
        sleep_enabled: bool = True,
    ) -> None:
        self.storage = storage
        self.client = client
        self.config = config
        self.classifier = InsuranceClassifier()
        self.malaysia = MalaysiaClassifier(threshold=config.malaysia_threshold, weights=config.weights)
        self.sleep_enabled = sleep_enabled

    def run(
        self,
        queries: Iterable[str],
        *,
        recent_days: int = 180,
        posts_per_query: int = 10,
        fetch_comments: bool = True,
        max_comments_per_post: int = 50,
        max_runtime_minutes: int = 90,
        max_total_requests: int = 250,
        max_detail_posts: int = 100,
        max_comment_requests: int = 150,
        incremental: bool = True,
        force_refresh: bool = False,
        resume_command: str,
    ) -> CrawlMetrics:
        selected_queries = list(queries)
        run_id = self.storage.create_run("insurance", json.dumps({
            "queries": selected_queries, "recent_days": recent_days, "incremental": incremental,
        }, ensure_ascii=False))
        metrics = CrawlMetrics(run_id=str(run_id), queries_planned=len(selected_queries))
        budget = RequestBudget(
            self.config, max_runtime_minutes=max_runtime_minutes,
            max_total_requests=max_total_requests, sleep_enabled=self.sleep_enabled,
        )
        post_dedupe = Deduplicator()
        comment_dedupe = Deduplicator()
        raw_dir = Path("data/raw") / datetime.now().date().isoformat() / "insurance"
        comment_requests = 0
        try:
            for query_index, query in enumerate(selected_queries):
                query_key = sha1(query.encode()).hexdigest()[:16]
                self.storage.upsert_state("queries", query_key, {"query": query, "industry": "insurance"})
                if self._query_completed(query_key) and incremental and not force_refresh:
                    continue
                candidates = self._discover(
                    query, query_key, run_id, posts_per_query, recent_days, budget, raw_dir, metrics,
                )
                qualified = self._select_candidates(candidates, max_detail_posts - metrics.detail_posts_opened)
                metrics.requests_avoided += max(0, len(candidates) - len(qualified))
                for candidate in qualified:
                    if metrics.detail_posts_opened >= max_detail_posts:
                        raise CrawlLimitReached("maximum detail posts reached")
                    state = self.storage.get_state("post_fetch_state", candidate.post_id)
                    allowed, reason = revisit_allowed(
                        state, priority_score=candidate.priority_score,
                        force_refresh=force_refresh, incremental=incremental,
                    )
                    if not allowed:
                        metrics.requests_avoided += 1
                        continue
                    finding = self._fetch_detail(candidate, recent_days, budget, raw_dir, metrics)
                    if not finding:
                        continue
                    if fetch_comments and comment_requests < max_comment_requests and should_fetch_comments(finding):
                        self._fetch_comments(
                            candidate, finding, max_comments_per_post, budget, raw_dir,
                            comment_dedupe, metrics,
                        )
                        comment_requests += 1
                metrics.queries_completed += 1
                self.storage.upsert_state("query_runs", f"{run_id}:{query_key}", {
                    "run_id": run_id, "query": query, "query_key": query_key,
                    "status": "completed", "completed_at": _now(),
                })
                if self.sleep_enabled and query_index < len(selected_queries) - 1:
                    time.sleep(self.config.crawl_limits.cooldown_between_query_groups_seconds)
            self.storage.finish_run(run_id, "completed")
        except (XHSRiskControlError, XHSRateLimitError, XHSAuthError) as exc:
            metrics.stopped_reason = type(exc).__name__
            self._save_risk(run_id, exc, resume_command)
            self.storage.finish_run(run_id, "risk_stopped")
        except (CrawlLimitReached, XHSError) as exc:
            metrics.stopped_reason = str(exc)
            self.storage.save_error(run_id, "insurance_crawl", str(exc), error_type=type(exc).__name__)
            self.storage.finish_run(run_id, "stopped")
        except KeyboardInterrupt:
            metrics.stopped_reason = "interrupted"
            self.storage.finish_run(run_id, "interrupted")
        finally:
            metrics.requests_total = budget.total_requests
            self.storage.upsert_state("insurance_crawl_metrics", str(run_id), metrics.model_dump(mode="python"))
        return metrics

    def _discover(self, query, query_key, run_id, limit, recent_days, budget, raw_dir, metrics):
        budget.before_request("search")
        raw_posts, envelope = self.client.search(query, sort="latest")
        dump_json(raw_dir / f"search_{run_id}_{query_key}.json", envelope)
        self.storage.save_search_query(run_id, query, "latest", len(raw_posts))
        results: list[DiscoveryCandidate] = []
        for rank, raw in enumerate(raw_posts[:limit], start=1):
            post = normalize_post(raw, search_keyword=query)
            text = f"{post.title or ''} {post.body or ''}"
            canonical = canonicalize_rednote_url(post.url, post.post_id)
            candidate = DiscoveryCandidate(
                post_id=post.post_id, canonical_url=canonical, title=post.title,
                snippet=redact_phone_numbers(post.body), author_name=post.author_name,
                date_label=str(post.published_at or "") or None, search_query=query,
                search_rank=rank, priority_score=preliminary_value_score(text, is_recent(post.published_at, recent_days)),
            )
            previous = self.storage.get_state("discovered_posts", candidate.post_id) or {}
            if previous:
                metrics.duplicate_posts += 1
            matched = list(dict.fromkeys([*(previous.get("discovered_by_queries") or []), query]))
            document = {
                **candidate.model_dump(mode="python"), "discovered_by_queries": matched,
                "best_search_rank": min(rank, int(previous.get("best_search_rank") or rank)),
                "first_seen_at": previous.get("first_seen_at") or candidate.first_seen_at,
                "last_seen_at": candidate.last_seen_at,
            }
            self.storage.upsert_state("discovered_posts", candidate.post_id, document)
            results.append(candidate)
        metrics.discovered_posts += len(results)
        return results

    def _select_candidates(self, candidates: list[DiscoveryCandidate], remaining: int) -> list[DiscoveryCandidate]:
        eligible = [item for item in candidates if item.priority_score >= self.config.discovery_open_threshold]
        count = min(
            len(eligible), remaining, self.config.crawl_limits.max_detail_posts_per_query,
            math.ceil(len(candidates) * self.config.open_fraction),
        )
        return sorted(eligible, key=lambda item: (-item.priority_score, item.search_rank))[:count]

    def _fetch_detail(self, candidate, recent_days, budget, raw_dir, metrics) -> InsuranceFinding | None:
        budget.before_request("detail")
        raw, envelope = self.client.read(candidate.canonical_url or candidate.post_id)
        metrics.detail_posts_opened += 1
        dump_json(raw_dir / f"detail_{candidate.post_id}.json", envelope)
        post = normalize_post(raw, search_keyword=candidate.search_query)
        post.post_id = post.post_id or candidate.post_id
        post.url = post.url or candidate.canonical_url
        post.canonical_url = candidate.canonical_url
        post.author_name = post.author_name or candidate.author_name
        post.author_id = None
        post.author_bio = None
        post.author_profile_url = None
        post.raw_json = {}
        post.body = redact_phone_numbers(post.body)
        post.post_body = post.body
        post.discovered_by_queries = [candidate.search_query]
        post.best_search_rank = candidate.search_rank
        post.first_discovered_at = candidate.first_seen_at
        post.last_seen_at = candidate.last_seen_at
        origin, leading, promotional, organic = classify_content_origin(post.title, post.body, post.author_name)
        post.content_origin, post.leading_question_score = origin, leading
        post.promotional_score, post.organic_evidence_weight = promotional, organic
        malaysia = self.malaysia.classify(f"{post.title or ''} {post.body or ''} {candidate.search_query}")
        post.malaysia_score, post.malaysia_signals = malaysia.score, malaysia.signals
        post.language, post.is_malaysia_relevant = malaysia.language, malaysia.is_relevant
        text = f"{post.title or ''} {post.body or ''}"
        finding = self.classifier.classify(
            "post", post.post_id, post.url, text, author_name=post.author_name,
            published_at=post.published_at, location_signal=post.location_label,
        )
        rejection = None
        if not is_recent(post.published_at, recent_days): rejection = "old"
        elif insurance_relevance(text) < 0.30: rejection = "unrelated"
        elif finding and finding.classification in {"insurance_agent_promotion", "vendor_advertisement"}: rejection = "promotion"
        elif finding and finding.classification == "recruitment_content": rejection = "recruitment"
        if rejection:
            if rejection in {"promotion", "recruitment"}:
                metrics.rejected_promotional_posts += 1
            self.storage.upsert_state("post_fetch_state", post.post_id, {
                "post_id": post.post_id, "detail_status": "rejected", "comments_status": "not_fetched",
                "last_detail_fetch_at": _now(), "priority_score": candidate.priority_score,
                "rejection_reason": rejection, "revisit_after": revisit_after(candidate.priority_score, rejected=True),
            })
            return None
        self.storage.save_post(post)
        if finding:
            self._save_finding(finding, metrics)
        self.storage.upsert_state("post_fetch_state", post.post_id, {
            "post_id": post.post_id, "canonical_url": post.canonical_url,
            "detail_status": "fetched", "comments_status": "not_fetched",
            "last_detail_fetch_at": _now(), "content_hash": sha1(text.encode()).hexdigest(),
            "latest_known_comment_count": post.comment_count, "priority_score": candidate.priority_score,
            "revisit_after": revisit_after(candidate.priority_score), "rejection_reason": None,
        })
        return finding

    def _fetch_comments(self, candidate, post_finding, max_comments, budget, raw_dir, dedupe, metrics):
        budget.before_request("comments")
        raw_comments, envelope = self.client.comments(candidate.canonical_url, all_comments=False)
        metrics.comment_threads_fetched += 1
        dump_json(raw_dir / f"comments_{candidate.post_id}.json", envelope)
        useful = 0
        for raw in raw_comments:
            for comment in normalize_comment(raw, candidate.post_id, candidate.canonical_url):
                if metrics.comments_seen >= max_comments * metrics.comment_threads_fetched:
                    break
                metrics.comments_seen += 1
                comment.text = redact_phone_numbers(comment.text)
                comment.author_id = None
                comment.raw_json = {}
                if dedupe.is_duplicate(comment.comment_id, comment.url, comment.text):
                    metrics.duplicate_comments += 1
                    continue
                finding = self.classifier.classify(
                    "comment", comment.comment_id, candidate.canonical_url, comment.text,
                    author_name=comment.author_name, published_at=comment.created_at,
                    location_signal=comment.location_label, post_id=candidate.post_id,
                )
                if not finding:
                    continue
                comment.is_malaysia_relevant = True
                self.storage.save_comment(comment)
                self._save_finding(finding, metrics)
                useful += 1
                if useful >= max_comments:
                    break
        self.storage.upsert_state("comment_fetch_state", candidate.post_id, {
            "post_id": candidate.post_id, "comments_status": "fetched",
            "last_comment_fetch_at": _now(), "useful_comments": useful,
        })

    def _save_finding(self, finding: InsuranceFinding, metrics: CrawlMetrics) -> None:
        self.storage.upsert_state("insurance_findings", finding.finding_id, finding.model_dump(mode="python"))
        metrics.active_purchase_requests += int(finding.purchase_request)
        metrics.recommendation_requests += int(finding.recommendation_request)
        metrics.switching_signals += int(finding.considering_switch or finding.explicit_switch or finding.cancellation_intent)
        metrics.claim_help_signals += int(finding.claim_assistance_request)

    def _query_completed(self, query_key: str) -> bool:
        frame = self.storage.read_frame("query_runs")
        return bool(not frame.empty and "query_key" in frame and (frame["query_key"] == query_key).any())

    def _save_risk(self, run_id: int, exc: Exception, resume_command: str) -> None:
        key = f"{run_id}:{int(time.time())}"
        self.storage.upsert_state("risk_events", key, {
            "run_id": run_id, "event_type": type(exc).__name__, "reason": str(exc)[:500],
            "created_at": _now(), "resume_command": resume_command,
        })
        self.storage.save_error(run_id, "risk_control", str(exc), error_type=type(exc).__name__)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
