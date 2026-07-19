from __future__ import annotations

from dataclasses import dataclass


RESEARCH_QUESTIONS = (
    "acquisition", "portal_cost", "lead_quality", "customer_service", "listing_supply",
    "conversion", "follow_up", "platform_switching", "operational_workflow",
    "reputation_and_trust", "buyer_tenant_pain", "landlord_seller_pain",
    "solution_demand", "all",
)


QUERY_GROUPS: dict[str, list[str]] = {
    "acquisition": [
        "马来西亚 房产中介 没客户", "大马 property agent 没客户", "房产中介 求获客方法",
        "小红书 房产 获客 没效果", "TikTok 获客 房产中介 大马", "Facebook 广告 房产中介 没效果",
        "房产中介 找客户 太难", "REN lead generation Malaysia",
    ],
    "portal_cost": [
        "PropertyGuru 涨价 中介", "PropertyGuru 不值得 马来西亚", "iProperty renew 太贵",
        "Iproperty PropertyGuru rm 一年", "PropertyGuru UC 太贵", "iProperty 取消 renew",
        "PropertyGuru alternative Malaysia", "马来西亚 中介广告平台 费用",
        "PropertyGuru top up UC 马来西亚", "iProperty credits expensive agent",
    ],
    "lead_quality": [
        "马来西亚 中介 lead quality", "房产 lead 不好 大马", "Facebook leads 不小心按到 房产",
        "房产中介 假客户", "property agent low quality lead Malaysia", "房产中介 spam leads",
    ],
    "customer_service": [
        "马来西亚租客 中介 不回复", "租房 agent 不给价格", "买家 中介 不回复 马来西亚",
        "房产中介 服务态度 马来西亚", "tenant agent no response Malaysia", "rude agent 马来西亚租房",
    ],
    "listing_supply": [
        "subsale agent 找不到屋主", "房产中介 找不到屋主", "地产经纪 找房源 大马",
        "property agent cannot find owner Malaysia", "二手房中介 找房源 很难", "no listing property agent Malaysia",
    ],
    "conversion": [
        "房产中介 没成交 大马", "property agent cannot close Malaysia", "房产中介 转化差",
        "客户 ghosted 房产中介", "房产中介 no show viewing", "买家 看房 放飞机 agent",
    ],
    "follow_up": [
        "房产中介 WhatsApp 跟进", "房产中介 WhatsApp 被封号", "地产经纪 follow up 很累",
        "房产中介 slow response lead", "after hours leads property agent", "WhatsApp blast 房产 中介",
    ],
    "platform_switching": [
        "地产中介 换平台", "PropertyGuru 不用了 中介", "iProperty 取消 renew",
        "PropViss PropertyGuru", "PropertyGuru alternative Malaysia", "房产中介 转去 TikTok",
    ],
    "operational_workflow": [
        "房产中介 CRM 马来西亚", "property CRM Malaysia agent", "房产中介 appointment 工具",
        "tenancy agreement agent 马来西亚", "loan application agent follow up", "地产经纪 文件 很麻烦",
    ],
    "reputation_and_trust": [
        "房产假盘 马来西亚", "马来西亚租房 scam agent", "房产中介 被骗 马来西亚",
        "买家 靠谱中介 马来西亚", "trusted property agent Malaysia", "中介 spam 屋主 马来西亚",
    ],
    "buyer_tenant_pain": [
        "马来西亚租客 中介 不回复", "租房 agent 不给价格", "房产假盘 马来西亚",
        "马来西亚 租客 被中介 spam", "tenant hidden price agent Malaysia", "租房 中介 态度 差",
    ],
    "landlord_seller_pain": [
        "马来西亚屋主 中介 spam", "房东 中介 一直whatsapp", "屋主 duplicate agent messages",
        "seller agent commission Malaysia", "屋主 怎么选中介 马来西亚", "landlord agent no update Malaysia",
    ],
    "solution_demand": [
        "房产中介 有什么工具", "房产中介 有没有平台", "property agent software Malaysia",
        "房产中介 愿意付费 工具", "real estate CRM Malaysia", "房产中介 自动跟进 工具",
        "房产中介 lead 自动回复 工具", "马来西亚房产中介 AI 工具",
    ],
}


def queries_for(research_question: str = "all", limit: int | None = None) -> list[str]:
    if research_question == "all":
        queries: list[str] = []
        for values in QUERY_GROUPS.values():
            queries.extend(values)
    else:
        queries = list(QUERY_GROUPS.get(research_question, []))
    seen: set[str] = set()
    deduped = [query for query in queries if not (query in seen or seen.add(query))]
    return deduped[:limit] if limit else deduped


def query_question_map() -> dict[str, str]:
    return {query: group for group, values in QUERY_GROUPS.items() for query in values}
