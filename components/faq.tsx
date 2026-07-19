"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: language === "en" ? "What is CariLead?" : "什么是 CariLead？",
      answer: language === "en" 
        ? "CariLead finds relevant public conversations where people are asking for recommendations, help, alternatives, or comparisons. It translates public discussions into immediate outreach opportunities for local businesses and agents."
        : "CariLead 帮您捕捉公开平台上的相关讨论帖，例如用户正在寻找推荐、寻求帮助、对比竞品或希望更换服务。它将公开的网络交流转化为本地企业和销售代理人可直接跟进的实时获客机会。",
    },
    {
      question: language === "en" ? "Is CariLead selling personal information?" : "CariLead 是否在售卖个人隐私信息？",
      answer: language === "en"
        ? "No. CariLead is built entirely around public discussions and platform source links. We do not harvest hidden phone numbers, scrape private lists, or sell personal contact databases. You see the public post and click the source link to engage."
        : "绝对不卖。CariLead 完全围绕公开讨论以及各平台的原始网页链接构建。我们从不收集隐藏的电话号码、抓取非公开名单，也绝不售卖个人联系方式数据库。您只能看到公开的求助内容，并点击跳转链接至原始平台进行跟帖互动。",
    },
    {
      question: language === "en" ? "Can I automatically message everyone?" : "我可以自动群发私信吗？",
      answer: language === "en"
        ? "No. CariLead does not support or provide mass automated outreach features. Automatic spamting violates platform terms and harms trust. We provide the source so you can write helpful, transparent responses manually."
        : "不能。CariLead 绝不支持也不提供任何形式的自动化私信群发功能。自动骚扰信息不仅违反各大社媒平台的合规准则，更会破坏客户信任。我们提供帖子来源，鼓励您手动撰写公开透明、切实有帮助的专业回复。",
    },
    {
      question: language === "en" ? "Which industries are supported?" : "目前支持哪些行业？",
      answer: language === "en"
        ? "Our primary initial focus is Insurance and Property, followed by Automotive, Education, Renovation, Beauty, and Professional Services. You can filter the feed and digests based on your industry niche."
        : "我们最初的核心焦点是保险和房地产行业，其次也涵盖了汽车销售、教育培训、装修家居、美容美体以及专业咨询服务。您可以根据您深耕的垂直行业进行定向筛选和查看报告。",
    },
    {
      question: language === "en" ? "Where does CariLead find opportunities?" : "CariLead 的意向机会主要来自哪里？",
      answer: language === "en"
        ? "We index public online forums, resident groups, QA portals, and supported public online discussions. Source coverage and volumes vary depending on your industry and active community hubs."
        : "我们索引公开的网络社区论坛、本地居民交流小组、主流问答平台以及相关公开网页上的公共对话。线索的数量和覆盖面取决于您的垂直行业分类以及该行业在各大社群的活跃水平。",
    },
    {
      question: language === "en" ? "Is every opportunity a guaranteed customer?" : "每个意向机会都百分之百能成交吗？",
      answer: language === "en"
        ? "No. CariLead identifies intent signals and buying queries, not guaranteed sales. A user asking for suggestions is a high-quality conversation starter, but your response speed and helpfulness determine the conversion."
        : "不是。CariLead 识别并推送的是明确的需求信号与售前提问，而非保证成交的客户。用户公开寻求建议是极佳的对话开端，但最终能否成单取决于您的响应速度、沟通技巧和专业程度。",
    },
    {
      question: language === "en" ? "Can I try it free?" : "我可以免费试用吗？",
      answer: language === "en"
        ? "Yes, absolutely! You can sign up for our Free tier to receive our weekly industry email report outlining complaints and switching indicators, without adding a credit card."
        : "当然可以！您可以直接加入我们的免费套餐，无需添加任何信用卡，即可每周通过邮箱接收到所选行业的吐槽投诉及更换/转保意向分析报告。",
    },
  ];

  const toggleFAQ = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-extrabold text-navy tracking-tight">
            {language === "en" ? "Frequently Asked Questions" : "常见问题解答"}
          </h3>
          <p className="text-slate-500 text-sm mt-3">
            {language === "en" ? "Everything you need to know about CariLead." : "关于 CariLead 您想了解的内容都在这里。"}
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 text-left bg-[#F8FAFC] hover:bg-slate-100/50 transition-colors focus:outline-none"
                >
                  <span className="text-sm font-bold text-navy pr-4">{faq.question}</span>
                  <div className="shrink-0 text-slate-500">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="p-5 text-xs text-slate-500 leading-relaxed font-semibold bg-white border-t border-slate-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
