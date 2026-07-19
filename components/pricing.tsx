"use client";

import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";

interface PricingProps {
  onOpenEarlyAccess: () => void;
}

export default function Pricing({ onOpenEarlyAccess }: PricingProps) {
  const plans = [
    {
      name: "Free",
      price: "RM0",
      description: "Get started with weekly reports and high-level customer sentiment.",
      features: [
        "Weekly industry summary",
        "Top complaints & demand themes",
        "Limited anonymised opportunities",
        "One target industry selection",
      ],
      ctaText: "Get Free Report",
      ctaLink: "#free-report",
      featured: false,
    },
    {
      name: "Solo",
      price: "RM99",
      period: "/month",
      description: "Unlock full public sources and daily leads tracking.",
      features: [
        "Full opportunity source links",
        "Daily real-time opportunity feed",
        "Industry & location filters",
        "Saved opportunities module",
        "AI response suggestion tips",
        "Email or WhatsApp digest alerts",
      ],
      ctaText: "Join Early Access",
      onClick: onOpenEarlyAccess,
      featured: true,
    },
    {
      name: "Team",
      price: "RM399",
      period: "/month",
      description: "For agencies and sales teams monitoring multiple niches.",
      features: [
        "Everything in Solo plan",
        "Up to five team seats",
        "Lead assignment controls",
        "Shared pipeline notes & status",
        "Multiple target industries tracking",
        "Team activity & response stats",
        "Instant priority Slack/digest alerts",
      ],
      ctaText: "Contact Us",
      onClick: onOpenEarlyAccess,
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-primary uppercase tracking-wider mb-2">
            Pricing Plans
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Simple, honest pricing.
          </h3>
          <p className="text-slate-500 text-sm mt-3">
            Early-access pricing. Lock in your rate before release.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all ${
                plan.featured
                  ? "border-primary bg-primary/[0.02] ring-2 ring-primary/20 relative md:-translate-y-2"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div>
                {/* Featured Badge */}
                {plan.featured && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                {/* Card Title */}
                <h4 className="text-lg font-bold text-navy mb-1">{plan.name}</h4>
                <p className="text-xs text-slate-500 mb-5 min-h-[32px]">{plan.description}</p>

                {/* Price */}
                <div className="flex items-baseline text-navy mb-6">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 text-sm font-semibold ml-1">{plan.period}</span>}
                </div>

                {/* Divider */}
                <hr className="border-slate-100 mb-6" />

                {/* Feature List */}
                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 items-start text-xs text-slate-600 font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                {plan.onClick ? (
                  <button
                    onClick={plan.onClick}
                    className={`w-full text-center font-bold py-3.5 px-4 rounded-xl text-xs transition-all active:scale-[0.98] ${
                      plan.featured
                        ? "bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg shadow-primary/10"
                        : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
                    }`}
                  >
                    {plan.ctaText}
                  </button>
                ) : (
                  <a
                    href={plan.ctaLink}
                    className="block w-full text-center font-bold py-3.5 px-4 rounded-xl text-xs transition-all active:scale-[0.98] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
                  >
                    {plan.ctaText}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footnote note */}
        <div className="mt-12 max-w-xl mx-auto flex items-start gap-2.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <Info className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
            <strong>Early-access details:</strong> The pricing displayed above represents special pre-launch rates. Features, limits, and pricing packages may adjust in the future based on user testing and developer feed suggestions.
          </p>
        </div>

      </div>
    </section>
  );
}
