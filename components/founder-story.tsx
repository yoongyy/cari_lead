"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote, Compass } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function FounderStory() {
  const { language } = useLanguage();

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm max-w-4xl mx-auto">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            
            {/* Left Graphic Element */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
                <Compass className="w-9 h-9" />
              </div>
              <p className="text-xs font-bold text-navy uppercase tracking-wider">
                {language === "en" ? "Behind CariLead" : "CariLead 的初衷"}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                {language === "en" ? "Kuala Lumpur, Malaysia" : "马来西亚吉隆坡"}
              </p>
            </div>

            {/* Right Story Copy */}
            <div className="md:col-span-8">
              <h3 className="text-2xl font-extrabold text-navy tracking-tight mb-6">
                {language === "en" ? "Why we built CariLead" : "我们为什么创立 CariLead"}
              </h3>
              
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-medium">
                <p>
                  {language === "en" 
                    ? "SMEs and sales agents spend thousands of Ringgit chasing cold contact lists and advertising to strangers, while thousands of Malaysian customers are openly asking for recommendations or seeking help online every single day."
                    : "中小企业和销售代表们每天花费成千上万令吉去获取低意向的冷电话名单、向陌生人投放广告，然而与此同时，每天都有数以千计的马来西亚客户在网上公开咨询建议或寻求具体服务帮助。"}
                </p>
                <p>
                  {language === "en"
                    ? "We built CariLead to monitor those public conversations, understand the real problem, and help honest professionals respond at the exact right moment."
                    : "我们创立 CariLead 的初衷，就是为了监测这些公开讨论，理解用户的真实痛点，并帮助真诚敬业的专业顾问在最恰当的黄金时机切入解答。"}
                </p>
                <p>
                  {language === "en"
                    ? "CariLead began by analysing customer complaints, switching behavior, and buying questions across difficult-to-search forums and groups. We realised the most valuable signal wasn't just that someone was unhappy with their provider—it was that they were active, ready, and looking for something better."
                    : "CariLead 的起点是分析散落在各大难以检索的论坛和群组中的用户吐槽、转保/转行行为以及售前提问。我们意识到，最有价值的意向信号不仅仅是某人对现有服务商感到不满，而是他们目前处于活跃状态、随时准备买单、且正在积极寻找更好的选择。"}
                </p>
              </div>

              {/* Quote Footer */}
              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-3">
                <MessageSquareQuote className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="text-xs font-bold text-navy italic">
                  {language === "en" 
                    ? "“Stop chasing strangers. Connect with people already asking for help.”"
                    : "“停止盲目追逐陌生人。直接与那些正在寻求帮助的用户建立真诚链接。”"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
