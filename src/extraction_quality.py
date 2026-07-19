from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from urllib.parse import urlsplit, urlunsplit

from .date_parser import parse_xhs_date
from .models import Comment, Post
from .utils import clean_text


UI_EXACT = {
    "Explore", "Post", "Notifications", "Me", "About rednote", "Terms of Service",
    "Privacy Policy", "Privacy preferences", "Follow", "Reply", "Like", "View replies",
    "Comment", "Send", "Cancel", "Send Cancel", "Event", "Hover to see their infoEvent",
    "Report", "Download image", "Copy image", "Copy note link", "Report comment",
    "About", "Privacy", "preferences", "rednote Terms of Service Privacy Policy Privacy preferences",
    "The end", "- The end -", "Author", "Edited at",
}
UI_SUBSTRINGS = (
    "Explore Post Notifications Me",
    "About rednote Terms of Service Privacy Policy",
    "Privacy preferences ©",
    "Hover to see their infoEvent",
    "Download imageCopy imageCopy note link",
    "It looks like you're using an ad blocker",
)
BAD_AUTHOR_NAMES = {"Me", "Follow", "Explore", "Notifications", "Post", "Author", "About", "Privacy", "©", ""}
DATE_PATTERN = re.compile(
    r"(?P<date>(?:\d+\s*d\s*ago)|(?:\d+\s*h\s*ago)|Yesterday|Today|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?|\d{4}-\d{2}-\d{2})",
    re.I,
)


@dataclass
class ExtractionResult:
    post: Post | None
    comments: list[Comment] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def canonicalize_rednote_url(url: str | None, post_id: str | None = None) -> str:
    if not url and post_id:
        return f"https://www.rednote.com/explore/{post_id}"
    if not url:
        return ""
    parts = urlsplit(url)
    path = parts.path.replace("/search_result/", "/explore/")
    return urlunsplit((parts.scheme or "https", parts.netloc or "www.rednote.com", path.rstrip("/"), parts.query, ""))


def is_ui_text(text: str | None) -> bool:
    value = clean_text(text)
    if not value:
        return True
    if value in UI_EXACT:
        return True
    if any(part in value for part in UI_SUBSTRINGS):
        return True
    if "Terms of Service" in value or "Privacy Policy" in value:
        return True
    if value.endswith("Follow") and meaningful_length(value.removesuffix("Follow")) <= 30:
        return True
    if re.fullmatch(r"(?:Comment\s*)?\d+(?:\s+\d+){0,3}", value):
        return True
    if re.fullmatch(r"\d+\s+comments?", value, flags=re.I):
        return True
    if re.match(r"^\d+\s+comments?\s+", value, flags=re.I):
        return True
    if re.fullmatch(r"(?:马来西亚|malaysia)\s*\d*", value, flags=re.I):
        return True
    if re.fullmatch(r"(?:\d+\s*)?(?:Like|Reply|View\s+\d+\s+replies)(?:\s*)", value, flags=re.I):
        return True
    if re.fullmatch(r"©\s*\d{4}\s*rednote", value, flags=re.I):
        return True
    return False


def is_valid_author_name(name: str | None) -> bool:
    value = clean_text(name)
    return bool(value and value not in BAD_AUTHOR_NAMES and not is_ui_text(value) and len(value) <= 80)


def meaningful_length(text: str | None) -> int:
    return len(re.sub(r"[\W_]+", "", text or "", flags=re.UNICODE))


def is_valid_post_body(text: str | None) -> tuple[bool, list[str]]:
    warnings: list[str] = []
    value = clean_text(text)
    if meaningful_length(value) < 15:
        warnings.append("body_too_short")
    ui_hits = [part for part in UI_SUBSTRINGS if part in value]
    if ui_hits:
        warnings.append("body_contains_ui_boilerplate")
    if " comments " in f" {value} " or re.search(r"\d+\s+comments", value, re.I):
        warnings.append("body_may_include_comments")
    if len(value) > 3000:
        warnings.append("body_unusually_long")
    return not warnings, warnings


