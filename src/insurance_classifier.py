from __future__ import annotations

import re
from hashlib import sha1

from .insurance_models import InsuranceFinding
from .utils import clean_text


INSURER_ALIASES: dict[str, tuple[str, ...]] = {
    "Great Eastern": ("great eastern", "ge insurance", "ge medical card", "大东方"),
    "AIA": ("aia",),
    "Prudential": ("prudential",),
    "PruBSN": ("prubsn", "pru bsn"),
    "Allianz": ("allianz",),
    "Etiqa": ("etiqa",),
    "Takaful Malaysia": ("takaful malaysia",),
    "Zurich": ("zurich",),
    "Tokio Marine": ("tokio marine",),
    "Hong Leong Assurance": ("hong leong assurance", "hla"),
    "Manulife": ("manulife",),
    "Generali": ("generali", "axa"),
    "Sun Life Malaysia": ("sun life malaysia", "sun life"),
    "FWD": ("fwd",),
    "Tune Protect": ("tune protect",),
    "MSIG": ("msig",),
    "Chubb": ("chubb",),
    "RHB Insurance": ("rhb insurance",),
    "AmMetLife": ("ammetlife",),
    "Gibraltar BSN": ("gibraltar bsn",),
    "MCIS Life": ("mcis life",),
    "Liberty Insurance": ("liberty insurance",),
    "Berjaya Sompo": ("berjaya sompo",),
}

PRODUCT_TERMS: dict[str, tuple[str, ...]] = {
    "medical_card": ("medical card", "医疗卡", "medical insurance", "health insurance", "医疗保险"),
    "life_insurance": ("life insurance", "人寿保险"),
    "critical_illness": ("critical illness", "严重疾病保险"),
    "personal_accident": ("personal accident", "意外保险"),
    "investment_linked_policy": ("investment-linked", "investment linked", "ilp"),
    "takaful": ("takaful",),
    "motor_insurance": ("motor insurance", "car insurance", "车险"),
    "travel_insurance": ("travel insurance", "旅游保险"),
    "child_insurance": ("child insurance", "children insurance", "小孩保险", "newborn insurance"),
    "maternity_insurance": ("maternity insurance", "pregnancy insurance"),
    "senior_medical": ("senior medical", "老人医疗卡", "parents medical card"),
    "group_medical": ("group medical", "company insurance", "sme insurance"),
}

