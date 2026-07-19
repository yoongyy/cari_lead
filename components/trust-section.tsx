"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function TrustSection() {
  const { language } = useLanguage();

  const trustPoints = [
    {
      title: language === "en" ? "Public-source conversations only" : "仅限公开来源对话",
      desc: language === "en" 
        ? "We only index publicly accessible discussions. No scraping behind private logins, hidden groups, or password locks."
        : "我们仅检索公开可访问的帖子讨论。绝对不在需要私密登录、隐藏群组或有密码保护的页面进行抓取。",
    },
    {
      title: language === "en" ? "Original source visible" : "原始来源完全可见",
      desc: language === "en"
        ? "Every single opportunity shows the original link. You see exactly where it came from before choosing to engage."
        : "每个业务机会都显示原始帖子链接。您可以先清楚查看它来自哪里，然后再选择参与互动。",
    },
    {
      title: language === "en" ? "No hidden phone harvesting" : "无电话/信息窃取",
      desc: language === "en"
        ? "We do not harvest phone numbers, emails, or personal contact details. You write helpful responses publicly."
        : "我们绝不采集电话号码、邮箱或个人敏感联系方式。我们倡导您在公开区撰写专业解答以获取信任。",
    },
    {
      title: language === "en" ? "No mass automated DMs" : "无批量自动群发",
      desc: language === "en"
        ? "CariLead has no automated message tools. We believe spam ruins sales conversion and harms your professional brand."
        : "CariLead 不提供任何自动私信群发工具。我们深知垃圾信息会降低获客转化并严重损害您的专业形象。",
    },
    {
      title: language === "en" ? "No fake engagement" : "无虚假马甲账号",
      desc: language === "en"
        ? "We do not use bots or synthetic profiles. You reply from your own legitimate business account."
        : "我们绝不使用机器人或虚假的系统头像。您需要通过自己真实合法的工作账号跟帖和回复。",
    },
    {
      title: language === "en" ? "No selling private personal data" : "绝不倒卖敏感隐私数据",
      desc: language === "en"
        ? "We never package or resell private information. Our database contains search references and platform routing only."
        : "我们绝不倒卖或转售任何个人数据。我们的数据库仅存储搜索引擎指引、分类和平台原始网页跳转路径。",
    },
    {
      title: language === "en" ? "Disclosed reply approach" : "提倡表明身份沟通",
      desc: language === "en"
        ? "We encourage users to clearly state who they are and who they work for when posting helpful responses."
        : "我们强烈建议用户在跟帖解答时，表明自己的身份以及自己代理的机构，建立阳光真诚的链接。",
    },
    {
      title: language === "en" ? "Customer choice priority" : "客户选择权为本",
      desc: language === "en"
        ? "Customers choose whether they wish to continue the conversation with you in public comments or private DMs."
        : "客户拥有绝对的主动选择权。他们可以自由选择是在公开评论区继续讨论，还是私信与您联系。",
    },
  ];

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Trust Container Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 md:p-12 max-w-5xl mx-auto overflow-hidden relative">
          {/* Subtle background icons */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 text-slate-100 opacity-20 pointer-events-none z-0">
            <ShieldCheck className="w-80 h-80" />
          </div>

          <div className="relative z-10 grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Trust Title and Accent */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mb-4">
                {language === "en" ? "Built for helpful selling, not spam." : "为顾问式真诚获客而生，拒绝骚扰。"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                {language === "en" 
                  ? "CariLead matches public customer complaints or recommendation requests to help you engage at the right time. We build tools that respects data privacy regulations and platform guidelines."
                  : "CariLead 帮您精准追踪公开的用户吐槽或服务推荐请求，让您在最恰当的时间切入。我们构建的获客辅助工具完全符合数据隐私保护法律及各平台的行为守则。"}
              </p>
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] tracking-wider uppercase bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Lock className="w-3.5 h-3.5" />
                <span>{language === "en" ? "100% Privacy Compliant" : "100% 隐私安全合规"}</span>
              </div>
            </div>

            {/* Trust Bullet Grid */}
            <div className="md:col-span-8 grid sm:grid-cols-2 gap-6">
              {trustPoints.map((point) => (
                <div key={point.title} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-navy mb-1">
                      {point.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                      {point.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
