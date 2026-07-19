"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function ComparisonTable() {
  const { language } = useLanguage();

  const comparisonData = [
    {
      feature: language === "en" ? "Source context" : "线索背景",
      traditional: language === "en" ? "Usually missing (just a phone number or email)" : "通常缺失 (仅有电话或邮箱)",
      traditionalGood: false,
      cariLead: language === "en" ? "See the original public conversation & comments" : "查看原始公开对话及相关评论",
      cariLeadGood: true,
    },
    {
      feature: language === "en" ? "Customer need" : "客户诉求",
      traditional: language === "en" ? "Unknown (you don't know what they want to buy)" : "未知 (你不知道对方具体想购买什么)",
      traditionalGood: false,
      cariLead: language === "en" ? "Understand exactly what they are asking for" : "精准获知用户关注的痛点与需求",
      cariLeadGood: true,
    },
    {
      feature: language === "en" ? "Timing" : "时效性",
      traditional: language === "en" ? "Often old (compiled weeks or months ago)" : "通常滞后 (数周或数月前的陈旧名单)",
      traditionalGood: false,
      cariLead: language === "en" ? "Recent opportunities and real-time alerts" : "最新意向机会与实时线索提醒",
      cariLeadGood: true,
    },
    {
      feature: language === "en" ? "Personal data" : "隐私合规",
      traditional: language === "en" ? "Contact databases (often scraped illegally)" : "信息数据库 (多为非法采集或电话轰炸)",
      traditionalGood: false,
      cariLead: language === "en" ? "Public-source links only (100% privacy-compliant)" : "仅提供公开可访问链接 (100%合规隐私)",
      cariLeadGood: true,
    },
    {
      feature: language === "en" ? "Approach" : "触达手段",
      traditional: language === "en" ? "Cold outreach (high rejection, spam reports)" : "冷推销 (拒接率极高，易被拉黑)",
      traditionalGood: false,
      cariLead: language === "en" ? "Helpful, context-aware transparent engagement" : "真诚服务、基于痛点切入的透明互动",
      cariLeadGood: true,
    },
    {
      feature: language === "en" ? "Trust" : "信任构建",
      traditional: language === "en" ? "Easy to feel spammy (calling a stranger)" : "容易产生骚扰感 (突兀致电陌生人)",
      traditionalGood: false,
      cariLead: language === "en" ? "Start from a real public question they asked" : "从解决对方主动公开提出的疑问开始",
      cariLeadGood: true,
    },
  ];

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-teal-600 uppercase tracking-wider mb-2">
            {language === "en" ? "Why We Are Different" : "为什么我们与众不同"}
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            {language === "en" ? "Not another lead database." : "并非普通的低意向电话销售名单。"}
          </h3>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden max-w-4xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[20%]">
                    {language === "en" ? "Comparison" : "对比维度"}
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[40%]">
                    {language === "en" ? "Traditional Lead List" : "传统电话销售名单"}
                  </th>
                  <th className="p-5 text-xs font-bold text-primary-dark uppercase tracking-widest w-[40%] bg-primary/5">
                    CariLead
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonData.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    {/* Feature Title */}
                    <td className="p-5 text-xs font-bold text-navy">
                      {row.feature}
                    </td>
                    
                    {/* Traditional Description */}
                    <td className="p-5 text-xs text-slate-500">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    
                    {/* CariLead Description */}
                    <td className="p-5 text-xs text-navy font-semibold bg-primary/5 border-x border-primary/10">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{row.cariLead}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
