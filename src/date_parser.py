from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo


MALAYSIA_TZ = ZoneInfo("Asia/Kuala_Lumpur")
MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


@dataclass(frozen=True)
class ParsedDate:
    original_date_text: str | None
    parsed_date: str | None
    date_confidence: float


def parse_xhs_date(label: str | None, crawled_at: datetime | None = None) -> ParsedDate:
    if not label:
        return ParsedDate(None, None, 0.0)
    text = re.sub(r"\s+", " ", label.strip())
    text = re.sub(r"^(edited at|edited)\s+", "", text, flags=re.I)
    base = (crawled_at or datetime.now(MALAYSIA_TZ)).astimezone(MALAYSIA_TZ).date()
    lowered = text.lower()

    if lowered in {"today", "今天"}:
        return ParsedDate(label, base.isoformat(), 0.85)
    if lowered in {"yesterday", "昨天"}:
        return ParsedDate(label, (base - timedelta(days=1)).isoformat(), 0.85)
    match = re.match(r"(\d+)\s*d\s*ago", lowered)
    if match:
        return ParsedDate(label, (base - timedelta(days=int(match.group(1)))).isoformat(), 0.8)
    match = re.match(r"(\d+)\s*h\s*ago", lowered)
    if match:
        return ParsedDate(label, base.isoformat(), 0.55)
    match = re.match(r"([a-z]{3,9})\s+(\d{1,2})(?:,\s*(\d{4}))?$", lowered)
    if match:
        month = MONTHS.get(match.group(1)[:3])
        if month:
            day = int(match.group(2))
            year = int(match.group(3) or base.year)
            parsed = date(year, month, day)
            if match.group(3) is None and parsed > base:
                parsed = date(year - 1, month, day)
            return ParsedDate(label, parsed.isoformat(), 0.75 if match.group(3) is None else 0.9)
    match = re.match(r"(\d{4})-(\d{1,2})-(\d{1,2})$", lowered)
    if match:
        return ParsedDate(label, date(int(match.group(1)), int(match.group(2)), int(match.group(3))).isoformat(), 0.95)
    return ParsedDate(label, None, 0.0)
