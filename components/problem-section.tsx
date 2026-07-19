"use client";

import { motion } from "framer-motion";
import { UserX, Clock, DollarSign, HelpCircle, ArrowRight } from "lucide-react";

export default function ProblemSection() {
  const industries = [
    "Insurance",
    "Property",
    "Car Sales",
    "Education",
    "Renovation",
    "Beauty",
    "Professional Services",
  ];

  const painPoints = [
    {
      icon: <UserX className="w-6 h-6 text-red-500" />,
      title: "Random leads",
      description: "People submit forms but do not reply, or never intended to buy. You waste hours calling numbers that go straight to voicemail.",
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      title: "Too late",
      description: "By the time you discover a customer needs help, another agent has already responded. Speed is everything, but you're flying blind.",
    },
    {
      icon: <DollarSign className="w-6 h-6 text-rose-500" />,
      title: "Expensive advertising",
      description: "You pay high costs for clicks, forms, and contact lists without knowing whether the person truly needs your service today.",
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-blue-500" />,
      title: "No context",
      description: "A name and phone number do not tell you what the customer actually wants. You call them cold, guessing their problem.",
    },
  ];

  return (
    <section id="industries" className="py-20 bg-white">
      {/* Social Proof Strip / Trust Chips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
          Built for people who sell through trust, timing, and helpful conversations
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
            The Cold Outreach Problem
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Cold leads waste your time.
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
              CariLead starts with the customer’s real words, not an empty lead form.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
