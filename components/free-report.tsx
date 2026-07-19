"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ChevronRight, FileText, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { translateIndustry } from "./opportunity-card";

export default function FreeReport() {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("Insurance");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple validation
    if (!email) {
      setError(language === "en" ? "Please enter your email address." : "请输入您的邮箱地址。");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(language === "en" ? "Please enter a valid email address." : "请输入有效的邮箱地址。");
      return;
    }

    try {
      const response = await fetch("/api/free-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, industry }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || (language === "en" ? "Failed to submit report request." : "报告请求提交失败。"));
      }

      // TODO: Replace the localStorage fallback when the subscription API is finalized.
      const reportSignup = {
        email,
        industry,
        signupType: "free_weekly_report",
        submittedAt: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem("carilead_report_signup_" + Date.now(), JSON.stringify(reportSignup));
      } catch (storageErr) {
        console.warn("Could not save to localStorage:", storageErr);
      }

      setIsSubmitted(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || (language === "en" ? "Something went wrong. Please try again." : "出错了，请稍后重试。"));
    }
  };

  const industries = ["Insurance", "Property", "Automotive", "Education", "Renovation", "Beauty", "Professional Services"];

  return (
    <section id="free-report" className="py-20 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Form & Copy */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-6 border border-teal-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "en" ? "Get weekly market intelligence" : "获取每周最新市场情报"}</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight mb-4">
              {language === "en" ? "Start with the free weekly industry report." : "先从订阅免费的行业周报开始。"}
            </h3>
            <p className="text-slate-600 text-base mb-8 leading-relaxed">
              {industry === "Insurance" ? (
                language === "en" 
                  ? "Receive a weekly summary of Malaysian insurance complaints, questions, comparisons, switching signals, and public purchase requests."
                  : "每周接收马来西亚保险用户的吐槽投诉、热门提问、横向对比、转保意向以及公开意向需求的总结报告。"
              ) : (
                language === "en"
                  ? "See what Malaysian customers are complaining about, asking for, comparing, and switching away from. Understand the demand volume before subscribing."
                  : "深入了解马来西亚客户的吐槽点、真实诉求、方案对比以及转向何方。在订阅服务前清晰洞察市场真实的需求体量。"
              )}
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary-dark">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <span className="font-bold text-base">{language === "en" ? "Report request received" : "报告申请已接收"}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {language === "en" 
                    ? "You're on the list. We'll send your selected industry report when the next edition is ready."
                    : "您已成功加入发送名单！下一期所选行业的报告编制完成后，我们会立即发送至您的工作邮箱。"}
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-semibold text-primary hover:underline text-left self-start mt-2"
                >
                  {language === "en" ? "Sign up another email" : "注册另一个邮箱"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Industry Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {language === "en" ? "Choose Your Industry" : "选择您的行业"}
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 text-navy font-semibold rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>
                          {translateIndustry(ind, language)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {language === "en" ? "Work Email" : "工作邮箱"}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@agency.com"
                        className="w-full text-sm bg-slate-50 border border-slate-200 text-navy rounded-xl p-3 pl-10 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs font-bold text-red-500">{error}</p>}

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <span>
                    {language === "en" 
                      ? `Get the Free ${translateIndustry(industry, language)} Report` 
                      : `免费获取${translateIndustry(industry, language)}行业报告`}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs text-slate-400 font-medium pt-1">
                  <span>{language === "en" ? "No credit card required." : "无需绑定信用卡。"}</span>
                  <span>•</span>
                  <span>{language === "en" ? "Unsubscribe anytime." : "可随时退订。"}</span>
                </div>
              </form>
            )}
          </div>

          {/* Report Preview Box */}
          <div className="lg:col-span-6">
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 shadow-lg p-6 max-w-md mx-auto relative">
              
              {/* Floating report icon tag */}
              <div className="absolute -top-5 -right-4 bg-primary text-white p-3 rounded-2xl shadow-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200/55 pb-3">
                <span>{language === "en" ? "PDF REPORT PREVIEW" : "PDF 报告预览"}</span>
              </div>

              <h4 className="text-lg font-bold text-navy mb-2">
                {language === "en" 
                  ? `Malaysia ${industry} Customer Voice Report` 
                  : `马来西亚${translateIndustry(industry, language)}客户声音透视报告`}
              </h4>
              <p className="text-xs text-slate-500 mb-6 font-semibold">
                {language === "en" ? "Updated weekly (Data compiled up to 2026-07-19)" : "每周更新 (数据整理截至 2026-07-19)"}
              </p>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {language === "en" ? "Inside this week's issue:" : "本周报告核心要点:"}
                </p>
                
                <ul className="space-y-2.5">
                  {[
                    language === "en" ? "Top customer complaints from public boards" : "公开社群及评测平台中真实的用户吐槽",
                    language === "en" ? `Most-requested ${industry.toLowerCase()} advice questions` : `与${translateIndustry(industry, language)}相关的核心咨询与问答`,
                    language === "en" ? "Premium or contract cost discussions & budgets" : "保费或合同费用谈判、定价讨论与预算区间",
                    language === "en" ? "Switching signals (people asking for alternatives)" : "明确的转保/更换服务意向（对比竞品替代方案）",
                    language === "en" ? "New purchase questions and brand queries" : "新购咨询、承保条件及对各大品牌的评价",
                    language === "en" ? "Trending competitors, products, and packages" : "热门竞品、产品组合及保障内容的市场反馈",
                  ].map((item, index) => (
                    <li key={index} className="flex gap-2 items-start text-xs text-slate-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-200 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>{language === "en" ? "Format: PDF / Email digest" : "报告格式: PDF / 邮件摘要预览"}</span>
                  <span>{language === "en" ? "Pages: ~12 pages" : "报告页数: 约 12 页"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
