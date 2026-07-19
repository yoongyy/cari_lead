from src.deduplicator import Deduplicator, canonical_url


def test_exact_duplicate_removal() -> None:
    dedupe = Deduplicator()
    assert dedupe.is_duplicate("post-1", "https://xhs.example/post/1?utm_source=a", "same text") is False
    assert dedupe.is_duplicate("post-1", "https://xhs.example/post/1?utm_source=b", "same text") is True


def test_canonical_url_duplicate_removal() -> None:
    assert canonical_url("https://XHS.EXAMPLE/post/1/?utm_source=a&b=2") == "https://xhs.example/post/1?b=2"


def test_near_duplicate_removal() -> None:
    dedupe = Deduplicator(near_duplicate_threshold=88)
    assert dedupe.is_duplicate("a", None, "PropertyGuru 太贵 lead quality 很差 找不到客户") is False
    assert dedupe.is_duplicate("b", None, "PropertyGuru太贵 lead quality 很差 找不到客户!") is True
