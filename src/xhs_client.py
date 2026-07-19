from __future__ import annotations

import json
import os
import shutil
import subprocess
from dataclasses import dataclass
from typing import Any

from .models import Comment, Post
from .utils import clean_text, first_present, parse_datetime


class XHSError(RuntimeError):
    pass


class XHSAuthError(XHSError):
    pass


class XHSRiskControlError(XHSError):
    pass


class XHSRateLimitError(XHSRiskControlError):
    pass


@dataclass
class XHSCommandResult:
    args: list[str]
    stdout: str
    stderr: str
    data: Any


RISK_TERMS = ("captcha", "验证码", "验证", "risk", "风控", "安全验证", "滑块")
AUTH_TERMS = ("login", "登录", "auth", "cookie", "unauthorized", "未登录", "无登录信息")
RATE_TERMS = ("429", "rate limit", "too many requests", "请求过于频繁", "频繁")


class XHSClient:
    def __init__(self, binary: str | None = None, timeout_seconds: int = 60) -> None:
        self.binary = binary or os.getenv("XHS_BIN", "xhs")
        self.timeout_seconds = timeout_seconds

    def is_installed(self) -> bool:
        return shutil.which(self.binary) is not None

    def run(self, args: list[str], timeout_seconds: int | None = None) -> XHSCommandResult:
        if not self.is_installed():
            raise FileNotFoundError(
                "xhs CLI not found. Install with: uv tool install xiaohongshu-cli"
            )
        cmd = [self.binary, *args]
        try:
            completed = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout_seconds or self.timeout_seconds,
                check=False,
            )
        except subprocess.TimeoutExpired as exc:
            raise XHSError(f"xhs command timed out: {' '.join(cmd)}") from exc

        combined = f"{completed.stdout}\n{completed.stderr}".lower()
        if any(term in combined for term in RATE_TERMS):
            raise XHSRateLimitError(completed.stderr or completed.stdout)
        if any(term in combined for term in RISK_TERMS):
            raise XHSRiskControlError(completed.stderr or completed.stdout)
        if any(term in combined for term in AUTH_TERMS) and completed.returncode != 0:
            raise XHSAuthError(completed.stderr or completed.stdout)
        if completed.returncode != 0:
            message = self._extract_error_message(completed.stdout, completed.stderr)
            lowered = message.lower()
            if any(term in lowered for term in RATE_TERMS):
                raise XHSRateLimitError(message)
            if any(term in lowered for term in RISK_TERMS):
                raise XHSRiskControlError(message)
            if any(term in lowered for term in AUTH_TERMS) or '"code": -101' in message or "code': -101" in message:
                raise XHSAuthError(message)
            raise XHSError(message or f"xhs exited {completed.returncode}")

        data = self._parse_json(completed.stdout)
        return XHSCommandResult(args=cmd, stdout=completed.stdout, stderr=completed.stderr, data=data)

    def status(self) -> XHSCommandResult:
        return self.run(["status", "--json"], timeout_seconds=30)

    def search(self, keyword: str, sort: str = "latest") -> tuple[list[dict[str, Any]], Any]:
        result = self.run(["search", keyword, "--sort", sort, "--json"])
        data = unwrap_envelope(result.data)
        return ensure_list(data), result.data

    def read(self, url_or_id: str) -> tuple[dict[str, Any], Any]:
        result = self.run(["read", url_or_id, "--json"])
        data = unwrap_envelope(result.data)
        if isinstance(data, list):
            data = data[0] if data else {}
        return data if isinstance(data, dict) else {"value": data}, result.data

    def comments(self, url: str, all_comments: bool = True) -> tuple[list[dict[str, Any]], Any]:
        args = ["comments", url]
        if all_comments:
            args.append("--all")
        args.append("--json")
        result = self.run(args, timeout_seconds=120)
        data = unwrap_envelope(result.data)
        return ensure_list(data), result.data

    def _parse_json(self, stdout: str) -> Any:
        text = stdout.strip()
        if not text:
            return {}
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Some CLIs print progress before JSON. Try the last JSON-looking line.
            for line in reversed(text.splitlines()):
                line = line.strip()
                if line.startswith("{") or line.startswith("["):
                    try:
                        return json.loads(line)
                    except json.JSONDecodeError:
                        continue
            raise XHSError(f"Malformed xhs JSON output: {text[:500]}")

    def _extract_error_message(self, stdout: str, stderr: str) -> str:
        text = (stdout or stderr or "").strip()
        if not text:
            return ""
        try:
            payload = json.loads(text)
            error = payload.get("error") if isinstance(payload, dict) else None
            if isinstance(error, dict):
                return _decode_nested_api_message(str(error.get("message") or error))
            return json.dumps(payload, ensure_ascii=False)
        except json.JSONDecodeError:
            return _decode_nested_api_message(text)


