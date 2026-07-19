"use client";

import Link from "next/link";
import { ArrowRight, Check, FileText, Search, X } from "lucide-react";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { OpportunityBrowser } from "@/components/reports/opportunity-browser";
import { XhsDatabaseExplorer } from "@/components/reports/xhs-database-explorer";
import { DemoLabel, Methodology, ReportCta, SectionHeading, TrendBadge, TrendChart } from "@/components/reports/report-ui";
import { useLanguage } from "@/lib/language-context";
import { comparisonRows, insurerMentions, opportunities, productThemes, reportMeta, themes } from "@/data/sample-insurance-report";

export default function MalaysiaInsuranceReportClient() {
  const { language } = useLanguage();

  const t = {
    en: {
      metaTitle: "Malaysia Insurance Customer Voice Report",
      subtitle: "What people complain about, praise, compare, and consider switching to, translated into practical product and sales opportunities.",
      getWeekly: "Get Free Weekly Report",
      viewSample: "View Sample Opportunities",
      snapshot: "Edition snapshot",
      demoData: "Demo data",
      conversations: "Conversations",
      highIntent: "High intent",
      leadingProduct: "Leading product",
      growingPain: "Growing pain point",
      illustrativeNote: "All figures and examples on this page are illustrative. They are not current market measurements.",
      themeTitle: "Where customer attention is concentrating",
      themeDesc: "Demo themes ranked by illustrative conversation volume and directional change.",
      shareLabel: "share of demo conversations",
      trendTitle: "Conversation themes by volume",
      directionTitle: "Direction matters as much as volume",
      mentionsLabel: "demo mentions",
      insHeading: "What customers mention while evaluating options",
      insDesc: "Brand mentions measure visibility in this demo set, not market share or service quality.",
      insTableCap: "Demo insurer mentions",
      insTh: "Insurer",
      mentionsTh: "Mentions",
      posTh: "Positive",
      neuTh: "Neutral",
      negTh: "Negative",
      prodTitle: "Demo product demand themes",
      oppTitle: "Eight public-conversation examples",
      oppDesc: "Open any example to see the fact boundary, suggested response, and engagement guardrails.",
      freePaidTitle: "Start with the report, then monitor the feed",
      responsibleTitle: "Signal first, human verification always",
      sourcePlaceholder: "Source links are intentionally placeholders in this fabricated sample. A live report would link only to eligible public posts and preserve platform context.",
      chooseIns: "Choose Insurance in the free report form",
      capabilityTh: "Capability",
      freeTh: "Free report",
      paidTh: "Paid monitoring",
      growing: "Growing",
      stable: "Stable",
      shrinking: "Shrinking",
    },
    zh: {
      metaTitle: "马来西亚保险市场客户声音透视报告",
      subtitle: "归纳总结马来西亚用户的公开吐槽、评价、方案对比与转保意愿，并转化为切实可行的产品与销售获客机遇。",
      getWeekly: "免费订阅每周报告",
      viewSample: "查看样本意向线索",
      snapshot: "本期报告快照概览",
      demoData: "演示数据",
      conversations: "分析的对话数",
      highIntent: "高意向线索",
      leadingProduct: "核心聚焦险种",
      growingPain: "最受关注痛点",
      illustrativeNote: "本页面上的所有数据和案例仅用于功能演示。它们不代表当前真实的实时市场统计结果。",
      themeTitle: "用户关注度与舆论集中点",
      themeDesc: "按演示对话量和变化趋势排序的典型讨论主题。",
      shareLabel: "占演示对话总量的比例",
      trendTitle: "按提及热度排序的讨论主题",
      directionTitle: "趋势走向与总量同样关键",
      mentionsLabel: "次演示提及",
      insHeading: "用户在评估保险选项时常提及的内容",
      insDesc: "品牌提及量仅衡量在此演示数据集中的曝光度，不代表市场份额或服务质量评价。",
      insTableCap: "保险品牌提及量统计",
      insTh: "保险品牌",
      mentionsTh: "提及频次",
      posTh: "正面反馈",
      neuTh: "中立评论",
      negTh: "负面吐槽",
      prodTitle: "险种细分需求热度",
      oppTitle: "8 个公开对话线索卡片示例",
      oppDesc: "点击任意卡片可以查看已知事实界限、建议回复话术以及跟帖互动合规守则。",
      freePaidTitle: "从阅读周报开始，逐步迈向实时线索监控",
      responsibleTitle: "线索指引方向，人工核实细节",
      sourcePlaceholder: "在此虚拟演示样本中，源帖子链接均为占位路径。实际报告中将精准跳转至公开帖子原文以保留上下文语境。",
      chooseIns: "在免费报告申请表单中选择“保险”",
      capabilityTh: "服务功能对比",
      freeTh: "免费周报",
      paidTh: "付费实时监测",
      growing: "上升中",
      stable: "稳定",
      shrinking: "回落中",
    }
  }[language];

  // Helper translations
  const translateCategory = (cat: string) => {
    if (language === "en") return cat;
    const map: Record<string, string> = {
      "Medical card": "医疗险/医药卡",
      "Policy review": "保单检视",
      "Claims support": "理赔协助",
      "Family protection": "家庭保障",
      "Agent service": "代理人服务售后",
      "Takaful": "Takaful 互助险",
      "Critical illness": "重大疾病险",
      "Motor insurance": "汽车保险",
    };
    return map[cat] || cat;
  };

  const translateThemeName = (name: string) => {
    if (language === "en") return name;
    const map: Record<string, string> = {
      "Premium increases": "保费调价上涨",
      "Medical card limits": "医药卡保额上限",
      "Claims clarity": "理赔透明清晰度",
      "Agent responsiveness": "代理人售后服务响应",
      "Family protection": "家庭综合保障需求",
      "Policy cancellation": "退保/换保单风险",
    };
    return map[name] || name;
  };

  const translateThemeSummary = (name: string, fallback: string) => {
    if (language === "en") return fallback;
    const map: Record<string, string> = {
      "Premium increases": "用户质疑保费的连年调整，在线咨询应缩减保障利益还是对比其他产品方案。",
      "Medical card limits": "讨论主要集中在年限额是否足够、病房费标准、免赔额及共同分摊比例等。",
      "Claims clarity": "客户希望获得更清晰的索赔申报材料指引、赔付时效以及部分拒赔的合理解释。",
      "Agent responsiveness": "对代理人失联或售后响应迟缓的吐槽，尽管在演示期内其占比有所回落。",
      "Family protection": "年轻家庭正在寻求简单明了的保障方案横向比对，需要契合固定的月度预算。",
      "Policy cancellation": "用户打听保单现金价值、退保等待期影响以及直接换新保单的潜在风险。",
    };
    return map[name] || fallback;
  };

  const translateProductSignal = (sig: string) => {
    if (language === "en") return sig;
    const map: Record<string, string> = {
      "Comparisons and limit questions": "方案对比与保额限额疑问",
      "Affordability and family needs": "支付能力与家庭保障需要",
      "Coverage scope questions": "保障责任范围相关咨询",
      "Renewal price comparisons": "续保费率对比与省钱攻略",
      "Shariah-compliant alternatives": "符合伊斯兰教法的保障方案",
    };
    return map[sig] || sig;
  };

  const translateFeature = (feat: string) => {
    if (language === "en") return feat;
    const map: Record<string, string> = {
      "Weekly customer-voice summary": "每周客户声音透视总结",
      "Top complaints and product themes": "热门吐槽话题与主流产品板块",
      "Curated opportunity previews": "精心归纳的业务线索卡片预览",
      "Intent and confidence scoring": "意图强度与可信度评分",
      "Suggested response guidance": "专业的回复指引建议",
      "Saved searches and team workflow": "保存检索方案及团队协作指派",
    };
    return map[feat] || feat;
  };

  const translateTableValue = (val: any) => {
    if (typeof val === "boolean") {
      return val ? <Check className="h-4 w-4 text-primary" aria-label="Included" /> : <X className="h-4 w-4 text-slate-300" aria-label="Not included" />;
    }
    if (val === "3 examples") return language === "en" ? "3 examples" : "3 个示例";
    if (val === "Full monitored feed") return language === "en" ? "Full monitored feed" : "全线索实时监测流";
    return val;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-20">
        <section className="border-b border-slate-200 bg-white py-12 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <DemoLabel />
                <span className="text-xs font-semibold text-slate-500">
                  {language === "en" ? reportMeta.period : "近 7 天演示统计数据"}
                </span>
              </div>
              <p className="mb-2 text-xs font-bold uppercase text-primary">CariLead sample report</p>
              <h1 className="text-4xl font-extrabold leading-tight text-navy sm:text-5xl">
                {t.metaTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                {t.subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/#free-report" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark">
                  {t.getWeekly} <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#sample-opportunities" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-navy hover:border-primary hover:text-primary">
                  <Search className="h-4 w-4" /> {t.viewSample}
                </a>
              </div>
            </div>
            <div className="border border-slate-200 bg-slate-50 p-6 rounded-lg">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-navy">{t.snapshot}</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-700">{t.demoData}</span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-5">
                <div>
                  <dt className="text-[11px] text-slate-500">{t.conversations}</dt>
                  <dd className="mt-1 text-2xl font-extrabold text-navy">{reportMeta.conversations}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">{t.highIntent}</dt>
                  <dd className="mt-1 text-2xl font-extrabold text-navy">{reportMeta.highIntent}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">{t.leadingProduct}</dt>
                  <dd className="mt-1 text-sm font-bold text-navy">{translateCategory(reportMeta.leadingProduct)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">{t.growingPain}</dt>
                  <dd className="mt-1 text-sm font-bold text-navy">
                    {language === "en" ? reportMeta.fastestGrowing : "保费大幅上涨"}
                  </dd>
                </div>
              </dl>
              <p className="mt-6 border-t border-slate-200 pt-4 text-[11px] leading-5 text-slate-500">
                {t.illustrativeNote}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading 
              eyebrow={language === "en" ? "Executive themes" : "宏观讨论版块"} 
              title={t.themeTitle} 
              description={t.themeDesc} 
            />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {themes.slice(0, 3).map((theme) => (
                <article key={theme.name} className="border border-slate-200 bg-white p-5 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-navy">{translateThemeName(theme.name)}</h3>
                    <TrendBadge direction={theme.direction} change={theme.change} />
                  </div>
                  <p className="mt-4 text-3xl font-extrabold text-navy">{theme.share}%</p>
                  <p className="mt-1 text-[11px] text-slate-500">{t.shareLabel}</p>
                  <p className="mt-4 text-xs leading-5 text-slate-600">{translateThemeSummary(theme.name, theme.summary)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <SectionHeading 
                eyebrow={language === "en" ? "Complaint trend" : "吐槽吐槽趋势图"} 
                title={t.trendTitle} 
              />
              <TrendChart data={themes} />
            </div>
            <div>
              <SectionHeading 
                eyebrow={language === "en" ? "Growing vs shrinking" : "上升与回落趋势对比"} 
                title={t.directionTitle} 
              />
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {themes.map((theme) => (
                  <div key={theme.name} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-navy">{translateThemeName(theme.name)}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {theme.mentions} {t.mentionsLabel}
                      </p>
                    </div>
                    <TrendBadge direction={theme.direction} change={theme.change} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading 
              eyebrow={language === "en" ? "Insurer and product themes" : "品牌与险种提及量分析"} 
              title={t.insHeading} 
              description={t.insDesc} 
            />
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="min-w-0 overflow-x-auto border border-slate-200 bg-white rounded-lg">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <caption className="border-b border-slate-200 p-4 text-left text-sm font-bold text-navy">
                    {t.insTableCap}
                  </caption>
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-3">{t.insTh}</th>
                      <th className="p-3">{t.mentionsTh}</th>
                      <th className="p-3">{t.posTh}</th>
                      <th className="p-3">{t.neuTh}</th>
                      <th className="p-3">{t.negTh}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {insurerMentions.map((item) => (
                      <tr key={item.name}>
                        <th className="p-3 font-bold text-navy">{item.name}</th>
                        <td className="p-3">{item.mentions}</td>
                        <td className="p-3 text-emerald-700">{item.positive}</td>
                        <td className="p-3 text-slate-500">{item.neutral}</td>
                        <td className="p-3 text-rose-700">{item.negative}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border border-slate-200 bg-white p-5 rounded-lg">
                <h3 className="text-sm font-bold text-navy">{t.prodTitle}</h3>
                <div className="mt-4 divide-y divide-slate-100">
                  {productThemes.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-5 py-3">
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          {translateCategory(item.name)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {translateProductSignal(item.signal)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-teal">{item.mentions}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="sample-opportunities" className="border-y border-slate-200 bg-white py-16 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading 
              eyebrow={language === "en" ? "Opportunity feed" : "意向线索示例"} 
              title={t.oppTitle} 
              description={t.oppDesc} 
            />
            <OpportunityBrowser opportunities={opportunities} />
          </div>
        </section>

        {/* Real captured XHS Database Explorer */}
        <section className="py-16 bg-[#F8FAFC]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading 
              eyebrow={language === "en" ? "Database Explorer" : "数据库流览器"} 
              title={language === "en" ? "Captured XHS posts and comments details" : "捕获的小红书帖子与评论细节"} 
              description={language === "en" ? "Real-time capture stream showing posts, comments, and location signals sourced from XHS." : "从外部小红书来源抓取并分析的实时对话帖子、评论以及定位归属。"} 
            />
            <XhsDatabaseExplorer />
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
            <div className="min-w-0">
              <SectionHeading 
                eyebrow={language === "en" ? "Free vs paid" : "免费版对比付费版"} 
                title={t.freePaidTitle} 
              />
              <div className="overflow-x-auto border border-slate-200 bg-white rounded-lg">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 text-navy">{t.capabilityTh}</th>
                      <th className="p-4 text-navy">{t.freeTh}</th>
                      <th className="p-4 text-navy">{t.paidTh}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comparisonRows.map((row) => (
                      <tr key={row.feature}>
                        <th className="p-4 font-semibold text-slate-700">{translateFeature(row.feature)}</th>
                        {[row.free, row.paid].map((value, index) => (
                          <td key={index} className="p-4">
                            {translateTableValue(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="min-w-0">
              <SectionHeading 
                eyebrow={language === "en" ? "Responsible use" : "合规与方法论"} 
                title={t.responsibleTitle} 
              />
              <Methodology />
              <p id="demo-source" className="mt-5 text-xs leading-5 text-slate-500">
                {t.sourcePlaceholder}
              </p>
              <Link href="/#free-report" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                {t.chooseIns} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        <ReportCta />
      </main>
      <Footer />
    </>
  );
}
