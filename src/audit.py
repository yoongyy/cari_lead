from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from .extraction_quality import UI_EXACT, UI_SUBSTRINGS, is_ui_text, is_valid_comment_text


def write_data_quality_audit(
    posts_path: Path = Path("data/normalized/posts.csv"),
    comments_path: Path = Path("data/normalized/comments.csv"),
    findings_path: Path = Path("data/normalized/findings.csv"),
    output_path: Path = Path("data/reports/data_quality_audit.md"),
) -> Path:
    posts = pd.read_csv(posts_path) if posts_path.exists() else pd.DataFrame()
    comments = pd.read_csv(comments_path) if comments_path.exists() else pd.DataFrame()
    findings = pd.read_csv(findings_path) if findings_path.exists() else pd.DataFrame()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    post_body = posts.get("body", pd.Series(dtype=str)).fillna("").astype(str)
    comment_text = comments.get("text", pd.Series(dtype=str)).fillna("").astype(str)
    ui_post_mask = post_body.apply(_contains_ui)
    comments_in_body_mask = post_body.str.contains(r"\d+\s+comments| Reply | Send Cancel|View \d+ replies", case=False, regex=True)
    bad_author_mask = posts.get("author_name", pd.Series(dtype=str)).fillna("").astype(str).isin(["Me", "Follow", "Explore", "Notifications"])
    invalid_comment_mask = comment_text.apply(lambda text: not is_valid_comment_text(text)[0])
    comment_metadata_mask = comment_text.str.contains(r"\b(?:Reply|Like|View \d+ replies|\d+d ago|Yesterday|Today|马来西亚)\b", case=False, regex=True)

    null_counts = {
        "posts.published_at": _null_count(posts, "published_at"),
        "posts.author_name_bad_or_null": int(bad_author_mask.sum() + posts.get("author_name", pd.Series(dtype=str)).isna().sum()),
        "posts.likes": _null_count(posts, "likes"),
        "posts.favorites": _null_count(posts, "favorites"),
        "posts.comment_count": _null_count(posts, "comment_count"),
        "comments.parent_comment_id": _null_count(comments, "parent_comment_id"),
        "comments.author_name": _null_count(comments, "author_name"),
        "comments.created_at": _null_count(comments, "created_at"),
        "comments.likes": _null_count(comments, "likes"),
    }
    examples = {
        "ui_contaminated_posts": _examples(posts[ui_post_mask], ["post_id", "title", "author_name", "body"]),
        "comment_contaminated_posts": _examples(posts[comments_in_body_mask], ["post_id", "title", "body"]),
        "bad_author_posts": _examples(posts[bad_author_mask], ["post_id", "title", "author_name"]),
        "invalid_comments": _examples(comments[invalid_comment_mask], ["comment_id", "post_id", "text"]),
        "comments_with_metadata": _examples(comments[comment_metadata_mask], ["comment_id", "post_id", "text"]),
    }

    lines = [
        "# Data Quality Audit",
        "",
        "## Scope",
        f"- Posts inspected: {len(posts)}",
        f"- Comments inspected: {len(comments)}",
        f"- Findings inspected: {len(findings)}",
        "",
        "## Confirmed Problems",
        f"- Post bodies containing RedNote UI boilerplate: {int(ui_post_mask.sum())}",
        f"- Post bodies likely containing comments or comment controls: {int(comments_in_body_mask.sum())}",
        f"- Posts with invalid author names such as `Me`: {int(bad_author_mask.sum())}",
        f"- Invalid comment rows: {int(invalid_comment_mask.sum())}",
        f"- Comments containing username/date/location/like/reply metadata: {int(comment_metadata_mask.sum())}",
        "",
        "## Null Or Wrong Important Fields",
    ]
    lines.extend(f"- {key}: {value}" for key, value in null_counts.items())
    lines.extend([
        "",
        "## Examples",
        "```json",
        json.dumps(examples, ensure_ascii=False, indent=2)[:12000],
        "```",
        "",
        "## Code-Level Causes",
        "- Browser crawler imported `visible_text` as `Post.body`, so navigation, post body, comments and controls were merged into one field.",
        "- Browser comment import treated arbitrary visible text candidates as comments without a strong validator.",
        "- Author extraction accepted the logged-in navigation label `Me` as an author candidate.",
        "- Date labels such as `6d ago`, `Jul 4`, and `Yesterday` were not parsed into normalized dates.",
        "- Existing finding extraction ran on contaminated post bodies, so evidence text contains UI and comment text.",
        "",
        "## Required Gate",
        "- Do not run larger crawls until clean post/comment extraction passes validation and exports are regenerated.",
    ])
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return output_path


def _contains_ui(text: str) -> bool:
    return any(part in text for part in UI_SUBSTRINGS) or any(f" {part} " in f" {text} " for part in UI_EXACT)


def _null_count(df: pd.DataFrame, column: str) -> int:
    return int(df[column].isna().sum()) if column in df else 0


def _examples(df: pd.DataFrame, columns: list[str], limit: int = 3) -> list[dict[str, str]]:
    if df.empty:
        return []
    rows = []
    for _, row in df.head(limit).iterrows():
        item = {}
        for column in columns:
            value = "" if column not in row or pd.isna(row[column]) else str(row[column])
            item[column] = value[:500]
        rows.append(item)
    return rows
