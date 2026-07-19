from src.complaint_classifier import ComplaintClassifier, extract_price
from src.malaysia_classifier import MalaysiaClassifier


def test_malaysian_city_detection() -> None:
    result = MalaysiaClassifier().classify("吉隆坡 KL 房产 agent")
    assert result.score >= 0.25
    assert any("city_state" in signal for signal in result.signals)


def test_rm_myr_detection() -> None:
    result = MalaysiaClassifier().classify("Property lead package RM 388 per month")
    assert any("local_identifier" in signal for signal in result.signals)


def test_plus_60_detection() -> None:
    result = MalaysiaClassifier().classify("Call +60 12 345 6789 for condo viewing")
    assert result.score >= 0.25


def test_china_only_content_penalty() -> None:
    result = MalaysiaClassifier().classify("上海小区首付比例 人民币 100万")
    assert result.score == 0
    assert any("penalty" in signal for signal in result.signals)


def test_mixed_language_malaysian_content() -> None:
    result = MalaysiaClassifier().classify("大马 agent 找 condo buyer 很难 lah")
    assert result.is_relevant
    assert result.language == "mixed"


def test_explicit_switching_detection() -> None:
    findings = ComplaintClassifier().classify(
        "post", "1", "https://example.com/1", "PropertyGuru 太贵，我已经取消 switched to TikTok 找客户"
    )
    assert any(f.switched for f in findings)
    assert not any(f.considering_switch for f in findings)


def test_considering_switch_detection() -> None:
    findings = ComplaintClassifier().classify(
        "post", "1", None, "PropertyGuru 涨价，想换平台，有 any alternative?"
    )
    assert any(f.considering_switch for f in findings)
    assert not any(f.switched for f in findings)


def test_pricing_extraction() -> None:
    assert extract_price("广告费 RM1,200 一个月") == (1200.0, "RM")
    assert extract_price("平台收费 388 马币") == (388.0, "MYR")
    assert extract_price("Iproperty & PropertyGuru RM17k 一年") == (17000.0, "RM")
    assert extract_price("最高配套 22K 令吉") == (22000.0, "MYR")