def is_valid_comment_text(text: str | None) -> tuple[bool, list[str]]:
    warnings: list[str] = []
    value = clean_text(text)
    if not value:
        warnings.append("empty")
    if is_ui_text(value):
        warnings.append("ui_text")
    if meaningful_length(value) < 3:
        warnings.append("not_natural_language")
    if DATE_PATTERN.fullmatch(value) or re.fullmatch(r"\d+\s*(?:Reply|Like)?", value, flags=re.I):
        warnings.append("date_or_count_only")
    if re.fullmatch(r"\d+\s+comments?", value, flags=re.I):
        warnings.append("comment_count_only")
    if re.match(r"^\d+\s+comments?\s+", value, flags=re.I):
        warnings.append("comment_container")
    if re.fullmatch(r"(?:马来西亚|malaysia)\s*\d*", value, flags=re.I):
        warnings.append("location_or_count_only")
    if len(value) > 600:
        warnings.append("likely_container_text")
    if "Terms of Service" in value or "Privacy Policy" in value or value.endswith("Follow"):
        warnings.append("ui_fragment")
    return not warnings, warnings


def classify_content_origin(title: str | None, body: str | None, author_name: str | None = None) -> tuple[str, float, float, float]:
    text = f"{title or ''} {body or ''}".lower()
    leading_terms = ("你是否", "会不会", "想问问", "is this", "would you", "do you lose", "求问", "有想")
    promo_terms = ("有兴趣", "pm", "敲我", "招聘", "底薪", "课程", "marketing", "私信", "联系我")
    listing_terms = ("for rent", "出租", "出售", "sqft", "bedroom", "room", "公寓")
    leading = min(1.0, sum(1 for term in leading_terms if term in text) / 3)
    promo = min(1.0, sum(1 for term in promo_terms if term in text) / 3)
    if promo >= 0.67:
        return "service_advertisement", leading, promo, 0.0
    if "招聘" in text or "底薪" in text:
        return "recruitment", leading, promo, 0.0
    if sum(1 for term in listing_terms if term in text) >= 3:
        return "property_listing", leading, promo, 0.1
    if leading >= 0.67:
        return "researcher_prompt", leading, promo, 0.15
    if "?" in text or "？" in text or "求推荐" in text:
        return "organic_question", leading, promo, 0.45
    if any(term in text for term in ("我", "遇到", "用了", "最近", "真的", "太贵", "没客户", "被骗")):
        return "organic_experience", leading, promo, 1.0
    return "unknown", leading, promo, 0.3


def clean_browser_detail(detail: dict[str, Any], crawled_at: datetime | None = None) -> ExtractionResult:
    warnings: list[str] = []
    post_id = str(detail.get("post_id") or "")
    title = clean_text(detail.get("title") or detail.get("page_title", "").replace(" - rednote", ""))
    body = clean_text(detail.get("meta_description") or _body_from_candidates(detail, title))
    valid_body, body_warnings = is_valid_post_body(body)
    warnings.extend(body_warnings)
    author_name = _best_author(detail)
    if not author_name:
        warnings.append("author_unknown_or_invalid")
    date_text = _first_date_text(detail)
    parsed = parse_xhs_date(date_text, crawled_at)
    origin, leading, promo, organic_weight = classify_content_origin(title, body, author_name)
    confidence = 0.9
    if not valid_body:
        confidence -= 0.35
    if not author_name:
        confidence -= 0.15
    if not parsed.parsed_date:
        confidence -= 0.1
    confidence = max(0.05, round(confidence, 2))
    post = Post(
        platform="rednote-web",
        post_id=post_id,
        url=canonicalize_rednote_url(detail.get("page_url") or detail.get("url"), post_id),
        title=title,
        body=body,
        author_name=author_name,
        published_at=None,
        hashtags=_extract_hashtags(body),
        search_keyword=detail.get("search_keyword"),
        raw_json=detail,
        canonical_url=canonicalize_rednote_url(detail.get("page_url") or detail.get("url"), post_id),
        post_body=body,
        location_label=_location_from_text(detail.get("visible_text") or body),
        original_date_text=parsed.original_date_text,
        parsed_date=parsed.parsed_date,
        date_confidence=parsed.date_confidence,
        extraction_method="browser_meta_description_and_candidates",
        extraction_confidence=confidence,
        extraction_warnings=warnings,
        content_origin=origin,
        leading_question_score=leading,
        promotional_score=promo,
        organic_evidence_weight=organic_weight,
    )
    comments = clean_browser_comments(detail, post)
    return ExtractionResult(post=post, comments=comments, warnings=warnings)