MALAYSIA_TERMS = (
    "malaysia", "malaysian", "马来西亚", "大马", "kuala lumpur", " kl ", "selangor", "雪兰莪",
    "petaling jaya", " pj ", "cheras", "puchong", "kepong", "johor", "johor bahru", " jb ",
    "penang", "槟城", "ipoh", "怡保", "melaka", "马六甲", "sabah", "沙巴", "sarawak", "砂拉越",
    "kuching", "kota kinabalu", " rm", "myr", "bank negara", "ofs",
)
INSURANCE_TERMS = tuple({alias for values in INSURER_ALIASES.values() for alias in values}) + tuple(
    term for values in PRODUCT_TERMS.values() for term in values
) + ("insurance", "保险", "保单", "policyholder", "premium", "claim", "insurer", "保障")
PURCHASE_TERMS = (
    "looking for insurance", "need insurance", "想买保险", "要买医疗卡", "looking for medical",
    "need medical card", "newborn insurance", "family insurance", "company medical insurance",
    "有适合的", "发我完整的quotation",
)
RECOMMENDATION_TERMS = (
    "求推荐保险", "求推荐", "recommend medical card", "insurance recommendation", "哪一家保险好",
    "哪个好", "can recommend agent", "reliable insurance agent", "honest insurance agent", "找保险代理",
)
COMPARISON_TERMS = ("compare insurance", "compare medical card", "比较保险", "哪个比较值得", "versus", " vs ")
CONSIDERING_SWITCH_TERMS = (
    "想换保险", "considering switching", "want to switch", "换 medical card", "alternative to",
    "move to another insurer", "想换 agent", "换 agent", "换agent", "change agent", "想放弃",
)
EXPLICIT_SWITCH_TERMS = ("already switched", "switched to", "已经换", "换了保险", "moved to")
CANCELLATION_TERMS = ("cancel policy", "terminate policy", "surrender policy", "不续保", "不想续了", "取消保单")
CLAIM_REJECTED_TERMS = ("claim rejected", "claim 被拒", "不赔", "insurer refuses claim", "medical bill not covered", "不能claim", "decline")
CLAIM_DELAY_TERMS = ("claim delayed", "claim 很慢", "理赔慢", "补资料", "拖延", "claim pending", "等了好几个月")
CLAIM_HELP_TERMS = (
    "claim rejected what to do", "insurance claim help", "claim appeal", "claim dispute", "no gl",
    "claim documents", "claim pending", "claim delayed", "what to do", "怎么办",
)
PREMIUM_COMPLAINT_TERMS = (
    "保费涨价", "premium increase", "premium naik", "越来越贵", "renew 太贵", "medical card 涨价",
    "cannot afford", "unaffordable renewal", "保费增加", "保费上涨", "大起价", "起价", "price revised",
)
AGENT_SERVICE_TERMS = (
    "agent 不回复", "agent disappeared", "代理不见了", "service 很差", "agent pushy", "hard sell",
    "mis-selling", "misleading", "poor explanation", "failed follow-up",
)
CONFUSION_TERMS = (
    "policy 不明白", "waiting period", "co-insurance", "deductible", "annual limit", "lifetime limit",
    "cash value", "surrender value", "nomination", "exclusion", "loading",
)
ADVICE_TERMS = ("need advice", "anyone can help", "what should i buy", "怎么办", "请教", "想了解")
POSITIVE_TERMS = ("claim approved", "理赔成功", "agent 很好", "service 很好", "helpful agent", "值得", "满意")
VENDOR_TERMS = ("insurance software", "agent crm", "lead package", "marketing service", "代运营")
PROMOTION_TERMS = (
    "pm me", "dm me", "contact me", "whatsapp me", "欢迎咨询", "私信我", "找我", "免费咨询",
    "我是保险代理", "i am an insurance agent", "limited offer", "promotion", "招募", "加入团队",
)
RECRUITMENT_TERMS = ("recruit", "recruitment", "招募", "招聘", "加入团队", "高佣金", "career opportunity")
EDUCATIONAL_TERMS = ("科普", "知识分享", "educational", "what is insurance", "保险知识", "懒人包", "资讯分享", "告诉你")
RESEARCHER_QUESTION_TERMS = ("大家有什么想问的吗", "ask me anything", "欢迎提问", "你们有什么问题")
PHONE_PATTERN = re.compile(r"(?<!\w)(?:\+?60|0)1[0-9](?:[\s-]*\d){7,8}(?!\w)")
CONTACT_INVITE_PATTERN = re.compile(
    r"(?:whats?app|wasap|w\.a\.|微信|wechat|加我|联系我|私信我)\s*(?:[:：👉🏻➡️-]?\s*[^，。.!?\n]{3,80})?",
    re.IGNORECASE,
)


def redact_phone_numbers(text: str | None) -> str:
    redacted = PHONE_PATTERN.sub("[phone redacted]", clean_text(text))
    return CONTACT_INVITE_PATTERN.sub("[contact details redacted]", redacted)


def insurance_relevance(text: str) -> float:
    lower = f" {clean_text(text).lower()} "
    insurance_hits = sum(1 for term in INSURANCE_TERMS if term in lower)
    malaysia_hits = sum(1 for term in MALAYSIA_TERMS if term in lower)
    score = min(0.65, insurance_hits * 0.18) + min(0.45, malaysia_hits * 0.18)
    return round(min(1.0, score), 3)


def detect_insurer(text: str) -> str | None:
    lower = clean_text(text).lower()
    for insurer, aliases in INSURER_ALIASES.items():
        if any(_term_present(lower, alias) for alias in aliases):
            return insurer
    return None


def detect_product(text: str) -> str | None:
    lower = clean_text(text).lower()
    for product, terms in PRODUCT_TERMS.items():
        if any(term in lower for term in terms):
            return product
    return None


def extract_premium(text: str) -> tuple[float, str, str | None] | None:
    normalized = clean_text(text)
    match = re.search(r"\b(RM|MYR)\s*([0-9][0-9,]*(?:\.\d+)?)\s*([kK])?", normalized, re.I)
    if not match:
        return None
    amount = float(match.group(2).replace(",", "")) * (1000 if match.group(3) else 1)
    lower = normalized.lower()
    period = None
    if any(term in lower for term in ("monthly", "per month", "/month", "/mo", "一个月", "每月")):
        period = "monthly"
    elif any(term in lower for term in ("annual", "annually", "per year", "/year", "/yr", "一年", "每年")):
        period = "annual"
    return amount, match.group(1).upper(), period


