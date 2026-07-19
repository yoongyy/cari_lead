from __future__ import annotations

import os
import json
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from hashlib import sha1

from .models import ResearchFinding
from .utils import clean_text


CATEGORY_RULES: dict[str, list[str]] = {
    "lead_generation": ["找不到客户", "没有客户", "客户难找", "找客户", "lead generation", "leads"],
    "platform_fee": ["太贵", "涨价", "收费", "平台费", "不值得", "expensive", "pricey"],
    "fake_listing": ["假盘", "假房源", "fake listing", "fake unit"],
    "poor_lead_quality": ["lead 不好", "lead quality", "垃圾 lead", "low quality lead"],
    "follow_up": ["follow up", "跟进"],
    "personal_branding": ["个人品牌", "personal brand"],
    "content_marketing": ["小红书找客户", "tiktok 找客户", "facebook 找客户", "content marketing", "内容"],
    "loan_rejection": ["loan reject", "loan rejected", "贷款不批", "贷款被拒"],
    "customer_ghosting": ["ghost", "放飞机", "不回复", "已读不回"],
    "viewing_scheduling": ["看房", "viewing", "appointment"],
    "paperwork": ["文件", "paperwork", "spa", "tenancy agreement"],
    "commission": ["佣金", "commission"],
    "platform_dependency": ["依赖平台", "platform dependency"],
    "crm": ["crm", "客户管理"],
    "website": ["landing page", "个人网站", "website"],
    "advertising_cost": ["广告费太贵", "广告费", "ad cost", "ads expensive"],
    "switching_platform": ["换平台", "转去其他平台", "alternative", "其他平台"],
    "feature_request": ["希望有", "需要一个", "hope there is", "need a", "feature"],
    "positive_feedback": ["好用", "有效", "worth it", "有用", "不错"],
}

BRANDS = ["PropertyGuru", "iProperty", "EdgeProp", "Propviss", "TikTok", "XHS", "小红书", "Facebook", "Mudah"]
EXPLICIT_SWITCH = ["取消", "不用", "停用", "switched", "switched to", "moved to", "stopped using", "cancelled", "转去"]
CONSIDERING_SWITCH = ["考虑换", "想换", "trying an alternative", "considering switching", "looking for another platform", "any alternative", "替代"]
PURCHASE_INTENT = ["looking for", "need", "需要", "想找", "interested", "would pay", "愿意付", "求推荐"]