def clean_browser_comments(detail: dict[str, Any], post: Post) -> list[Comment]:
    candidates = [clean_text(value) for value in detail.get("text_candidates") or []]
    comments: list[Comment] = []
    seen: set[str] = set()
    body = post.body or ""
    for index, candidate in enumerate(candidates):
        if not candidate or candidate == post.title or candidate == body or candidate in body:
            continue
        if is_ui_text(candidate):
            continue
        if not DATE_PATTERN.search(candidate):
            continue
        if len(candidate) > 700:
            continue
        author, text = split_comment_author_text(candidate)
        text = strip_comment_chrome(text)
        if author and (author == post.title or author == post.author_name):
            continue
        if text == post.title or text == body or text in body or body in text:
            continue
        if not author and meaningful_length(text) < 8:
            continue
        valid, warnings = is_valid_comment_text(text)
        if not valid:
            continue
        fingerprint = re.sub(r"\W+", "", text.lower())
        if fingerprint in seen:
            continue
        seen.add(fingerprint)
        date_text = _first_match(DATE_PATTERN, candidate)
        parsed = parse_xhs_date(date_text)
        if not parsed.parsed_date:
            continue
        comments.append(
            Comment(
                platform="rednote-web",
                comment_id=f"{post.post_id}:clean:{index}",
                post_id=post.post_id,
                parent_comment_id=None,
                depth=0,
                url=post.url,
                author_name=author if is_valid_author_name(author) else None,
                text=text,
                raw_json={"source": "chrome_cleaned_text_candidate", "raw_text": candidate, "warnings": warnings},
                canonical_post_url=post.canonical_url or post.url,
                original_date_text=parsed.original_date_text,
                parsed_date=parsed.parsed_date,
                date_confidence=parsed.date_confidence,
                location_label=_location_from_text(candidate),
                is_author_reply=bool(author and post.author_name and author.replace(" Author", "") == post.author_name),
                extraction_method="browser_text_candidate_cleaner",
                extraction_confidence=0.65 if author else 0.5,
                extraction_warnings=warnings,
            )
        )
    return comments


def split_comment_author_text(value: str) -> tuple[str | None, str]:
    text = clean_text(value)
    date_match = DATE_PATTERN.search(text)
    prefix = text[: date_match.start()].strip() if date_match else text
    prefix = re.sub(r"\s+(Like|Reply|View\s+\d+\s+replies).*$", "", prefix, flags=re.I).strip()
    if not prefix:
        return None, text
    parts = prefix.split(" ", 1)
    if len(parts) == 2 and is_valid_author_name(parts[0]) and meaningful_length(parts[1]) >= 3:
        return parts[0], parts[1]
    return None, prefix


def strip_comment_chrome(value: str) -> str:
    text = clean_text(value)
    text = DATE_PATTERN.sub("", text)
    text = re.sub(r"\b(?:Like|Reply|View\s+\d+\s+replies)\b", "", text, flags=re.I)
    text = re.sub(r"\b\d+\s*$", "", text)
    return clean_text(text)


def _body_from_candidates(detail: dict[str, Any], title: str) -> str:
    for candidate in detail.get("text_candidates") or []:
        candidate = clean_text(candidate)
        if title and candidate.startswith(title):
            return clean_text(candidate.removeprefix(title))
    return clean_text(detail.get("visible_text"))


def _best_author(detail: dict[str, Any]) -> str | None:
    for value in detail.get("author_candidates") or []:
        value = clean_text(value).replace("Follow", "").strip()
        if is_valid_author_name(value):
            return value
    visible = clean_text(detail.get("visible_text"))
    match = re.search(r"More\s+(.*?)\s+Follow\s+", visible)
    if match and is_valid_author_name(match.group(1)):
        return match.group(1)
    return None


def _first_date_text(detail: dict[str, Any]) -> str | None:
    for candidate in detail.get("text_candidates") or []:
        match = DATE_PATTERN.search(clean_text(candidate))
        if match:
            return match.group("date")
    return _first_match(DATE_PATTERN, detail.get("visible_text") or "")


def _first_match(pattern: re.Pattern[str], text: str) -> str | None:
    match = pattern.search(clean_text(text))
    return match.group("date") if match and "date" in match.groupdict() else (match.group(0) if match else None)


def _extract_hashtags(text: str) -> list[str]:
    return [tag.strip("#") for tag in re.findall(r"#[\w\u4e00-\u9fff_]+", text or "")]


def _location_from_text(text: str | None) -> str | None:
    value = clean_text(text)
    for location in ("马来西亚", "吉隆坡", "KL", "Kuala Lumpur", "Selangor", "Johor", "Penang", "Bandar Utama"):
        if location.lower() in value.lower():
            return location
    return None


def warnings_json(warnings: list[str]) -> str:
    return json.dumps(warnings, ensure_ascii=False)