def extract_premium_increase(text: str) -> tuple[float | None, float | None, float | None]:
    normalized = clean_text(text)
    amounts = [float(value.replace(",", "")) for value in re.findall(r"(?:RM|MYR)\s*([0-9][0-9,]*(?:\.\d+)?)", normalized, re.I)]
    old, new = (amounts[0], amounts[1]) if len(amounts) >= 2 else (None, None)
    percent_match = re.search(r"([0-9]+(?:\.\d+)?)\s*%", normalized)
    percentage = float(percent_match.group(1)) if percent_match else None
    if percentage is None and old and new and new > old:
        percentage = round(((new - old) / old) * 100, 2)
    return old, new, percentage


def preliminary_value_score(text: str, published_recent: bool = True) -> float:
    lower = f" {clean_text(text).lower()} "
    score = insurance_relevance(text) * 35
    score += 8 if published_recent else -8
    score += 12 if _contains(lower, PURCHASE_TERMS) else 0
    score += 10 if _contains(lower, RECOMMENDATION_TERMS) else 0
    score += 9 if _contains(lower, CONSIDERING_SWITCH_TERMS + EXPLICIT_SWITCH_TERMS) else 0
    score += 8 if _contains(lower, CLAIM_REJECTED_TERMS + CLAIM_HELP_TERMS) else 0
    score += 7 if _contains(lower, PREMIUM_COMPLAINT_TERMS) else 0
    score += 5 if detect_insurer(text) else 0
    score += 5 if extract_premium(text) else 0
    score -= 35 if _contains(lower, PROMOTION_TERMS) else 0
    score -= 45 if _contains(lower, RECRUITMENT_TERMS) else 0
    return round(max(0.0, min(100.0, score)), 2)


