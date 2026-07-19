from __future__ import annotations

import re
from dataclasses import dataclass

from .models import ClassificationResult
from .utils import clean_text


COUNTRY = ("马来西亚", "大马", "malaysia", "malaysian")
CITY_STATE = (
    "吉隆坡", "kuala lumpur", " kl ", "雪兰莪", "雪隆", "selangor", "新山",
    "johor bahru", " jb ", "柔佛", "johor", "槟城", "penang", "沙巴", "sabah",
    "砂拉越", "sarawak",
)
LOCAL_IDENTIFIERS = ("rm", "myr", ".com.my")
BRAND_TERMS = ("propertyguru malaysia", "iproperty malaysia", "edgeprop malaysia", "mudah", " ren ")
LANGUAGE_MIX = ("boleh", "tak", "lah", "agent", "loan", "rumah", "condo", "subsale", "bumi lot")
CHINA_ONLY = ("人民币", "北京", "上海", "深圳", "广州", "小区", "学区房", "公积金", "首付比例", "中国大陆")


@dataclass
class MalaysiaClassifier:
    threshold: float = 0.60
    weights: dict[str, float] | None = None

    def classify(self, text: str) -> ClassificationResult:
        weights = {
            "country": 0.45,
            "city_state": 0.25,
            "local_identifier": 0.25,
            "brand_term": 0.20,
            "language_mix": 0.15,
            "china_only_penalty": -0.35,
            **(self.weights or {}),
        }
        normalized = f" {clean_text(text).lower()} "
        score = 0.0
        signals: list[str] = []

        score = self._apply(normalized, COUNTRY, weights["country"], score, signals, "country")
        score = self._apply(normalized, CITY_STATE, weights["city_state"], score, signals, "city_state")
        if re.search(r"(\brm\s?\d|\bmyr\b|\+?60[\s-]?\d{1,2}[\s-]?\d{3,4}[\s-]?\d{3,4}|\.com\.my\b)", normalized):
            score += weights["local_identifier"]
            signals.append("local_identifier")
        score = self._apply(normalized, BRAND_TERMS, weights["brand_term"], score, signals, "brand_term")
        score = self._apply(normalized, LANGUAGE_MIX, weights["language_mix"], score, signals, "language_mix")
        if any(term.lower() in normalized for term in CHINA_ONLY):
            score += weights["china_only_penalty"]
            signals.append("china_only_penalty")
        if re.search(r"(?<![a-z])元(?![a-z])", normalized):
            score += weights["china_only_penalty"]
            signals.append("china_currency_penalty")

        score = min(1.0, max(0.0, round(score, 3)))
        return ClassificationResult(
            score=score,
            signals=signals,
            language=detect_language(text),
            is_relevant=score >= self.threshold,
        )

    @staticmethod
    def _apply(text: str, terms: tuple[str, ...], weight: float, score: float, signals: list[str], label: str) -> float:
        matched = [term for term in terms if term.lower() in text]
        if matched:
            score += weight
            signals.extend(f"{label}:{term.strip()}" for term in matched[:5])
        return score


def detect_language(text: str) -> str:
    has_chinese = bool(re.search(r"[\u4e00-\u9fff]", text))
    has_latin = bool(re.search(r"[A-Za-z]", text))
    if has_chinese and has_latin:
        return "mixed"
    if has_chinese:
        return "zh"
    if has_latin:
        return "en_ms"
    return "unknown"
