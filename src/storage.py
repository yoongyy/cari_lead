from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime
from hashlib import sha1
from pathlib import Path
from typing import Any, Iterable

import pandas as pd
from dotenv import load_dotenv
from pymongo import ASCENDING, MongoClient, ReturnDocument
from pymongo.errors import ConfigurationError
from pymongo.operations import ReplaceOne

from .models import Comment, Post, ResearchFinding


STATE_COLLECTIONS = (
    "queries", "query_runs", "discovered_posts", "post_fetch_state", "comment_fetch_state",
    "risk_events", "source_accounts", "analysis_runs", "insurance_findings", "insurance_crawl_metrics",
)
COLLECTIONS = (
    "crawl_runs", "search_queries", "posts", "comments", "findings", "crawl_errors",
    *STATE_COLLECTIONS,
)


class SQLiteStorage:
    def __init__(self, db_path: Path = Path("data/research.sqlite3")) -> None:
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self.init_db()

    def init_db(self) -> None:
        self.conn.executescript(
            """
            create table if not exists crawl_runs (
              id integer primary key autoincrement, industry text, started_at text,
              ended_at text, status text, config_json text
            );
            create table if not exists search_queries (
              id integer primary key autoincrement, run_id integer, keyword text,
              sort text, searched_at text, result_count integer
            );
            create table if not exists posts (
              post_id text primary key, url text, title text, body text, author_id text,
              author_name text, author_bio text, published_at text, crawled_at text,
              likes integer, favorites integer, comment_count integer, share_count integer,
              hashtags_json text, search_keyword text, raw_json text, malaysia_score real,
              malaysia_signals_json text, language text, is_malaysia_relevant integer
            );
            create table if not exists comments (
              comment_id text primary key, post_id text, parent_comment_id text, url text,
              author_id text, author_name text, text text, created_at text, crawled_at text,
              likes integer, raw_json text, malaysia_score real, malaysia_signals_json text,
              language text, is_malaysia_relevant integer
            );
            create table if not exists findings (
              id integer primary key autoincrement, source_type text, source_id text,
              source_url text, industry text, category text, subcategory text, brand text,
              competitor text, sentiment text, complaint integer, pain_point text,
              feature_request integer, pricing_mentioned integer, amount real, currency text,
              switched integer, switching_from text, switching_to text,
              considering_switch integer, purchase_intent integer, urgency text,
              confidence real, evidence_text text, detected_at text
            );
            create table if not exists crawl_errors (
              id integer primary key autoincrement, run_id integer, url text, keyword text,
              stage text, error_type text, message text, created_at text
            );
            """
        )
        for table in STATE_COLLECTIONS:
            self.conn.execute(
                f"""create table if not exists {table} (
                  record_key text primary key, document_json text not null, updated_at text not null
                )"""
            )
        self._migrate_columns()
        self.conn.commit()

    def _migrate_columns(self) -> None:
        post_columns = {
            "post_body": "text", "author_profile_url": "text", "edited_at": "text",
            "location_label": "text", "canonical_url": "text", "original_date_text": "text",
            "parsed_date": "text", "date_confidence": "real", "extraction_method": "text",
            "extraction_confidence": "real", "extraction_warnings_json": "text",
            "content_origin": "text", "leading_question_score": "real",
            "promotional_score": "real", "organic_evidence_weight": "real",
            "discovered_by_queries_json": "text", "best_search_rank": "integer",
            "number_of_queries_matched": "integer", "first_discovered_at": "text",
            "last_seen_at": "text",
        }
        comment_columns = {
            "depth": "integer", "location_label": "text", "is_author_reply": "integer",
            "canonical_post_url": "text", "original_date_text": "text", "parsed_date": "text",
            "date_confidence": "real", "extraction_method": "text",
            "extraction_confidence": "real", "extraction_warnings_json": "text",
        }
        finding_columns = {
            "finding_id": "text", "post_id": "text", "author_name": "text",
            "stakeholder_role": "text", "content_origin": "text", "evidence_type": "text",
            "problem_category": "text", "problem_description": "text",
            "affected_workflow": "text", "cause": "text", "consequence": "text",
            "current_solution": "text", "workaround": "text", "desired_outcome": "text",
            "product_or_platform": "text", "money_amount": "real", "billing_period": "text",
            "time_cost": "text", "opportunity_cost": "text", "stopped_using": "integer",
            "renewal_intent": "text", "willingness_to_pay": "integer",
            "explicit_solution_request": "integer", "emotion": "text", "severity": "real",
            "frequency_claim": "text", "independence_weight": "real",
            "organic_evidence_weight": "real", "relevance_score": "real",
            "evidence_start": "integer", "evidence_end": "integer",
            "extraction_model": "text", "verifier_model": "text",
            "extraction_prompt_version": "text", "verifier_prompt_version": "text",
            "verification_status": "text", "verification_notes": "text",
        }
        query_columns = {
            "research_question": "text", "page": "integer", "results_returned": "integer",
            "relevant_results": "integer", "spam_results": "integer", "listing_results": "integer",
            "duplicate_results": "integer", "useful_comment_threads": "integer",
            "query_yield_score": "real",
        }
        for table, columns in {
            "posts": post_columns, "comments": comment_columns, "findings": finding_columns,
            "search_queries": query_columns,
        }.items():
            existing = {row[1] for row in self.conn.execute(f"pragma table_info({table})")}
            for column, column_type in columns.items():
                if column not in existing:
                    self.conn.execute(f"alter table {table} add column {column} {column_type}")

    def create_run(self, industry: str, config_json: str) -> int:
        cur = self.conn.execute(
            "insert into crawl_runs(industry, started_at, status, config_json) values (?, ?, ?, ?)",
            (industry, datetime.utcnow().isoformat(), "running", config_json),
        )
        self.conn.commit()
        return int(cur.lastrowid)

    def finish_run(self, run_id: int, status: str) -> None:
        self.conn.execute(
            "update crawl_runs set ended_at=?, status=? where id=?",
            (datetime.utcnow().isoformat(), status, run_id),
        )
        self.conn.commit()

    def save_search_query(self, run_id: int, keyword: str, sort: str, result_count: int) -> None:
        self.conn.execute(
            "insert into search_queries(run_id, keyword, sort, searched_at, result_count) values (?, ?, ?, ?, ?)",
            (run_id, keyword, sort, datetime.utcnow().isoformat(), result_count),
        )
        self.conn.commit()

    def save_post(self, post: Post) -> None:
        self.conn.execute(
            """
            insert or replace into posts (
              post_id, url, title, body, author_id, author_name, author_bio, published_at,
              crawled_at, likes, favorites, comment_count, share_count, hashtags_json,
              search_keyword, raw_json, malaysia_score, malaysia_signals_json, language,
              is_malaysia_relevant, post_body, author_profile_url, edited_at, location_label,
              canonical_url, original_date_text, parsed_date, date_confidence,
              extraction_method, extraction_confidence, extraction_warnings_json,
              content_origin, leading_question_score, promotional_score,
              organic_evidence_weight, discovered_by_queries_json, best_search_rank,
              number_of_queries_matched, first_discovered_at, last_seen_at
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                post.post_id, post.url, post.title, post.body, post.author_id, post.author_name,
                post.author_bio, _dt(post.published_at), _dt(post.crawled_at), post.likes,
                post.favorites, post.comment_count, post.share_count, json.dumps(post.hashtags, ensure_ascii=False),
                post.search_keyword, json.dumps(post.raw_json, ensure_ascii=False, default=str),
                post.malaysia_score, json.dumps(post.malaysia_signals, ensure_ascii=False),
                post.language, int(post.is_malaysia_relevant),
                post.post_body, post.author_profile_url, _dt(post.edited_at), post.location_label,
                post.canonical_url, post.original_date_text, post.parsed_date, post.date_confidence,
                post.extraction_method, post.extraction_confidence,
                json.dumps(post.extraction_warnings, ensure_ascii=False),
                post.content_origin, post.leading_question_score, post.promotional_score,
                post.organic_evidence_weight, json.dumps(post.discovered_by_queries, ensure_ascii=False),
                post.best_search_rank, post.number_of_queries_matched, _dt(post.first_discovered_at),
                _dt(post.last_seen_at),
            ),
        )
        self.conn.commit()

    def save_comment(self, comment: Comment) -> None:
        self.conn.execute(
            """
            insert or replace into comments (
              comment_id, post_id, parent_comment_id, url, author_id, author_name, text,
              created_at, crawled_at, likes, raw_json, malaysia_score, malaysia_signals_json,
              language, is_malaysia_relevant, depth, location_label, is_author_reply,
              canonical_post_url, original_date_text, parsed_date, date_confidence,
              extraction_method, extraction_confidence, extraction_warnings_json
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                comment.comment_id, comment.post_id, comment.parent_comment_id, comment.url,
                comment.author_id, comment.author_name, comment.text, _dt(comment.created_at),
                _dt(comment.crawled_at), comment.likes, json.dumps(comment.raw_json, ensure_ascii=False, default=str),
                comment.malaysia_score, json.dumps(comment.malaysia_signals, ensure_ascii=False),
                comment.language, int(comment.is_malaysia_relevant),
                comment.depth, comment.location_label, int(comment.is_author_reply),
                comment.canonical_post_url, comment.original_date_text, comment.parsed_date,
                comment.date_confidence, comment.extraction_method, comment.extraction_confidence,
                json.dumps(comment.extraction_warnings, ensure_ascii=False),
            ),
        )
        self.conn.commit()

    def save_findings(self, findings: Iterable[ResearchFinding]) -> None:
        rows = [
            (
                f.source_type, f.source_id, f.source_url, f.industry, f.category, f.subcategory,
                f.brand, f.competitor, f.sentiment, int(f.complaint), f.pain_point,
                int(f.feature_request), int(f.pricing_mentioned), f.amount, f.currency,
                int(f.switched), f.switching_from, f.switching_to, int(f.considering_switch),
                int(f.purchase_intent), f.urgency, f.confidence, f.evidence_text, _dt(f.detected_at),
                f.finding_id, f.post_id, f.author_name, f.stakeholder_role, f.content_origin,
                f.evidence_type, f.problem_category, f.problem_description, f.affected_workflow,
                f.cause, f.consequence, f.current_solution, f.workaround, f.desired_outcome,
                f.product_or_platform, f.money_amount, f.billing_period, f.time_cost,
                f.opportunity_cost, int(f.stopped_using), f.renewal_intent,
                int(f.willingness_to_pay), int(f.explicit_solution_request), f.emotion,
                f.severity, f.frequency_claim, f.independence_weight, f.organic_evidence_weight,
                f.relevance_score, f.evidence_start, f.evidence_end, f.extraction_model,
                f.verifier_model, f.extraction_prompt_version, f.verifier_prompt_version,
                f.verification_status, f.verification_notes,
            )
            for f in findings
        ]
        if rows:
            self.conn.executemany(
                """
                insert into findings(source_type, source_id, source_url, industry, category, subcategory,
                brand, competitor, sentiment, complaint, pain_point, feature_request, pricing_mentioned,
                amount, currency, switched, switching_from, switching_to, considering_switch,
                purchase_intent, urgency, confidence, evidence_text, detected_at, finding_id,
                post_id, author_name, stakeholder_role, content_origin, evidence_type,
                problem_category, problem_description, affected_workflow, cause, consequence,
                current_solution, workaround, desired_outcome, product_or_platform, money_amount,
                billing_period, time_cost, opportunity_cost, stopped_using, renewal_intent,
                willingness_to_pay, explicit_solution_request, emotion, severity, frequency_claim,
                independence_weight, organic_evidence_weight, relevance_score, evidence_start,
                evidence_end, extraction_model, verifier_model, extraction_prompt_version,
                verifier_prompt_version, verification_status, verification_notes)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                rows,
            )
            self.conn.commit()

    def save_error(self, run_id: int | None, stage: str, message: str, url: str | None = None, keyword: str | None = None, error_type: str = "error") -> None:
        self.conn.execute(
            "insert into crawl_errors(run_id, url, keyword, stage, error_type, message, created_at) values (?, ?, ?, ?, ?, ?, ?)",
            (run_id, url, keyword, stage, error_type, message, datetime.utcnow().isoformat()),
        )
        self.conn.commit()

    def export_csvs(self, output_dir: Path = Path("data/normalized")) -> None:
        output_dir.mkdir(parents=True, exist_ok=True)
        for table in ("posts", "comments", "findings"):
            pd.read_sql_query(f"select * from {table}", self.conn).to_csv(output_dir / f"{table}.csv", index=False)

    def read_frame(self, table: str) -> pd.DataFrame:
        if table in STATE_COLLECTIONS:
            rows = self.conn.execute(f"select document_json from {table}").fetchall()
            return pd.DataFrame([json.loads(row[0]) for row in rows])
        return pd.read_sql_query(f"select * from {table}", self.conn)

    def upsert_state(self, collection: str, record_key: str, document: dict[str, Any]) -> None:
        if collection not in STATE_COLLECTIONS:
            raise ValueError(f"Unknown state collection: {collection}")
        payload = {**document, "record_key": record_key}
        self.conn.execute(
            f"insert or replace into {collection}(record_key, document_json, updated_at) values (?, ?, ?)",
            (record_key, json.dumps(payload, ensure_ascii=False, default=str), datetime.utcnow().isoformat()),
        )
        self.conn.commit()

    def get_state(self, collection: str, record_key: str) -> dict[str, Any] | None:
        if collection not in STATE_COLLECTIONS:
            raise ValueError(f"Unknown state collection: {collection}")
        row = self.conn.execute(
            f"select document_json from {collection} where record_key=?", (record_key,)
        ).fetchone()
        return json.loads(row[0]) if row else None

    def clear_collections(self, names: Iterable[str]) -> None:
        for table in names:
            if table not in COLLECTIONS:
                raise ValueError(f"Unknown table: {table}")
            self.conn.execute(f"delete from {table}")
        self.conn.commit()


class MongoStorage:
    def __init__(self, uri: str, database_name: str | None = None) -> None:
        self.client = MongoClient(uri, serverSelectionTimeoutMS=10_000)
        self.client.admin.command("ping")
        self.database_name = database_name or os.getenv("MONGO_DB") or self._uri_database_name()
        self.db = self.client[self.database_name]
        self._init_indexes()

    def _uri_database_name(self) -> str:
        try:
            return self.client.get_default_database().name
        except ConfigurationError:
            return "xhs_malaysia_research"

    def _init_indexes(self) -> None:
        self.db.posts.create_index([("post_id", ASCENDING)], unique=True)
        self.db.comments.create_index([("comment_id", ASCENDING)], unique=True)
        self.db.findings.create_index([("finding_id", ASCENDING)], unique=True)
        for name in ("crawl_runs", "search_queries", "crawl_errors"):
            self.db[name].create_index([("id", ASCENDING)], unique=True)
        self.db.comments.create_index([("post_id", ASCENDING)])
        self.db.findings.create_index([("post_id", ASCENDING)])
        self.db.search_queries.create_index([("run_id", ASCENDING)])
        for name in STATE_COLLECTIONS:
            self.db[name].create_index([("record_key", ASCENDING)], unique=True)
        self.db.discovered_posts.create_index([("post_id", ASCENDING)])
        self.db.insurance_findings.create_index([("source_id", ASCENDING)])

    def _next_id(self, collection: str) -> int:
        counter = self.db["_counters"].find_one_and_update(
            {"_id": collection},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return int(counter["seq"])

    def create_run(self, industry: str, config_json: str) -> int:
        run_id = self._next_id("crawl_runs")
        self.db.crawl_runs.insert_one({
            "id": run_id,
            "industry": industry,
            "started_at": datetime.utcnow().isoformat(),
            "ended_at": None,
            "status": "running",
            "config_json": config_json,
        })
        return run_id

    def finish_run(self, run_id: int, status: str) -> None:
        self.db.crawl_runs.update_one(
            {"id": run_id},
            {"$set": {"ended_at": datetime.utcnow().isoformat(), "status": status}},
        )

    def save_search_query(self, run_id: int, keyword: str, sort: str, result_count: int) -> None:
        query_id = self._next_id("search_queries")
        self.db.search_queries.insert_one({
            "id": query_id,
            "run_id": run_id,
            "keyword": keyword,
            "sort": sort,
            "searched_at": datetime.utcnow().isoformat(),
            "result_count": result_count,
        })

    def save_post(self, post: Post) -> None:
        document = post.model_dump(mode="python")
        self.db.posts.replace_one({"post_id": post.post_id}, document, upsert=True)

    def save_comment(self, comment: Comment) -> None:
        document = comment.model_dump(mode="python")
        self.db.comments.replace_one({"comment_id": comment.comment_id}, document, upsert=True)

    def save_findings(self, findings: Iterable[ResearchFinding]) -> None:
        operations = []
        for finding in findings:
            document = finding.model_dump(mode="python")
            finding_id = finding.finding_id or _finding_key(document)
            document["finding_id"] = finding_id
            operations.append(ReplaceOne({"finding_id": finding_id}, document, upsert=True))
        if operations:
            self.db.findings.bulk_write(operations, ordered=False)

    def save_error(
        self,
        run_id: int | None,
        stage: str,
        message: str,
        url: str | None = None,
        keyword: str | None = None,
        error_type: str = "error",
    ) -> None:
        error_id = self._next_id("crawl_errors")
        self.db.crawl_errors.insert_one({
            "id": error_id,
            "run_id": run_id,
            "url": url,
            "keyword": keyword,
            "stage": stage,
            "error_type": error_type,
            "message": message,
            "created_at": datetime.utcnow().isoformat(),
        })

    def export_csvs(self, output_dir: Path = Path("data/normalized")) -> None:
        output_dir.mkdir(parents=True, exist_ok=True)
        for collection in ("posts", "comments", "findings"):
            self.read_frame(collection).to_csv(output_dir / f"{collection}.csv", index=False)

    def read_frame(self, collection: str) -> pd.DataFrame:
        if collection not in COLLECTIONS:
            raise ValueError(f"Unknown collection: {collection}")
        documents = list(self.db[collection].find({}, {"_id": 0}))
        return pd.DataFrame(documents)

    def upsert_state(self, collection: str, record_key: str, document: dict[str, Any]) -> None:
        if collection not in STATE_COLLECTIONS:
            raise ValueError(f"Unknown state collection: {collection}")
        payload = {**document, "record_key": record_key, "updated_at": datetime.utcnow().isoformat()}
        self.db[collection].replace_one({"record_key": record_key}, payload, upsert=True)

    def get_state(self, collection: str, record_key: str) -> dict[str, Any] | None:
        if collection not in STATE_COLLECTIONS:
            raise ValueError(f"Unknown state collection: {collection}")
        return self.db[collection].find_one({"record_key": record_key}, {"_id": 0})

    def clear_collections(self, names: Iterable[str]) -> None:
        for name in names:
            if name not in COLLECTIONS:
                raise ValueError(f"Unknown collection: {name}")
            self.db[name].delete_many({})

    def migrate_from_sqlite(self, sqlite_path: Path) -> dict[str, int]:
        if not sqlite_path.exists():
            raise FileNotFoundError(f"SQLite database not found: {sqlite_path}")
        source = sqlite3.connect(sqlite_path)
        source.row_factory = sqlite3.Row
        migrated: dict[str, int] = {}
        try:
            available = {
                row[0] for row in source.execute(
                    "select name from sqlite_master where type='table'"
                )
            }
            for collection in COLLECTIONS:
                if collection not in available:
                    migrated[collection] = 0
                    continue
                rows = [dict(row) for row in source.execute(f"select * from {collection}")]
                operations = []
                for row in rows:
                    document = _decode_sqlite_document(row)
                    key_name, key_value = _migration_identity(collection, document)
                    document[key_name] = key_value
                    operations.append(ReplaceOne({key_name: key_value}, document, upsert=True))
                if operations:
                    self.db[collection].bulk_write(operations, ordered=False)
                migrated[collection] = len(rows)
                numeric_ids = [row.get("id") for row in rows if isinstance(row.get("id"), int)]
                if numeric_ids:
                    self.db["_counters"].update_one(
                        {"_id": collection},
                        {"$max": {"seq": max(numeric_ids)}},
                        upsert=True,
                    )
        finally:
            source.close()
        return migrated


class Storage:
    """Select MongoDB when configured, with SQLite retained as a local fallback."""

    def __init__(
        self,
        db_path: Path = Path("data/research.sqlite3"),
        mongo_uri: str | None = None,
        mongo_db: str | None = None,
        require_mongo: bool = False,
    ) -> None:
        load_dotenv()
        uri = mongo_uri or os.getenv("MONGO_URI")
        if uri:
            self._backend: MongoStorage | SQLiteStorage = MongoStorage(uri, mongo_db)
            self.backend_name = "mongodb"
        elif require_mongo:
            raise RuntimeError("MONGO_URI is required but was not found in .env or the environment")
        else:
            self._backend = SQLiteStorage(db_path)
            self.backend_name = "sqlite"

    def __getattr__(self, name: str) -> Any:
        return getattr(self._backend, name)


def _finding_key(document: dict[str, Any]) -> str:
    raw = "|".join(str(document.get(key) or "") for key in (
        "source_type", "source_id", "category", "evidence_text",
    ))
    return f"generated:{sha1(raw.encode('utf-8')).hexdigest()[:20]}"


def _migration_identity(collection: str, document: dict[str, Any]) -> tuple[str, Any]:
    if collection in STATE_COLLECTIONS:
        return "record_key", str(document["record_key"])
    if collection == "posts":
        return "post_id", str(document["post_id"])
    if collection == "comments":
        return "comment_id", str(document["comment_id"])
    if collection == "findings":
        finding_id = document.get("finding_id") or f"legacy:{document.get('id')}"
        return "finding_id", str(finding_id)
    return "id", int(document["id"])


def _decode_sqlite_document(document: dict[str, Any]) -> dict[str, Any]:
    decoded = dict(document)
    for key, value in list(decoded.items()):
        if key.endswith("_json") and isinstance(value, str):
            try:
                decoded[key] = json.loads(value)
            except json.JSONDecodeError:
                pass
    return decoded


def _dt(value: datetime | None) -> str | None:
    return value.isoformat() if value else None
