"use client";

import { useState } from "react";
import { MapPin, Clock, ArrowUpRight, Bookmark, BookmarkCheck, Radio } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export interface Opportunity {
  id: string;
  quote: string;
  industry: string;
  location: string;
  signal: string;
  time: string;
  confidence: number;
  source: string;
}

interface OpportunityCardProps {
  opp: Opportunity;
  onViewSource: (opp: Opportunity) => void;
}

// Global translator helpers for dynamic content
export function translateSignal(sig: string, lang: string) {
  if (lang === "en") return sig;
  const map: Record<string, string> = {
    "considering switch": "考虑更换/转保",
    "looking for recommendation": "寻找推荐",
    "asking for help": "寻求帮助",
    "comparing options": "对比方案",
    "complaint": "服务投诉",
  };
  return map[sig.toLowerCase()] || sig;
}

export function translateIndustry(ind: string, lang: string) {
  if (lang === "en") return ind;
  const map: Record<string, string> = {
    "insurance": "保险",
    "property": "房产/地产",
    "automotive": "汽车销售",
    "education": "教育培训",
    "renovation": "装修设计",
    "beauty": "美容美体",
  };
  return map[ind.toLowerCase()] || ind;
}

export function translateLocation(loc: string, lang: string) {
  if (lang === "en") return loc;
  const map: Record<string, string> = {
    "selangor": "雪兰莪",
    "kuala lumpur": "吉隆坡",
    "johor": "柔佛",
    "penang": "槟城",
  };
  return map[loc.toLowerCase()] || loc;
}

export function translateTime(time: string, lang: string) {
  if (lang === "en") return time;
  return time
    .replace("Just now", "刚刚")
    .replace("m ago", "分钟前")
    .replace("h ago", "小时前");
}

export function translateSource(source: string, lang: string) {
  if (lang === "en") return source;
  const map: Record<string, string> = {
    "forum thread #391": "论坛帖子 #391",
    "local community group": "本地社区群组",
    "car lovers malaysia": "马来西亚爱车族",
    "parenting forum": "育儿论坛",
    "taman puchong residents fb": "蒲种居民脸书群",
    "beauty review portal": "美容评测门户",
  };
  return map[source.toLowerCase()] || source;
}

export function translateQuote(quote: string, lang: string) {
  if (lang === "en") return quote;
  const map: Record<string, string> = {
    "my medical card premium went up again. thinking of changing. what should i compare first?": 
      "我的医药卡保费又涨了。考虑更换。我应该先对比什么？",
    "any reliable agent for a condo rental around mont kiara?": 
      "Mont Kiara 附近有什么靠谱的公寓出租中介推荐吗？",
    "looking for a family suv below rm120k. cx-5 or something else?": 
      "寻找价格在12万令吉以下的家庭SUV。CX-5还是其他车型？",
    "which tuition centre is good for spm science near pj?": 
      "PJ 附近哪家 SPM 科学补习班比较好？",
    "need a trustworthy contractor for kitchen renovation in puchong.": 
      "蒲种地区需要一个值得信赖的厨房装修承包商。",
    "anyone tried treatment for acne scars in kl? looking for honest recommendations.": 
      "有人在吉隆坡做过痘印痘坑治疗吗？寻找真实的消费推荐。",
  };
  return map[quote.toLowerCase()] || quote;
}

export default function OpportunityCard({ opp, onViewSource }: OpportunityCardProps) {
  const { language } = useLanguage();
  const [isSaved, setIsSaved] = useState(false);

  // Intent styles based on signal type
  const getSignalBadgeStyle = (signal: string) => {
    switch (signal.toLowerCase()) {
      case "considering switch":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "looking for recommendation":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "asking for help":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "comparing options":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "complaint":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group h-[260px]">
      <div>
        {/* Card Header metadata */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSignalBadgeStyle(opp.signal)} uppercase tracking-wider`}>
              {translateSignal(opp.signal, language)}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
              {translateIndustry(opp.industry, language)}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3 h-3" />
            {translateTime(opp.time, language)}
          </span>
        </div>

        {/* Quote Content */}
        <div className="h-[72px] mb-4 overflow-hidden">
          <p className="text-sm font-medium text-navy italic leading-relaxed group-hover:text-primary transition-colors line-clamp-3">
            &ldquo;{translateQuote(opp.quote, language)}&rdquo;
          </p>
        </div>
      </div>

      {/* Card Footer details */}
      <div className="border-t border-slate-100 pt-3 mt-2">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{translateLocation(opp.location, language)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-primary animate-pulse" />
            <span className="font-semibold text-slate-600">
              {language === "en" ? "Confidence" : "可信度"}: {opp.confidence}%
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => onViewSource(opp)}
            className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/30 py-2.5 rounded-xl transition-all active:scale-[0.98]"
          >
            <span>{language === "en" ? "View Source" : "查看公开源"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`px-3 py-2.5 rounded-xl border transition-all flex items-center justify-center active:scale-[0.98] ${
              isSaved
                ? "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"
            }`}
            title={language === "en" ? (isSaved ? "Saved to local storage" : "Save Opportunity") : (isSaved ? "已保存" : "保存意向线索")}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "text-primary fill-primary" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