@dataclass
class ComplaintClassifier:
    industry: str = "property"
    mode: str = "rules"

    def classify(self, source_type: str, source_id: str, source_url: str | None, text: str) -> list[ResearchFinding]:
        if self.mode == "llm":
            try:
                llm_findings = self._classify_with_codex(source_type, source_id, source_url, text)
                if llm_findings:
                    return llm_findings
            except Exception:
                return self._classify_rules(source_type, source_id, source_url, text)
        return self._classify_rules(source_type, source_id, source_url, text)

    def _classify_rules(self, source_type: str, source_id: str, source_url: str | None, text: str) -> list[ResearchFinding]:
        normalized = clean_text(text)
        lower = normalized.lower()
        findings: list[ResearchFinding] = []
        brand = next((b for b in BRANDS if b.lower() in lower or b in normalized), None)
        pricing = extract_price(normalized)
        switched = contains_any(lower, EXPLICIT_SWITCH)
        considering = contains_any(lower, CONSIDERING_SWITCH)
        purchase_intent = contains_any(lower, PURCHASE_INTENT)

        for category, terms in CATEGORY_RULES.items():
            matched = [term for term in terms if term.lower() in lower]
            if not matched:
                continue
            is_feature = category == "feature_request"
            evidence_type = infer_evidence_type(normalized, category, pricing, switched, considering, purchase_intent)
            stakeholder_role = infer_stakeholder_role(normalized)
            findings.append(
                ResearchFinding(
                    source_type=source_type, source_id=source_id, source_url=source_url,
                    post_id=source_id if source_type == "post" else None,
                    finding_id=make_finding_id(source_type, source_id, category, normalized),
                    industry=self.industry, category=category, brand=brand,
                    stakeholder_role=stakeholder_role,
                    evidence_type=evidence_type,
                    problem_category=category,
                    problem_description=category.replace("_", " "),
                    product_or_platform=brand,
                    sentiment="positive" if category == "positive_feedback" else "negative",
                    complaint=category not in {"feature_request", "positive_feedback"},
                    pain_point=category if category not in {"feature_request", "positive_feedback"} else None,
                    feature_request=is_feature,
                    pricing_mentioned=pricing is not None,
                    amount=pricing[0] if pricing else None,
                    money_amount=pricing[0] if pricing else None,
                    currency=pricing[1] if pricing else None,
                    billing_period=infer_billing_period(normalized),
                    switched=switched,
                    switching_from=infer_switching_from(normalized, brand) if switched else None,
                    switching_to=infer_switching_to(normalized) if switched or considering else None,
                    considering_switch=considering and not switched,
                    purchase_intent=purchase_intent,
                    explicit_solution_request=purchase_intent or category == "feature_request",
                    willingness_to_pay="愿意付" in normalized or "would pay" in lower or "willing to pay" in lower,
                    urgency="high" if any(word in lower for word in ["urgent", "马上", "立刻", "asap"]) else None,
                    emotion=infer_emotion(normalized),
                    severity=infer_severity(normalized),
                    confidence=0.75 if matched else 0.5,
                    independence_weight=0.7 if evidence_type in {"personal_experience", "explicit_complaint", "explicit_spending"} else 0.35,
                    organic_evidence_weight=0.7 if evidence_type not in {"promotion", "advertisement", "researcher_question"} else 0.0,
                    evidence_text=normalized[:500],
                    extraction_model="rules_v2",
                    verification_status="rules_unverified",
                )
            )
        if (pricing or switched or considering or purchase_intent) and not findings:
            findings.append(
                ResearchFinding(
                    source_type=source_type, source_id=source_id, source_url=source_url,
                    post_id=source_id if source_type == "post" else None,
                    finding_id=make_finding_id(source_type, source_id, "behaviour_signal", normalized),
                    industry=self.industry, category="behaviour_signal", brand=brand,
                    stakeholder_role=infer_stakeholder_role(normalized),
                    evidence_type=infer_evidence_type(normalized, "behaviour_signal", pricing, switched, considering, purchase_intent),
                    problem_category="behaviour_signal",
                    product_or_platform=brand,
                    pricing_mentioned=pricing is not None,
                    amount=pricing[0] if pricing else None,
                    money_amount=pricing[0] if pricing else None,
                    currency=pricing[1] if pricing else None,
                    billing_period=infer_billing_period(normalized),
                    switched=switched,
                    switching_from=infer_switching_from(normalized, brand) if switched else None,
                    switching_to=infer_switching_to(normalized) if switched or considering else None,
                    considering_switch=considering and not switched,
                    purchase_intent=purchase_intent,
                    explicit_solution_request=purchase_intent,
                    willingness_to_pay="愿意付" in normalized or "would pay" in lower or "willing to pay" in lower,
                    emotion=infer_emotion(normalized),
                    severity=infer_severity(normalized),
                    confidence=0.65,
                    extraction_model="rules_v2",
                    verification_status="rules_unverified",
                    evidence_text=normalized[:500],
                )
            )
        return findings

    def _classify_with_codex(self, source_type: str, source_id: str, source_url: str | None, text: str) -> list[ResearchFinding]:
        codex_bin = os.getenv("CODEX_BIN", "codex")
        if shutil.which(codex_bin) is None:
            return []
        schema = {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "findings": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "category": {"type": "string"},
                            "subcategory": {"type": ["string", "null"]},
                            "brand": {"type": ["string", "null"]},
                            "competitor": {"type": ["string", "null"]},
                            "sentiment": {"type": ["string", "null"]},
                            "complaint": {"type": "boolean"},
                            "pain_point": {"type": ["string", "null"]},
                            "feature_request": {"type": "boolean"},
                            "pricing_mentioned": {"type": "boolean"},
                            "amount": {"type": ["number", "null"]},
                            "currency": {"type": ["string", "null"]},
                            "switched": {"type": "boolean"},
                            "switching_from": {"type": ["string", "null"]},
                            "switching_to": {"type": ["string", "null"]},
                            "considering_switch": {"type": "boolean"},
                            "purchase_intent": {"type": "boolean"},
                            "urgency": {"type": ["string", "null"]},
                            "confidence": {"type": "number"},
                            "evidence_text": {"type": "string"},
                        },
                        "required": [
                            "category", "subcategory", "brand", "competitor", "sentiment",
                            "complaint", "pain_point", "feature_request", "pricing_mentioned",
                            "amount", "currency", "switched", "switching_from", "switching_to",
                            "considering_switch", "purchase_intent", "urgency", "confidence",
                            "evidence_text",
                        ],
                    },
                }
            },
            "required": ["findings"],
        }
        prompt = (
            "Extract evidence-supported Malaysia property-agent research findings from this XHS text. "
            "Return JSON matching the provided schema. Do not claim actual switching unless explicitly stated. "
            "Use null for unknown fields and [] if there are no findings.\n\n"
            f"Text:\n{text[:4000]}"
        )
        with tempfile.NamedTemporaryFile("w", suffix=".json", encoding="utf-8", delete=True) as schema_file:
            json.dump(schema, schema_file)
            schema_file.flush()
            completed = subprocess.run(
                [
                    codex_bin,
                    "exec",
                    "--skip-git-repo-check",
                    "--sandbox",
                    "read-only",
                    "--output-schema",
                    schema_file.name,
                    prompt,
                ],
                capture_output=True,
                text=True,
                timeout=120,
                check=False,
            )
        if completed.returncode != 0:
            return []
        payload = _extract_json_object(completed.stdout)
        return [
            ResearchFinding(
                source_type=source_type,
                source_id=source_id,
                source_url=source_url,
                industry=self.industry,
                **item,
            )
            for item in payload.get("findings", [])
        ]


