"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import type { Theme, TrendDirection } from "@/data/sample-insurance-report";

const trendStyles: Record<TrendDirection, string> = {
  Growing: "bg-amber-50 text-amber-800 border-amber-200",
  Stable: "bg-slate-50 text-slate-700 border-slate-200",
  Shrinking: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

function TrendIcon({ direction }: { direction: TrendDirection }) {
  if (direction === "Growing") return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (direction === "Shrinking") return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

export function DemoLabel() {
  const { language } = useLanguage();
  return (
    <span className="inline-flex rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-800">
      {language === "en" ? "Demo example" : "演示示例"}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="mb-2 text-xs font-bold uppercase text-primary">{eyebrow}</p>
      <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
  );
}

export function TrendBadge({ direction, change }: { direction: TrendDirection; change: string }) {
  const { language } = useLanguage();
  
  const getTransDirection = (dir: TrendDirection) => {
    if (language === "en") return dir;
    if (dir === "Growing") return "上升";
    if (dir === "Shrinking") return "回落";
    return "平稳";
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-bold ${trendStyles[direction]}`}>
      <TrendIcon direction={direction} /> {getTransDirection(direction)} · {change}
    </span>
  );
}

export function TrendChart({ data }: { data: Theme[] }) {
  const { language } = useLanguage();
  const max = Math.max(...data.map((item) => item.mentions));
  
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

  return (
    <div role="img" aria-label="Demo complaint themes by number of mentions" className="space-y-4">
      {data.map((item) => (
        <div key={item.name}>
          <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-slate-700">{translateThemeName(item.name)}</span>
            <span className="shrink-0 text-slate-500">
              {item.mentions} {language === "en" ? "mentions" : "次提及"}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-sm bg-slate-100">
            <div className="h-full rounded-sm bg-teal" style={{ width: `${(item.mentions / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Methodology() {
  const { language } = useLanguage();
  return (
    <div className="flex gap-4 border-l-4 border-teal bg-white p-5 shadow-sm">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
      <div>
        <h3 className="font-bold text-navy">
          {language === "en" ? "Methodology and limits" : "分析方法与局限声明"}
        </h3>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          {language === "en" 
            ? "This sample uses fabricated, anonymized examples to demonstrate report structure. A production report would classify public conversations by topic, intent, product, sentiment, and recency, then retain source links for human verification. Counts are directional signals, not population estimates, financial advice, or guaranteed leads."
            : "此样本使用虚构且匿名化的案例来演示报告的框架结构。实际生产环境中的报告会按照讨论主题、客户意图、对应产品、情绪特征和时间热度对公开对话进行智能归类，并提供源帖子链接供人工核查。统计数据属于宏观趋势信号，不作为市场人口普查、财务规划建议或保证成交的销售线索。"}
        </p>
      </div>
    </div>
  );
}

export function ReportCta() {
  const { language } = useLanguage();
  return (
    <section className="bg-navy py-14 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase text-primary-light">
            {language === "en" ? "Weekly market intelligence" : "每周市场情报"}
          </p>
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            {language === "en" ? "Receive the next Malaysia insurance report." : "订阅下一期马来西亚保险市场透视报告。"}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {language === "en" ? "Choose Insurance on the free report form. No credit card required." : "只需在底部的免费报告申请表单中选择“保险”行业即可。无需提供信用卡。"}
          </p>
        </div>
        <Link href="/#free-report" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark">
          {language === "en" ? "Get Free Weekly Report" : "免费订阅每周报告"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