class InsuranceClassifier:
    def classify(
        self,
        source_type: str,
        source_id: str,
        source_url: str | None,
        text: str,
        *,
        author_name: str | None = None,
        published_at=None,
        location_signal: str | None = None,
        post_id: str | None = None,
    ) -> InsuranceFinding | None:
        evidence = redact_phone_numbers(text)
        lower = f" {evidence.lower()} "
        if insurance_relevance(evidence) < 0.18:
            return None
        promotion = _contains(lower, PROMOTION_TERMS)
        recruitment = _contains(lower, RECRUITMENT_TERMS)
        educational = _contains(lower, EDUCATIONAL_TERMS)
        researcher_question = _contains(lower, RESEARCHER_QUESTION_TERMS)
        purchase = _contains(lower, PURCHASE_TERMS)
        recommendation = _contains(lower, RECOMMENDATION_TERMS)
        comparison = _contains(lower, COMPARISON_TERMS)
        explicit_switch = _contains(lower, EXPLICIT_SWITCH_TERMS)
        considering_switch = _contains(lower, CONSIDERING_SWITCH_TERMS) and not explicit_switch
        cancellation = _contains(lower, CANCELLATION_TERMS)
        claim_rejected = _contains(lower, CLAIM_REJECTED_TERMS)
        claim_delayed = _contains(lower, CLAIM_DELAY_TERMS)
        claim_help = _contains(lower, CLAIM_HELP_TERMS)
        premium_complaint = _contains(lower, PREMIUM_COMPLAINT_TERMS)
        agent_issue = _contains(lower, AGENT_SERVICE_TERMS)
        confusion = _contains(lower, CONFUSION_TERMS)
        advice = _contains(lower, ADVICE_TERMS)
        positive = _contains(lower, POSITIVE_TERMS)
        vendor = promotion and _contains(lower, VENDOR_TERMS)
        insurer = detect_insurer(evidence)
        product = detect_product(evidence)
        premium = extract_premium(evidence)
        old_premium, new_premium, percentage = extract_premium_increase(evidence)
        classification = _classification(
            recruitment, promotion, purchase, recommendation, comparison, explicit_switch,
            considering_switch, cancellation, claim_help, premium_complaint, claim_rejected,
            claim_delayed, agent_issue, confusion, advice, positive, educational, vendor,
            researcher_question,
        )
        complaint_category = _complaint_category(
            premium_complaint, claim_rejected, claim_delayed, agent_issue, confusion, cancellation,
        )
        research_score = _research_score(
            evidence, insurer, product, premium, premium_complaint, claim_rejected or claim_delayed,
            comparison, explicit_switch, considering_switch, purchase, recommendation,
            promotion, recruitment, educational, location_signal,
        )
        sales_score = _sales_score(
            purchase, recommendation, comparison, considering_switch, explicit_switch,
            cancellation, claim_help, product, premium, location_signal, promotion, recruitment,
        )
        level = _sales_level(sales_score, complaint_category, purchase, recommendation, comparison, considering_switch, cancellation, claim_help)
        age_match = re.search(r"(?<!\d)([1-9][0-9])(?:\s*(?:years? old|岁|yo))", lower)
        target = _target_person(lower)
        finding_id = sha1(f"{source_type}|{source_id}|{classification}|{evidence[:200]}".encode()).hexdigest()[:20]
        return InsuranceFinding(
            finding_id=f"insurance:{finding_id}", source_type=source_type, source_id=source_id,
            post_id=post_id or (source_id if source_type == "post" else None), source_url=source_url,
            author_name=author_name, published_at=published_at, location_signal=location_signal,
            stakeholder_role=_stakeholder(lower), insurer=insurer, insurance_product=product,
            current_policy=insurer if insurer else None, classification=classification,
            complaint_category=complaint_category,
            complaint_description=complaint_category.replace("_", " ") if complaint_category else None,
            premium_amount=premium[0] if premium else None,
            premium_currency=premium[1] if premium else None,
            premium_period=premium[2] if premium else None,
            old_premium=old_premium, new_premium=new_premium, percentage_increase=percentage,
            claim_status="rejected" if claim_rejected else ("delayed" if claim_delayed else ("help_requested" if claim_help else None)),
            agent_service_issue="service_problem" if agent_issue else None,
            cancellation_intent=cancellation, considering_switch=considering_switch,
            explicit_switch=explicit_switch, switching_from=insurer if considering_switch or explicit_switch else None,
            switching_to=_switching_to(lower), recommendation_request=recommendation,
            comparison_request=comparison, purchase_request=purchase, claim_assistance_request=claim_help,
            desired_coverage=product, target_person=target,
            age_if_publicly_stated=int(age_match.group(1)) if age_match else None,
            stated_budget=premium[0] if premium and (purchase or recommendation or comparison) else None,
            urgency="high" if any(term in lower for term in ("urgent", "asap", "马上", "紧急")) else None,
            sales_opportunity_level=level, research_value_score=research_score,
            sales_opportunity_score=sales_score, evidence_text=evidence[:1000],
            confidence=0.85 if classification not in {"general_discussion", "educational_content"} else 0.65,
            organic_evidence_weight=0.0 if promotion or recruitment else (0.2 if researcher_question else (0.35 if educational else 0.8)),
            promotional_probability=0.95 if recruitment else (0.85 if promotion else 0.05),
            suggested_public_response=_suggested_response(level, classification, product),
        )


def should_fetch_comments(finding: InsuranceFinding, comment_count: int | None = None) -> bool:
    if finding.classification in {"vendor_advertisement", "insurance_agent_promotion", "recruitment_content", "educational_content"}:
        return False
    return any((
        finding.purchase_request, finding.recommendation_request, finding.comparison_request,
        finding.considering_switch, finding.explicit_switch, finding.cancellation_intent,
        finding.claim_assistance_request, finding.complaint_category == "premium_increase",
        finding.claim_status is not None,
        (comment_count or 0) >= 20,
    ))


def _contains(lower: str, terms: tuple[str, ...]) -> bool:
    return any(term in lower for term in terms)


def _term_present(lower: str, term: str) -> bool:
    if len(term) <= 3 and term.isascii():
        return re.search(rf"(?<![a-z0-9]){re.escape(term)}(?![a-z0-9])", lower) is not None
    return term in lower


