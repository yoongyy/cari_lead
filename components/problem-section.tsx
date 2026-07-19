"use client";

import { motion } from "framer-motion";
import { UserX, Clock, DollarSign, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function ProblemSection() {
  const { language } = useLanguage();

  const industries = [
    language === "en" ? "Insurance" : "保险",
    language === "en" ? "Property" : "地产",
    language === "en" ? "Car Sales" : "汽车销售",
    language === "en" ? "Education" : "教育培训",
    language === "en" ? "Renovation" : "装修设计",
    language === "en" ? "Beauty" : "美容美体",
    language === "en" ? "Professional Services" : "专业服务",
  ];

  const painPoints = [
    {
      icon: <UserX className="w-6 h-6 text-red-500" />,
      title: language === "en" ? "Random leads" : "线索质量参差",
      description: language === "en" 
        ? "People submit forms but do not reply, or never intended to buy. You waste hours calling numbers that go straight to voicemail."
        : "提交表单后不读不回，或者根本没有购买意向。你浪费大把时间拨打电话，得到的只有拒接或空号。",
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      title: language === "en" ? "Too late" : "响应速度太慢",
      description: language === "en"
        ? "By the time you discover a customer needs help, another agent has already responded. Speed is everything, but you're flying blind."
        : "当你终于得知客户有需求时，竞争对手早已介入。响应速度决定成败，你却总是后知后觉。",
    },
    {
      icon: <DollarSign className="w-6 h-6 text-rose-500" />,
      title: language === "en" ? "Expensive advertising" : "广告获客昂贵",
      description: language === "en"
        ? "You pay high costs for clicks, forms, and contact lists without knowing whether the person truly needs your service today."
        : "为点击量、虚假表单和通用的名单支付高昂费用，却根本无法确认对方此时此刻是否有真实需求。",
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-blue-500" />,
      title: language === "en" ? "No context" : "缺乏背景信息",
      description: language === "en"
        ? "A name and phone number do not tell you what the customer actually wants. You call them cold, guessing their problem."
        : "只有一个名字和电话，完全不知道客户的真实意图。你只能盲目地进行推销，全凭猜测对方的痛点。",
    },
  ];

  return (
    <section id="industries" className="py-20 bg-white">
      {/* Social Proof Strip / Trust Chips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
          {language === "en" ? "Built for people who sell through trust, timing, and helpful conversations" : "专为重视信任、时机与真诚沟通的销售及代理人打造"}
        </p>
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {industries.map((ind) => (
            <span
              key={ind}
              className="inline-flex items-center px-4 py-2 rounded-full bg-slate-50 text-slate-600 font-semibold text-xs border border-slate-200 shadow-sm"
            >
              {ind}
            </span>
          ))}
        </div>
      </div>

      {/* Problem Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-red-500 uppercase tracking-wider mb-2">
            {language === "en" ? "The Cold Outreach Problem" : "冷拜访/冷触达的传统痛点"}
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            {language === "en" ? "Cold leads waste your time." : "低意向的冷线索正在浪费你的生命。"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {painPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#F8FAFC] border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/50 flex items-center justify-center mb-5 shadow-sm">
                  {point.icon}
                </div>
                <h3 className="text-lg font-bold text-navy mb-3">{point.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{point.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 p-4 bg-primary/5 border border-primary/10 rounded-2xl text-navy text-sm font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>
              {language === "en" 
                ? "CariLead starts with the customer’s real words, not an empty lead form."
                : "CariLead 从用户的公开真实心声开始，而不是干瘪的表单数据。"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
