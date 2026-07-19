"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export default function ComparisonTable() {
  const comparisonData = [
    {
      feature: "Source context",
      traditional: "Usually missing (just a phone number or email)",
      traditionalGood: false,
      cariLead: "See the original public conversation & comments",
      cariLeadGood: true,
    },
    {
      feature: "Customer need",
      traditional: "Unknown (you don't know what they want to buy)",
      traditionalGood: false,
      cariLead: "Understand exactly what they are asking for",
      cariLeadGood: true,
    },
    {
      feature: "Timing",
      traditional: "Often old (compiled weeks or months ago)",
      traditionalGood: false,
      cariLead: "Recent opportunities and real-time alerts",
      cariLeadGood: true,
    },
    {
      feature: "Personal data",
      traditional: "Contact databases (often scraped illegally)",
      traditionalGood: false,
      cariLead: "Public-source links only (100% privacy-compliant)",
      cariLeadGood: true,
    },
    {
      feature: "Approach",
      traditional: "Cold outreach (high rejection, spam reports)",
      traditionalGood: false,
      cariLead: "Helpful, context-aware transparent engagement",
      cariLeadGood: true,
    },
    {
      feature: "Trust",
      traditional: "Easy to feel spammy (calling a stranger)",
      traditionalGood: false,
      cariLead: "Start from a real public question they asked",
      cariLeadGood: true,
    },
  ];

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-teal-600 uppercase tracking-wider mb-2">
            Why We Are Different
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Not another lead database.
          </h3>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden max-w-4xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[20%]">
                    Comparison
                  </th>
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[40%]">
                    Traditional Lead List
                  </th>
                  <th className="p-5 text-xs font-bold text-primary-dark uppercase tracking-widest w-[40%] bg-primary/5">
                    CariLead
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonData.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    {/* Feature Title */}
                    <td className="p-5 text-xs font-bold text-navy">
                      {row.feature}
                    </td>
                    
                    {/* Traditional Description */}
                    <td className="p-5 text-xs text-slate-500">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    
                    {/* CariLead Description */}
                    <td className="p-5 text-xs text-navy font-semibold bg-primary/5 border-x border-primary/10">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{row.cariLead}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
