"use client";

import { motion } from "framer-motion";
import { Shield, Home, Car, GraduationCap, HardHat, Briefcase, ChevronRight } from "lucide-react";

export default function IndustryCards() {
  const useCases = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Insurance Agents",
      description: "Find people asking about medical cards, premium increases, claims, policy comparisons, and switching options.",
    },
    {
      icon: <Home className="w-6 h-6 text-primary" />,
      title: "Property Agents",
      description: "Find public requests for agents, rentals, property advice, and complaints about listings or service.",
    },
    {
      icon: <Car className="w-6 h-6 text-primary" />,
      title: "Car Salespeople",
      description: "Find buyers comparing models, asking about financing, or looking for recommendations.",
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-primary" />,
      title: "Education Consultants",
      description: "Find parents and students asking about schools, courses, tuition, and study options.",
    },
    {
      icon: <HardHat className="w-6 h-6 text-primary" />,
      title: "Renovation & Home Services",
      description: "Find homeowners actively seeking contractors, advice, quotations, and alternatives.",
    },
    {
      icon: <Briefcase className="w-6 h-6 text-primary" />,
      title: "Agencies & Sales Teams",
      description: "Track opportunities across industries and assign relevant conversations to team members.",
    },
  ];

  return (
    <section id="industries" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-primary uppercase tracking-wider mb-2">
            Who It is For
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Built for agents and service businesses.
          </h3>
          <p className="text-slate-500 text-sm mt-3 max-w-xl mx-auto">
            Whether you are a solo professional or running a team, CariLead filters out the noise to show you high-quality public interest.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bg-[#F8FAFC] border border-slate-200/50 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/55 flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-all">
                  {useCase.icon}
                </div>
                <h4 className="text-lg font-bold text-navy mb-2 group-hover:text-primary transition-colors">
                  {useCase.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {useCase.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer">
                Learn more
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