def contains_any(text: str, terms: list[str]) -> bool:
    return any(term.lower() in text for term in terms)


def _extract_json_object(output: str) -> dict:
    text = output.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        return json.loads(text[start : end + 1])
    return {"findings": []}


def extract_price(text: str) -> tuple[float, str] | None:
    match = re.search(r"\b(RM|MYR)\s?([0-9][0-9,]*(?:\.\d+)?)\s*([kK])?", text, re.IGNORECASE)
    if match:
        amount = float(match.group(2).replace(",", ""))
        if match.group(3):
            amount *= 1000
        return amount, match.group(1).upper()
    match = re.search(r"([0-9][0-9,]*(?:\.\d+)?)\s*([kK])?\s*(?:马币|令吉)", text)
    if match:
        amount = float(match.group(1).replace(",", ""))
        if match.group(2):
            amount *= 1000
        return amount, "MYR"
    return None


def make_finding_id(source_type: str, source_id: str, category: str, text: str) -> str:
    digest = sha1(f"{source_type}|{source_id}|{category}|{text[:160]}".encode("utf-8")).hexdigest()[:12]
    return f"{source_type}:{source_id}:{category}:{digest}"


def infer_stakeholder_role(text: str) -> str:
    lower = text.lower()
    if any(term in lower for term in ["property agent", "ren", "房产中介", "地产经纪", "subsale agent", "agent"]):
        return "property_agent"
    if any(term in lower for term in ["租客", "tenant", "租房"]):
        return "tenant"
    if any(term in lower for term in ["买家", "buyer"]):
        return "buyer"
    if any(term in lower for term in ["房东", "屋主", "landlord", "owner"]):
        return "landlord"
    if any(term in lower for term in ["seller", "卖家"]):
        return "seller"
    if any(term in lower for term in ["招聘", "底薪", "recruit"]):
        return "recruiter"
    if any(term in lower for term in ["crm", "software", "软件", "系统"]):
        return "software_vendor"
    return "unknown"


def infer_evidence_type(text: str, category: str, pricing: tuple[float, str] | None, switched: bool, considering: bool, purchase_intent: bool) -> str:
    lower = text.lower()
    if any(term in lower for term in ["有兴趣", "pm", "敲我", "联系我", "招聘", "底薪"]):
        return "advertisement"
    if any(term in lower for term in ["想问问", "会不会", "有没有人", "do you", "would you"]):
        return "researcher_question"
    if switched:
        return "explicit_switch"
    if considering:
        return "considering_switch"
    if pricing:
        return "explicit_spending"
    if category == "feature_request":
        return "feature_request"
    if purchase_intent:
        return "request_for_solution"
    if any(term in lower for term in ["我", "用了", "遇到", "我的", "this happens to me"]):
        return "personal_experience"
    if category == "positive_feedback":
        return "positive_outcome"
    if category in {"behaviour_signal"}:
        return "general_opinion"
    return "explicit_complaint"


def infer_billing_period(text: str) -> str | None:
    lower = text.lower()
    if any(term in lower for term in ["一年", "annual", "year", "/yr"]):
        return "annual"
    if any(term in lower for term in ["一个月", "monthly", "month", "/mo"]):
        return "monthly"
    return None


def infer_emotion(text: str) -> str | None:
    lower = text.lower()
    if any(term in lower for term in ["想哭", "迷茫", "frustrated", "很累", "做不下去", "吐"]):
        return "frustration"
    if any(term in lower for term in ["被骗", "scam", "避雷"]):
        return "distrust"
    if any(term in lower for term in ["安心", "好用", "有效"]):
        return "relief"
    return None


def infer_severity(text: str) -> float | None:
    lower = text.lower()
    score = 0.3
    if any(term in lower for term in ["做不下去", "想转行", "封号", "被骗", "五万", "50,000"]):
        score += 0.4
    if any(term in lower for term in ["太贵", "浪费钱", "没客户", "没成交", "吐"]):
        score += 0.2
    return min(1.0, round(score, 2))


def infer_switching_from(text: str, brand: str | None) -> str | None:
    return brand


def infer_switching_to(text: str) -> str | None:
    for brand in BRANDS:
        if f"to {brand.lower()}" in text.lower() or f"转去{brand}" in text:
            return brand
    if "tiktok" in text.lower():
        return "TikTok"
    if "facebook" in text.lower():
        return "Facebook"
    if "小红书" in text:
        return "XHS"
    return None
