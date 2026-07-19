"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MapPin, MessageSquareText, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import type { DemoOpportunity } from "@/data/sample-insurance-report";
import { DemoLabel } from "@/components/reports/report-ui";

const intentStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-800 border-amber-200",
  Low: "bg-slate-50 text-slate-700 border-slate-200",
};

function translateOpportunity(opp: DemoOpportunity, lang: string): DemoOpportunity {
  if (lang === "en") return opp;
  
  const translations: Record<string, Partial<DemoOpportunity>> = {
    "medical-card-budget": {
      title: "寻找每月 RM250 以下的医药卡",
      excerpt: "一位年轻的父母正在对比方案，想听关于年限额和住院病房保障的清晰讲解。",
      category: "医疗险/医药卡",
      location: "雪兰莪",
      signal: "预算 + 对比需求",
      knownFacts: ["每月预算在 RM250 以下", "希望对比医药卡方案", "询问年限额和病房额度"],
      unknownFacts: ["年龄与核保状况", "现有的保障情况", "是否有特定的保险公司偏好或 Takaful 需求"],
      suggestedResponse: "提供简短、中立的对比框架，包括年限额、住院病房费率、共同保险比例、等待期和免责条款。在转入私下沟通详细个人情况之前，请先征得用户同意。",
      warnings: ["切勿口头承诺核保通过或理赔结果", "切勿在公开回复中索要其病史或医疗细节"]
    },
    "premium-jump": {
      title: "今年续保保费大幅度上涨",
      excerpt: "发帖者想了解保费重新定价是否正常，以及可以在不失去核心保障的前提下做出哪些调整。",
      category: "保单检视",
      location: "吉隆坡",
      signal: "转保风险 + 价格痛点",
      knownFacts: ["续保成本大幅上涨", "客户正在考虑替代方案", "希望保留核心基本保障"],
      unknownFacts: ["保单类型与附加险结构", "上涨的具体金额", "现有的福利与免责条款"],
      suggestedResponse: "解释保费重新定价可能由多种因素引起，并提议根据其保单文件，对比诸如病房费率、自付额或附加险结构的调整路径。",
      warnings: ["在新保单生效之前，切勿建议用户直接取消原有保单", "强调实际调整方案完全取决于具体的保单条款规定"]
    },
    "claim-documents": {
      title: "不确定理赔需要提交哪些文件",
      excerpt: "客户在收到不同渠道的冲突指令后，在线寻求一份实用的理赔文件清单。",
      category: "理赔协助",
      location: "槟城",
      signal: "服务修复契机",
      knownFacts: ["理赔流程已经启动", "之前收到的指引不够清晰", "客户希望获得一份清晰的文件核对清单"],
      unknownFacts: ["理赔的类别 (如住院、伤残或重疾)", "所投保保险公司的具体规定", "理赔提交的截止期限"],
      suggestedResponse: "分享通用的理赔清单，并引导客户查阅保险公司的官方理赔指南。提供对清单 of 解释帮助，但不要公开索要任何理赔材料文件。",
      warnings: ["绝不能在公开区域要求用户提供身份证件或病历等隐私文件", "请务必以该保险公司当前的官方最新规定为准"]
    },
    "newborn-cover": {
      title: "对比新生儿的保险保障方案",
      excerpt: "新手父母希望能通俗易懂地了解新生儿在医疗和人寿保障方面的优先级。",
      category: "家庭保障",
      location: "柔佛",
      signal: "人生阶段变化 + 主动研究",
      knownFacts: ["新生儿保障是当前首要焦点", "父母正在积极对比各种选择", "需要通俗易懂的非专业语言指引"],
      unknownFacts: ["每月的保费预算", "父母目前的保障覆盖情况", "新生儿的健康状况与承保资格"],
      suggestedResponse: "提供科普性的解答顺序：先看紧急医疗需求、再看父母自身保障、评估支付能力以及条款细则。引导他们在对比具体产品前，先明确家庭预算区间。",
      warnings: ["切勿使用制造焦虑或强推促单的手段", "清晰解释等待期以及核保的具体流程与风险"]
    },
    "agent-unresponsive": {
      title: "现有的代理人不再回复消息",
      excerpt: "保单持有人急需售后协助，在线咨询如何更换保单的服务代理人。",
      category: "代理人服务",
      location: "霹雳",
      signal: "服务商转移信号",
      knownFacts: ["现有的保单急需售后服务", "现有的服务代理人处于失联状态", "客户咨询如何重新指派服务经纪"],
      unknownFacts: ["承保的保险公司", "具体的售后服务诉求", "该失联代理人目前是否仍在职"],
      suggestedResponse: "指引其联系保险公司的官方客服渠道，并解释各家公司重新分配代理人的流程有所差异。提供客观的指导，避免在公开场合贬低或批评原代理人。",
      warnings: ["切勿公开索要其私密的保单号或个人隐私信息", "避免对其他代理人发表任何未经证实的主观评价"]
    },
    "takaful-comparison": {
      title: "寻找保障利益相近的 Takaful 替代方案",
      excerpt: "买家希望在基本相同的预算下，对比伊斯兰教法合规的 Takaful 方案与传统保险计划。",
      category: "Takaful 互助保险",
      location: "森美兰",
      signal: "替代产品方案咨询",
      knownFacts: ["偏好 Takaful（互助保险）选项", "有固定的对比预算上限", "希望获得同等力度的保障利益"],
      unknownFacts: ["目前的投保方案", "最在意的保障重点", "计划的缴费期或保障年限"],
      suggestedResponse: "客观对比利益定义、贡献金/保费结构、免责条款以及持续性，而不是将 conventional 保险与 Takaful 宣传为完全相同的等价物。",
      warnings: ["切勿暗示两者提供完全相同的保障范围", "必须使用各家产品最新的公开披露说明书进行比对"]
    },
    "critical-illness-gap": {
      title: "医药卡是否包含收入损失补偿？",
      excerpt: "一名上班族正在弄清用于报销医院账单的医药卡与给付现金的重疾险之间的核心区别。",
      category: "重大疾病险",
      location: "沙巴",
      signal: "保障缺口科普",
      knownFacts: ["已拥有或正在考虑配置医疗卡", "担忧因病导致工作收入中断", "需要弄清保险险种之间的分类区别"],
      unknownFacts: ["现有的紧急备用金储备", "雇主提供的那部分医疗福利", "目前是否已配置了人寿或重疾险"],
      suggestedResponse: "通俗解释报销型医疗险 (医药卡) 与一次性给付型重疾险 (重疾给付) 的区别，然后建议对方进行全面的需求与预算检视。",
      warnings: ["在未进行详细财务检视前，切勿对其保额是否充足发表定性结论", "切勿将某些非保证的利益描述为确定保额给付"]
    },
    "motor-renewal": {
      title: "无出险理赔记录但车险续保报价反而变高",
      excerpt: "车主正在对比各家续保渠道，在线咨询影响保费定价的核心因素有哪些。",
      category: "汽车保险",
      location: "马六甲",
      signal: "价格比对",
      knownFacts: ["近期无出险理赔申报记录", "续保报价不降反升", "客户正在货比三家"],
      unknownFacts: ["车型、车龄及保额估值", "选择的附加保障条款 (如挡风玻璃、天灾险)", "无索赔折扣 (NCD) 的实际累积比例"],
      suggestedResponse: "列出常见的保费定价变量，建议在同等保额估值、相同附加险、自负额及救援服务的基础上进行对等对比。",
      warnings: ["在拿到对方完整的续保报价拆解明细前，不要凭空臆测涨价原因", "请提示用户通过正规持牌的官方渠道核实具体车险细节"]
    }
  };

  const tr = translations[opp.id];
  if (!tr) return opp;

  const posted = opp.posted
    .replace("hours ago", "小时前")
    .replace("Yesterday", "昨天")
    .replace("days ago", "天前");

  return {
    ...opp,
    ...tr,
    posted
  };
}

