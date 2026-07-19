"use client";

import { motion } from "framer-motion";
import { Search, Radio, Eye, Send, Info } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function HowItWorks() {
  const { language } = useLanguage();

  const steps = [
    {
      number: "01",
      icon: <Search className="w-5 h-5 text-primary" />,
      title: language === "en" ? "CariLead scans public conversations" : "实时扫描公开对话",
      description: language === "en" 
        ? "We monitor relevant public discussions, questions, complaints, and recommendation requests across supported online platforms."
        : "我们对主流公开平台上的相关提问、投诉以及需求推荐请求进行实时智能检索。",
    },
    {
      number: "02",
      icon: <Radio className="w-5 h-5 text-primary" />,
      title: language === "en" ? "We detect useful signals" : "精准提取意向信号",
      description: language === "en"
        ? "CariLead identifies people who may be looking for help, alternatives, or professional advice, filtering out spam or noise."
        : "CariLead 自动识别正在寻求帮助、对比方案或需要专业意见的真实用户，过滤无用噪音。",
    },
    {
      number: "03",
      icon: <Eye className="w-5 h-5 text-primary" />,
      title: language === "en" ? "You see the source and context" : "查看原始语境背景",
      description: language === "en"
        ? "Understand exactly what the person said, when they said it, where they are, and why the conversation is a sales opportunity."
        : "深入了解用户的真实表达、发布时间、所在城市以及为什么这会是一个潜在的机会。",
    },
    {
      number: "04",
      icon: <Send className="w-5 h-5 text-primary" />,
      title: language === "en" ? "Respond helpfully" : "进行专业真诚解答",
      description: language === "en"
        ? "Join the public conversation professionally and let the customer choose whether to continue the conversation privately."
        : "在公开对话下以专业身份解答疑问，建立信任，让客户自主决定是否进一步沟通。",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-primary uppercase tracking-wider mb-2">
            {language === "en" ? "The Flow" : "核心流程"}
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            {language === "en" ? "From public conversation to sales opportunity." : "将公开社交平台上的对话转化为获客机遇。"}
          </h3>
        </div>

        {/* Workflow Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop only) */}
          <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-slate-200 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left bg-white border border-slate-200/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between w-full mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  {step.icon}
                </div>
                <span className="text-sm font-bold text-slate-300 group-hover:text-primary/40 transition-colors">
                  {step.number}
                </span>
              </div>

              <h4 className="text-base font-bold text-navy mb-3 group-hover:text-primary transition-colors">
                {step.title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Ethical Disclaimer Box */}
        <div className="mt-14 max-w-3xl mx-auto bg-slate-100/80 border border-slate-200 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
          <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            <span className="font-bold text-slate-700">{language === "en" ? "Ethics first:" : "合规承诺:"}</span> {language === "en" 
              ? "CariLead does not provide hidden personal data, scraped phone numbers, or automated direct message utilities. We only route you to the public conversations, encouraging transparent and helpful professional replies."
              : "CariLead 不提供任何隐藏的敏感个人隐私信息、私自爬取的电话号码或第三方自动群发工具。我们仅引导您关注公开可访问的对话，倡导以专业和透明的方式与用户沟通互动。"}
          </p>
        </div>
      </div>
    </section>
  );
}
