from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

from src.config import load_insurance_config
from src.crawl_safety import revisit_allowed
from src.insurance_classifier import (
    InsuranceClassifier,
    detect_insurer,
    extract_premium,
    extract_premium_increase,
    insurance_relevance,
    preliminary_value_score,
    redact_phone_numbers,
)
from src.insurance_pipeline import InsuranceCrawler
from src.insurance_queries import insurance_queries
from src.insurance_report import generate_insurance_reports
from src.storage import SQLiteStorage
from src.xhs_client import XHSRiskControlError


CLASSIFIER = InsuranceClassifier()


def classify(text: str):
    return CLASSIFIER.classify("post", "p1", "https://www.rednote.com/explore/p1", text)


def test_insurance_query_matrix_has_at_least_120_queries() -> None:
    assert len(insurance_queries()) >= 120


def test_malaysia_insurance_relevance() -> None:
    assert insurance_relevance("Malaysia medical card premium RM400 monthly") >= 0.5
    assert insurance_relevance("Shanghai apartment renovation") < 0.18


def test_insurer_name_variations() -> None:
    assert detect_insurer("大东方 medical card 涨价") == "Great Eastern"
    assert detect_insurer("HLA medical insurance Malaysia") == "Hong Leong Assurance"
    assert detect_insurer("PruBSN takaful Malaysia") == "PruBSN"


def test_premium_monthly_and_annual_extraction() -> None:
    assert extract_premium("budget RM400 monthly") == (400.0, "RM", "monthly")
    assert extract_premium("premium MYR 4,800 per year") == (4800.0, "MYR", "annual")


def test_percentage_increase_extraction() -> None:
    assert extract_premium_increase("from RM200 to RM260 monthly") == (200.0, 260.0, 30.0)
    assert extract_premium_increase("premium increased 18%") == (None, None, 18.0)


def test_purchase_request_classification() -> None:
    finding = classify("Malaysia looking for medical insurance for my mother, budget RM400 monthly")
    assert finding and finding.purchase_request
    assert finding.sales_opportunity_level in {"high", "very_high"}


def test_recommendation_request_classification() -> None:
    finding = classify("马来西亚 医疗卡 求推荐，哪一家保险好？")
    assert finding and finding.recommendation_request


def test_complaint_only_is_not_high_value_lead() -> None:
    finding = classify("Great Eastern medical card premium increase Malaysia, 越来越贵")
    assert finding and finding.classification == "complaint_only"
    assert finding.sales_opportunity_level == "low"


def test_considering_switch_vs_explicit_switch() -> None:
    considering = classify("Great Eastern premium increase Malaysia, 想换保险")
    explicit = classify("Malaysia medical card already switched to AIA")
    assert considering and considering.considering_switch and not considering.explicit_switch
    assert explicit and explicit.explicit_switch and not explicit.considering_switch


def test_claim_rejection_and_help_classification() -> None:
    finding = classify("Malaysia insurance claim rejected what to do, need claim appeal help")
    assert finding and finding.claim_status == "rejected"
    assert finding.claim_assistance_request


def test_observed_malaysia_language_variants() -> None:
    premium = classify("Great Eastern医药卡大起价，谁负担得起？Malaysia")
    parent = classify("马来西亚 父母67岁 有适合的意外险或疾病险吗？")
    switch = classify("Allianz 每月调高到RM800，最近想放弃换医药卡 Malaysia")
    delayed = classify("Malaysia 保险公司一直叫我补资料，claim拖延几个月")
    assert premium and premium.complaint_category == "premium_increase"
    assert parent and parent.purchase_request
    assert switch and switch.considering_switch
    assert delayed and delayed.claim_status == "delayed"


def test_agent_promotion_and_recruitment_exclusion() -> None:
    promotion = classify("Malaysia medical card, 我是保险代理，欢迎咨询，私信我")
    recruitment = classify("Malaysia insurance agent recruitment 加入团队 高佣金")
    assert promotion and promotion.classification == "insurance_agent_promotion"
    assert promotion.promotional_probability >= 0.8
    assert recruitment and recruitment.classification == "recruitment_content"


def test_phone_numbers_are_redacted() -> None:
    assert "012-345 6789" not in redact_phone_numbers("call 012-345 6789 for insurance")
    finding = classify("Malaysia need medical card, call 012-345 6789")
    assert finding and "012-345 6789" not in finding.evidence_text


def test_preliminary_scoring_penalises_promotion() -> None:
    organic = preliminary_value_score("Malaysia looking for medical card recommendation RM400")
    promotion = preliminary_value_score("Malaysia medical card agent 私信我 欢迎咨询")
    assert organic > promotion


def test_comment_deduplication_does_not_use_shared_post_url() -> None:
    from src.deduplicator import Deduplicator
    dedupe = Deduplicator()
    assert dedupe.is_duplicate("c1", None, "first useful insurance comment") is False
    assert dedupe.is_duplicate("c2", None, "second different insurance comment") is False
    assert dedupe.is_duplicate("c3", None, "first useful insurance comment") is True


def test_conservative_crawler_limits_selection_to_30_percent(tmp_path) -> None:
    config = load_insurance_config()
    crawler = InsuranceCrawler(SQLiteStorage(tmp_path / "db.sqlite3"), object(), config, sleep_enabled=False)
    from src.insurance_models import DiscoveryCandidate
    candidates = [
        DiscoveryCandidate(
            post_id=str(index), canonical_url=f"https://example.com/{index}", search_query="q",
            search_rank=index, priority_score=80,
        ) for index in range(1, 11)
    ]
    assert len(crawler._select_candidates(candidates, 100)) == 3


def test_resume_and_ttl_revisit_logic() -> None:
    allowed, reason = revisit_allowed({"detail_status": "pending"}, priority_score=50)
    assert allowed and reason == "detail_incomplete"
    future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    allowed, reason = revisit_allowed(
        {"detail_status": "fetched", "revisit_after": future}, priority_score=50,
    )
    assert not allowed and reason == "ttl_active"


class RiskClient:
    def search(self, query, sort="latest"):
        raise XHSRiskControlError("risk control")


def test_risk_control_saves_progress_and_stops_cleanly(tmp_path) -> None:
    storage = SQLiteStorage(tmp_path / "risk.sqlite3")
    crawler = InsuranceCrawler(storage, RiskClient(), load_insurance_config(), sleep_enabled=False)
    metrics = crawler.run(
        ["Malaysia medical card"], recent_days=180, posts_per_query=10,
        resume_command="python main.py research --resume",
    )
    assert metrics.stopped_reason == "XHSRiskControlError"
    risks = storage.read_frame("risk_events")
    assert len(risks) == 1
    assert "--resume" in risks.iloc[0]["resume_command"]


def test_free_summary_anonymises_and_paid_detail_retains_source(tmp_path) -> None:
    storage = SQLiteStorage(tmp_path / "report.sqlite3")
    finding = classify("Malaysia looking for medical insurance recommendation, call 012-345 6789")
    assert finding
    storage.upsert_state("insurance_findings", finding.finding_id, finding.model_dump(mode="python"))
    paths = generate_insurance_reports(storage, tmp_path / "reports")
    free = json.loads(paths["free_summary"].read_text())
    paid = json.loads(paths["paid_detail"].read_text())
    assert "source_url" not in json.dumps(free)
    assert "author_name" not in json.dumps(free)
    assert paid["records"][0]["public_source_url"] == "https://www.rednote.com/explore/p1"
    all_exports = "\n".join(path.read_text() for path in paths.values())
    assert "012-345 6789" not in all_exports