export function OpportunityCard({ opportunity, compact = false, onOpen }: { opportunity: DemoOpportunity; compact?: boolean; onOpen?: () => void }) {
  const { language } = useLanguage();
  const opp = translateOpportunity(opportunity, language);
  
  const getTransIntent = (intent: string) => {
    if (language === "en") return `${intent} intent`;
    if (intent === "High") return "高意向";
    if (intent === "Medium") return "中意向";
    return "低意向";
  };

  return (
    <article className="flex h-full flex-col border border-slate-200 bg-white p-5 shadow-sm rounded-lg">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <DemoLabel />
        <span className={`rounded border px-2 py-1 text-[10px] font-bold uppercase ${intentStyles[opp.intent]}`}>
          {getTransIntent(opp.intent)}
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          {opp.confidence}% {language === "en" ? "confidence" : "可信度"}
        </span>
      </div>
      <h3 className="text-base font-bold leading-6 text-navy">{opp.title}</h3>
      <p className={`mt-2 text-xs leading-5 text-slate-600 ${compact ? "line-clamp-2" : ""}`}>{opp.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{opp.location}</span>
        <span>{opp.category}</span>
        <span>{opp.posted}</span>
      </div>
      <div className="mt-auto pt-5">
        <button type="button" onClick={onOpen} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark">
          <MessageSquareText className="h-4 w-4" /> {language === "en" ? "View response guidance" : "查看回复建议"}
        </button>
      </div>
    </article>
  );
}

function OpportunityModal({ opportunity, onClose }: { opportunity: DemoOpportunity; onClose: () => void }) {
  const { language } = useLanguage();
  const opp = translateOpportunity(opportunity, language);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy/60 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="opportunity-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-lg bg-white shadow-2xl sm:rounded-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <DemoLabel />
          <button type="button" onClick={onClose} aria-label="Close opportunity details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 sm:p-7">
          <p className="text-xs font-bold uppercase text-primary">{opp.signal}</p>
          <h2 id="opportunity-title" className="mt-2 text-xl font-extrabold text-navy sm:text-2xl">{opp.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{opp.excerpt}</p>
          <div className="mt-7 grid gap-7 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold text-navy">
                {language === "en" ? "Known from the public post" : "从公开贴中获知的事实"}
              </h3>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">{opp.knownFacts.map((fact) => <li key={fact}>• {fact}</li>)}</ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy">
                {language === "en" ? "Needs verification" : "有待进一步核实细节"}
              </h3>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">{opp.unknownFacts.map((fact) => <li key={fact}>• {fact}</li>)}</ul>
            </div>
          </div>
          <div className="mt-7 border-l-4 border-primary bg-emerald-50 p-4">
            <h3 className="text-sm font-bold text-navy">
              {language === "en" ? "Suggested helpful response" : "建议的专业回复方案"}
            </h3>
            <p className="mt-2 text-xs leading-5 text-slate-700">{opp.suggestedResponse}</p>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-bold text-navy">
              {language === "en" ? "Response guardrails" : "跟帖互动合规守则"}
            </h3>
            <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600">{opp.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul>
          </div>
          <a href="#demo-source" onClick={onClose} className="mt-7 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            {language === "en" ? "Source link placeholder" : "原始链接占位符"} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function OpportunityBrowser({ opportunities, compact = false }: { opportunities: DemoOpportunity[]; compact?: boolean }) {
  const [selected, setSelected] = useState<DemoOpportunity | null>(null);
  return (
    <>
      <div className={`grid gap-5 ${compact ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} compact={compact} onOpen={() => setSelected(opportunity)} />)}
      </div>
      {selected ? <OpportunityModal opportunity={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}
