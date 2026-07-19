"use client";

import { motion } from "framer-motion";
import { Search, Radio, Eye, Send, Info } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <Search className="w-5 h-5 text-primary" />,
      title: "CariLead scans public conversations",
      description: "We monitor relevant public discussions, questions, complaints, and recommendation requests across supported online platforms.",
    },
    {
      number: "02",
      icon: <Radio className="w-5 h-5 text-primary" />,
      title: "We detect useful signals",
      description: "CariLead identifies people who may be looking for help, alternatives, or professional advice, filtering out spam or noise.",
    },
    {
      number: "03",
      icon: <Eye className="w-5 h-5 text-primary" />,
      title: "You see the source and context",
      description: "Understand exactly what the person said, when they said it, where they are, and why the conversation is a sales opportunity.",
    },
    {
      number: "04",
      icon: <Send className="w-5 h-5 text-primary" />,
      title: "Respond helpfully",
      description: "Join the public conversation professionally and let the customer choose whether to continue the conversation privately.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-primary uppercase tracking-wider mb-2">
            The Flow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            From public conversation to sales opportunity.
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
            <span className="font-bold text-slate-700">Ethics first:</span> CariLead does not provide hidden personal data, scraped phone numbers, or automated direct message utilities. We only route you to the public conversations, encouraging transparent and helpful professional replies.
          </p>
        </div>
      </div>
    </section>
  );
}
