"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, ShieldAlert, Sparkles, Send } from "lucide-react";

interface EarlyAccessFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  whatsapp?: string;
  customerDescription?: string;
}

export default function EarlyAccessForm({ isOpen, onClose }: EarlyAccessFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [industry, setIndustry] = useState("Insurance");
  const [state, setState] = useState("Selangor");
  const [scale, setScale] = useState("Individual");
  const [customerDescription, setCustomerDescription] = useState("");
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const industries = [
    "Insurance",
    "Property",
    "Automotive",
    "Education",
    "Renovation",
    "Beauty",
    "Professional Services",
    "Other",
  ];

  const states = [
    "Selangor",
    "Kuala Lumpur",
    "Johor",
    "Penang",
    "Perak",
    "Pahang",
    "Negeri Sembilan",
    "Melaka",
    "Kedah",
    "Terengganu",
    "Kelantan",
    "Perlis",
    "Sabah",
    "Sarawak",
    "Putrajaya & Labuan",
  ];

  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {};
    let isValid = true;

    if (!name.trim()) {
      tempErrors.name = "Full name is required.";
      isValid = false;
    }

    if (!email.trim()) {
      tempErrors.email = "Email is required.";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        tempErrors.email = "Please enter a valid email address.";
        isValid = false;
      }
    }

    if (!whatsapp.trim()) {
      tempErrors.whatsapp = "WhatsApp number is required.";
      isValid = false;
    } else {
      // Validate Malaysian WhatsApp phone number format
      // Allowed formats: 01xxxxxxx, +601xxxxxxx, 601xxxxxxx
      const cleanNum = whatsapp.replace(/[\s-]/g, "");
      const phoneRegex = /^(?:\+?6?01)[0-9]{8,10}$|^01[0-9]{8,10}$/;
      if (!phoneRegex.test(cleanNum)) {
        tempErrors.whatsapp = "Enter a valid Malaysian number (e.g. 012-3456789).";
        isValid = false;
      }
    }

    if (!customerDescription.trim()) {
      tempErrors.customerDescription = "Please tell us what customers you are looking for.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submissionData = {
      name,
      email,
      whatsapp,
      industry,
      state,
      scale,
      customerDescription,
    };

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit early access request.");
      }

      // Process submission (Save to localStorage as backup)
      const localBackup = {
        ...submissionData,
        submittedAt: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem("carilead_early_access_" + Date.now(), JSON.stringify(localBackup));
      } catch (storageErr) {
        console.warn("Could not save to localStorage:", storageErr);
      }

      setIsSubmitted(true);
      
      // Clear fields
      setName("");
      setEmail("");
      setWhatsapp("");
      setCustomerDescription("");
      setErrors({});
    } catch (err: any) {
      setErrors({ name: err.message || "Something went wrong. Please try again." });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-sm font-bold text-navy">Get Early Access to CariLead</span>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-navy mb-2">You&apos;re on the list!</h4>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto mb-6 font-semibold">
                    Thank you for joining our early access program. We will contact you on WhatsApp or Email as soon as slots open up.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      onClose();
                    }}
                    className="bg-navy hover:bg-navy-light text-white font-bold py-3 px-6 rounded-xl text-xs transition-all active:scale-[0.98]"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ahmad Faiz"
                      className={`w-full text-xs bg-slate-50 border rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-colors ${
                        errors.name ? "border-red-400" : "border-slate-200"
                      }`}
                    />
                    {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.name}</p>}
                  </div>

                  {/* Contact Row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className={`w-full text-xs bg-slate-50 border rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-colors ${
                          errors.email ? "border-red-400" : "border-slate-200"
                        }`}
                      />
                      {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email}</p>}
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="e.g. 0123456789"
                        className={`w-full text-xs bg-slate-50 border rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-colors ${
                          errors.whatsapp ? "border-red-400" : "border-slate-200"
                        }`}
                      />
                      {errors.whatsapp && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.whatsapp}</p>}
                    </div>
                  </div>

                  {/* Dropdowns Row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Industry */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Industry
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 text-navy font-semibold rounded-xl p-3 focus:outline-none cursor-pointer"
                      >
                        {industries.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        State
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 text-navy font-semibold rounded-xl p-3 focus:outline-none cursor-pointer"
                      >
                        {states.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Individual/Team scale toggle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      I am signing up as:
                    </label>
                    <div className="flex gap-4">
                      {["Individual", "Team / Agency"].map((opt) => {
                        const isSel = (opt.startsWith("Individual") && scale === "Individual") ||
                                      (opt.startsWith("Team") && scale === "Team");
                        return (
                          <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-navy cursor-pointer">
                            <input
                              type="radio"
                              name="scale"
                              checked={isSel}
                              onChange={() => setScale(opt.startsWith("Individual") ? "Individual" : "Team")}
                              className="accent-primary"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      What kind of customers are you looking for?
                    </label>
                    <textarea
                      value={customerDescription}
                      onChange={(e) => setCustomerDescription(e.target.value)}
                      placeholder="e.g. I am looking for homeowners in Cheras seeking kitchen renovation, or buyers asking about Selangor property agents."
                      rows={3}
                      className={`w-full text-xs bg-slate-50 border rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-colors ${
                        errors.customerDescription ? "border-red-400" : "border-slate-200"
                      }`}
                    />
                    {errors.customerDescription && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">{errors.customerDescription}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>Request Early Access</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400 font-medium pt-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>No deposit required. Pre-launch priority slot.</span>
                  </div>
                </form>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