def _classification(recruitment, promotion, purchase, recommendation, comparison, explicit_switch,
                    considering_switch, cancellation, claim_help, premium, claim_rejected,
                    claim_delayed, agent_issue, confusion, advice, positive, educational, vendor,
                    researcher_question) -> str:
    if recruitment: return "recruitment_content"
    if vendor: return "vendor_advertisement"
    if promotion: return "insurance_agent_promotion"
    if researcher_question: return "researcher_led_question"
    if purchase: return "active_purchase_request"
    if recommendation: return "recommendation_request"
    if comparison: return "comparison_request"
    if explicit_switch: return "explicit_switching"
    if considering_switch: return "considering_switching"
    if cancellation: return "explicit_cancellation"
    if claim_help: return "claim_assistance_request"
    if premium or claim_rejected or claim_delayed or agent_issue: return "complaint_only"
    if advice: return "request_for_advice"
    if confusion: return "policy_confusion"
    if educational: return "educational_content"
    if positive: return "positive_feedback"
    return "general_discussion"


def _complaint_category(premium, claim, claim_delayed, agent, confusion, cancellation) -> str | None:
    if premium: return "premium_increase"
    if claim: return "rejected_claim"
    if claim_delayed: return "delayed_claim"
    if agent: return "agent_service"
    if confusion: return "product_confusion"
    if cancellation: return "cancellation"
    return None


def _research_score(text, insurer, product, premium, premium_complaint, claim, comparison, explicit,
                    considering, purchase, recommendation, promotion, recruitment, educational, location) -> float:
    score = insurance_relevance(text) * 25
    score += 8 if insurer else 0
    score += 7 if product else 0
    score += 10 if premium else 0
    score += 10 if premium_complaint or claim else 0
    score += 9 if comparison or explicit or considering else 0
    score += 8 if purchase or recommendation else 0
    score += 7 if location or any(term in text.lower() for term in MALAYSIA_TERMS) else 0
    score -= 45 if recruitment else 0
    score -= 30 if promotion else 0
    score -= 10 if educational else 0
    return round(max(0.0, min(100.0, score)), 2)


def _sales_score(purchase, recommendation, comparison, considering, explicit, cancellation, claim_help,
                 product, premium, location, promotion, recruitment) -> float:
    score = 0
    score += 35 if purchase else 0
    score += 30 if recommendation else 0
    score += 24 if comparison else 0
    score += 24 if considering else 0
    score += 18 if explicit or cancellation else 0
    score += 14 if claim_help else 0
    score += 8 if product else 0
    score += 8 if premium else 0
    score += 6 if location else 0
    score -= 80 if promotion or recruitment else 0
    return round(max(0.0, min(100.0, score)), 2)


def _sales_level(score, complaint_category, purchase, recommendation, comparison, considering, cancellation, claim_help):
    has_action = any((purchase, recommendation, comparison, considering, cancellation, claim_help))
    if not has_action:
        return "low" if complaint_category else "no_sales_signal"
    if score >= 70: return "very_high"
    if score >= 50: return "high"
    if score >= 30: return "medium"
    return "low"


def _stakeholder(lower: str) -> str:
    if any(term in lower for term in ("insurance agent", "保险代理", "takaful agent", "financial consultant")):
        return "insurance_agent"
    if any(term in lower for term in ("sme", "business owner", "company insurance")):
        return "business_owner"
    if any(term in lower for term in ("parents", "父母", "mother", "father", "妈妈", "爸爸")):
        return "family_buyer"
    return "policyholder_or_buyer"


def _target_person(lower: str) -> str | None:
    for target, terms in {
        "parents": ("parents", "父母", "mother", "father", "妈妈", "爸爸"),
        "child": ("child", "children", "newborn", "小孩", "宝宝"),
        "self": ("for myself", "给自己", "我想买"),
        "employees": ("employees", "staff", "company", "sme"),
    }.items():
        if any(term in lower for term in terms): return target
    return None


def _switching_to(lower: str) -> str | None:
    for insurer, aliases in INSURER_ALIASES.items():
        if any(f"to {alias}" in lower or f"换去{alias}" in lower for alias in aliases):
            return insurer
    return None


def _suggested_response(level: str, classification: str, product: str | None) -> str | None:
    if level not in {"medium", "high", "very_high"}:
        return None
    coverage = (product or "coverage").replace("_", " ")
    if classification == "claim_assistance_request":
        return "Sorry this happened. Check the policy wording, rejection letter and appeal channel, and consider contacting the insurer or Ombudsman for Financial Services. No one should promise claim approval."
    return (
        f"It may help to compare the {coverage}, premium, exclusions, waiting periods, limits and continuity risks before changing plans. "
        "I am an insurance agent; I can explain the comparison points if useful, but proper fact-finding is needed before any recommendation."
    )
