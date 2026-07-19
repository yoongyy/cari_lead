"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "What is CariLead?",
      answer: "CariLead finds relevant public conversations where people are asking for recommendations, help, alternatives, or comparisons. It translates public discussions into immediate outreach opportunities for local businesses and agents.",
    },
    {
      question: "Is CariLead selling personal information?",
      answer: "No. CariLead is built entirely around public discussions and platform source links. We do not harvest hidden phone numbers, scrape private lists, or sell personal contact databases. You see the public post and click the source link to engage.",
    },
    {
      question: "Can I automatically message everyone?",
      answer: "No. CariLead does not support or provide mass automated outreach features. Automatic spamting violates platform terms and harms trust. We provide the source so you can write helpful, transparent responses manually.",
    },
    {
      question: "Which industries are supported?",
      answer: "Our primary initial focus is Insurance and Property, followed by Automotive, Education, Renovation, Beauty, and Professional Services. You can filter the feed and digests based on your industry niche.",
    },
    {
      question: "Where does CariLead find opportunities?",
      answer: "We index public online forums, resident groups, QA portals, and supported public online discussions. Source coverage and volumes vary depending on your industry and active community hubs.",
    },
    {
      question: "Is every opportunity a guaranteed customer?",
      answer: "No. CariLead identifies intent signals and buying queries, not guaranteed sales. A user asking for suggestions is a high-quality conversation starter, but your response speed and helpfulness determine the conversion.",
    },
    {
      question: "Can I try it free?",
      answer: "Yes, absolutely! You can sign up for our Free tier to receive our weekly industry email report outlining complaints and switching indicators, without adding a credit card.",
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
            Frequently Asked Questions
          </h3>
          <p className="text-slate-500 text-sm mt-3">
            Everything you need to know about CariLead.
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
