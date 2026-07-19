from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from typing import Protocol
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from rapidfuzz import fuzz


class HasIdentityAndText(Protocol):
    url: str | None


def canonical_url(url: str | None) -> str:
    if not url:
        return ""
    parts = urlsplit(url)
    query = urlencode(sorted((k, v) for k, v in parse_qsl(parts.query) if not k.startswith("utm_")))
    return urlunsplit((parts.scheme, parts.netloc.lower(), parts.path.rstrip("/"), query, ""))


def normalize_text(text: str | None) -> str:
    text = (text or "").lower()
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\u4e00-\u9fff]+", "", text)
    return text.strip()


def text_hash(text: str | None) -> str:
    return hashlib.sha256(normalize_text(text).encode("utf-8")).hexdigest()


@dataclass
class Deduplicator:
    near_duplicate_threshold: int = 92
    ids: set[str] = field(default_factory=set)
    urls: set[str] = field(default_factory=set)
    hashes: set[str] = field(default_factory=set)
    texts: list[str] = field(default_factory=list)

    def is_duplicate(self, item_id: str | None = None, url: str | None = None, text: str | None = None) -> bool:
        if item_id and item_id in self.ids:
            return True
        normalized_url = canonical_url(url)
        if normalized_url and normalized_url in self.urls:
            return True
        normalized_text = normalize_text(text)
        hashed = text_hash(text)
        if normalized_text and hashed in self.hashes:
            return True
        if normalized_text and any(fuzz.ratio(normalized_text, old) >= self.near_duplicate_threshold for old in self.texts):
            return True
        if item_id:
            self.ids.add(item_id)
        if normalized_url:
            self.urls.add(normalized_url)
        if normalized_text:
            self.hashes.add(hashed)
            self.texts.append(normalized_text)
        return False