def _decode_nested_api_message(message: str) -> str:
    start = message.find("{")
    end = message.rfind("}")
    if start >= 0 and end > start:
        try:
            payload = json.loads(message[start : end + 1])
            if isinstance(payload, dict) and payload.get("msg"):
                return f"XHS API error {payload.get('code')}: {payload['msg']}"
        except json.JSONDecodeError:
            pass
    return message


def unwrap_envelope(payload: Any) -> Any:
    if isinstance(payload, dict):
        if payload.get("ok") is False:
            message = str(payload.get("error") or payload.get("message") or payload)
            lowered = message.lower()
            if any(term in lowered for term in RATE_TERMS):
                raise XHSRateLimitError(message)
            if any(term in lowered for term in RISK_TERMS):
                raise XHSRiskControlError(message)
            if any(term in lowered for term in AUTH_TERMS):
                raise XHSAuthError(message)
            raise XHSError(message)
        for key in ("data", "items", "result", "results", "notes", "comments"):
            if key in payload:
                return payload[key]
    return payload


def ensure_list(data: Any) -> list[dict[str, Any]]:
    data = unwrap_envelope(data)
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]
    if isinstance(data, dict):
        for key in ("items", "results", "notes", "comments", "data"):
            if key in data:
                return ensure_list(data[key])
        return [data]
    return []


def normalize_post(raw: dict[str, Any], search_keyword: str | None = None) -> Post:
    post_id = str(
        first_present(raw, "post_id", "note_id", "id", "noteId", "xsec_token")
        or first_present(raw.get("note", {}) if isinstance(raw.get("note"), dict) else {}, "id", "note_id")
        or ""
    )
    url = str(first_present(raw, "url", "share_url", "link", "note_url") or "")
    author = raw.get("author") if isinstance(raw.get("author"), dict) else {}
    title = first_present(raw, "title", "display_title", "desc")
    body = first_present(raw, "body", "content", "desc", "description")
    hashtags = raw.get("hashtags") or raw.get("tags") or []
    if isinstance(hashtags, str):
        hashtags = [hashtags]
    return Post(
        post_id=post_id or url or clean_text(f"{title} {body}")[:80],
        url=url,
        title=clean_text(title),
        body=clean_text(body),
        author_id=str(first_present(raw, "author_id", "user_id") or first_present(author, "id", "user_id") or "") or None,
        author_name=first_present(raw, "author_name", "nickname") or first_present(author, "name", "nickname"),
        author_bio=first_present(author, "bio", "desc"),
        published_at=parse_datetime(first_present(raw, "published_at", "time", "create_time", "created_at")),
        likes=_to_int(first_present(raw, "likes", "liked_count", "like_count")),
        favorites=_to_int(first_present(raw, "favorites", "collected_count", "collect_count")),
        comment_count=_to_int(first_present(raw, "comment_count", "comments")),
        share_count=_to_int(first_present(raw, "share_count", "shares")),
        hashtags=[str(tag) for tag in hashtags],
        search_keyword=search_keyword,
        raw_json=raw,
    )


def normalize_comment(raw: dict[str, Any], post_id: str, post_url: str | None = None, parent_id: str | None = None) -> list[Comment]:
    author = raw.get("author") if isinstance(raw.get("author"), dict) else raw.get("user", {})
    if not isinstance(author, dict):
        author = {}
    comment_id = str(first_present(raw, "comment_id", "id", "commentId") or "")
    text = clean_text(first_present(raw, "text", "content", "body", "desc"))
    comment = Comment(
        comment_id=comment_id or f"{post_id}:{hash(text)}",
        post_id=post_id,
        parent_comment_id=parent_id,
        url=post_url,
        author_id=str(first_present(raw, "author_id", "user_id") or first_present(author, "id", "user_id") or "") or None,
        author_name=first_present(raw, "author_name", "nickname") or first_present(author, "name", "nickname"),
        text=text,
        created_at=parse_datetime(first_present(raw, "created_at", "create_time", "time")),
        likes=_to_int(first_present(raw, "likes", "like_count")),
        raw_json=raw,
    )
    comments = [comment]
    replies = raw.get("replies") or raw.get("sub_comments") or raw.get("subComments") or []
    if isinstance(replies, dict):
        replies = ensure_list(replies)
    for reply in replies if isinstance(replies, list) else []:
        if isinstance(reply, dict):
            comments.extend(normalize_comment(reply, post_id, post_url, comment.comment_id))
    return comments


def _to_int(value: Any) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
