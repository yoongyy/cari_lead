"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, RefreshCw, X, HelpCircle, Shield, Link as LinkIcon, ExternalLink, Play, Pause, Radio } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import OpportunityCard, { 
  Opportunity,
  translateSignal,
  translateIndustry,
  translateLocation,
  translateTime,
  translateSource,
  translateQuote
} from "./opportunity-card";

// Initial starting dataset
const initialOpportunities: Opportunity[] = [
  {
    id: "init-1",
    quote: "My medical card premium went up again. Thinking of changing. What should I compare first?",
    industry: "Insurance",
    location: "Selangor",
    signal: "Considering switch",
    time: "12m ago",
    confidence: 94,
    source: "Forum Thread #391",
  },
  {
    id: "init-2",
    quote: "Any reliable agent for a condo rental around Mont Kiara?",
    industry: "Property",
    location: "Kuala Lumpur",
    signal: "Looking for recommendation",
    time: "34m ago",
    confidence: 98,
    source: "Local Community Group",
  },
  {
    id: "init-3",
    quote: "Looking for a family SUV below RM120k. CX-5 or something else?",
    industry: "Automotive",
    location: "Kuala Lumpur",
    signal: "Comparing options",
    time: "55m ago",
    confidence: 89,
    source: "Car Lovers Malaysia",
  },
  {
    id: "init-4",
    quote: "Which tuition centre is good for SPM science near PJ?",
    industry: "Education",
    location: "Selangor",
    signal: "Asking for help",
    time: "2h ago",
    confidence: 91,
    source: "Parenting Forum",
  },
  {
    id: "init-5",
    quote: "Need a trustworthy contractor for kitchen renovation in Puchong.",
    industry: "Renovation",
    location: "Selangor",
    signal: "Looking for recommendation",
    time: "3h ago",
    confidence: 96,
    source: "Taman Puchong Residents FB",
  },
  {
    id: "init-6",
    quote: "Anyone tried treatment for acne scars in KL? Looking for honest recommendations.",
    industry: "Beauty",
    location: "Kuala Lumpur",
    signal: "Complaint",
    time: "4h ago",
    confidence: 87,
    source: "Beauty Review Portal",
  },
];

export default function OpportunityFeed() {
  const { language } = useLanguage();
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [selectedSignal, setSelectedSignal] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [activeModalOpp, setActiveModalOpp] = useState<Opportunity | null>(null);

  // Live streaming states
  const [isLive, setIsLive] = useState(true);
  const [displayedOpps, setDisplayedOpps] = useState<Opportunity[]>(initialOpportunities);
  const [allLiveOpps, setAllLiveOpps] = useState<Opportunity[]>([]);
  const [newSignalFlash, setNewSignalFlash] = useState(false);
  const rotateIndex = useRef(0);

  // Fetch live feed data from API
  useEffect(() => {
    fetch("/api/live-opportunities")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.opportunities?.length > 0) {
          setAllLiveOpps(data.opportunities);
        }
      })
      .catch((err) => console.warn("Failed to fetch live opportunities:", err));
  }, []);

  // Set up the interval for real time rotation
  useEffect(() => {
    if (!isLive || allLiveOpps.length === 0) return;

    const interval = setInterval(() => {
      // Pick next opportunity from list
      const idx = rotateIndex.current % allLiveOpps.length;
      const baseOpp = allLiveOpps[idx];
      rotateIndex.current += 1;

      // Assign dynamic unique ID and set time to just now
      const newOpp: Opportunity = {
        ...baseOpp,
        id: `live-${Date.now()}-${idx}`,
        time: "Just now",
      };

      // Add to displayed cards, updating timestamps of older ones, and keeping max 6
      setDisplayedOpps((prev) => {
        const updatedPrev = prev.map((item) => {
          if (item.time === "Just now") return { ...item, time: "1m ago" };
          if (item.time === "1m ago") return { ...item, time: "3m ago" };
          if (item.time === "3m ago") return { ...item, time: "12m ago" };
          if (item.time === "12m ago") return { ...item, time: "34m ago" };
          if (item.time === "34m ago") return { ...item, time: "55m ago" };
          return { ...item, time: "1h ago" };
        });
        return [newOpp, ...updatedPrev].slice(0, 6);
      });

      // Trigger signal visual alert
      setNewSignalFlash(true);
      const flashTimeout = setTimeout(() => setNewSignalFlash(false), 1500);

      return () => clearTimeout(flashTimeout);
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval);
  }, [isLive, allLiveOpps]);

  // Filtering options
  const industries = ["All", "Insurance", "Property", "Automotive", "Education", "Renovation", "Beauty"];
  const signals = ["All", "Looking for recommendation", "Considering switch", "Asking for help", "Comparing options", "Complaint"];
  const locations = ["All", "Kuala Lumpur", "Selangor", "Johor", "Penang"];

  // Filtered dataset
  const filteredOpportunities = useMemo(() => {
    // If we have filters active, we don't display rotating live feed, we filter the base dataset
    const baseSet = (selectedIndustry === "All" && selectedSignal === "All" && selectedLocation === "All")
      ? displayedOpps
      : [...allLiveOpps, ...initialOpportunities];

    // Deduplicate
    const uniqueMap = new Map();
    baseSet.forEach((item) => {
      uniqueMap.set(item.quote, item);
    });
    const uniqueList = Array.from(uniqueMap.values());

    return uniqueList.filter((opp) => {
      const matchInd = selectedIndustry === "All" || opp.industry.toLowerCase() === selectedIndustry.toLowerCase();
      const matchSig = selectedSignal === "All" || opp.signal.toLowerCase() === selectedSignal.toLowerCase();
      const matchLoc = selectedLocation === "All" || opp.location.toLowerCase() === selectedLocation.toLowerCase();
      return matchInd && matchSig && matchLoc;
    });
  }, [selectedIndustry, selectedSignal, selectedLocation, displayedOpps, allLiveOpps]);

  // Disable live stream when user applies filters to avoid disrupting their review
  const handleFilterChange = (type: "industry" | "signal" | "location", value: string) => {
    if (type === "industry") setSelectedIndustry(value);
    if (type === "signal") setSelectedSignal(value);
    if (type === "location") setSelectedLocation(value);
    setIsLive(false);
  };

  return (
    <section id="demo-feed" className="py-20 bg-slate-50 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 text-primary-dark text-xs font-bold mb-3 uppercase tracking-wider">
              {language === "en" ? "Real-Time Opportunity Feed" : "实时意向线索流"}
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              {language === "en" ? "See public opportunities in real time." : "实时把握公开的业务机遇。"}
            </h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xl">
              {language === "en" 
                ? "CariLead detects public demand signals. Watch new comments and recommendation requests arrive on the dashboard feed."
                : "CariLead 实时监测公开的用户需求信号。在下方控制面板上观察最新评论和咨询建议请求。"}
            </p>
          </div>
          
          {/* Active status pulse & toggle */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 border border-slate-200 rounded-xl shadow-sm">
              <span className="relative flex h-2 w-2">
                {isLive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? "bg-primary" : "bg-slate-400"}`}></span>
              </span>
              <span className="text-[11px] font-bold text-navy">
                {isLive 
                  ? (language === "en" ? "STREAMING LIVE" : "实时扫描中")
                  : (language === "en" ? "STREAM PAUSED" : "扫描暂停")}
              </span>
            </div>

            {/* Toggle Streaming Button */}
            <button
              onClick={() => {
                setIsLive(!isLive);
                if (!isLive) {
                  // Reset filters to view live stream
                  setSelectedIndustry("All");
                  setSelectedSignal("All");
                  setSelectedLocation("All");
                }
              }}
              className={`flex items-center gap-1 px-4 py-2.5 rounded-xl border text-[11px] font-bold transition-all shadow-sm ${
                isLive
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                  : "bg-primary hover:bg-primary-dark border-primary text-white"
              }`}
            >
              {isLive ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> {language === "en" ? "Pause Stream" : "暂停扫描"}
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" /> {language === "en" ? "Resume Live" : "恢复实时"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* New Signal Flash Banner */}
        <div className="h-9 mb-6 relative">
          <AnimatePresence>
            {newSignalFlash && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-x-0 top-0 bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md text-center flex items-center justify-center gap-1.5 z-10"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>
                  {language === "en" ? "NEW OPPORTUNITY DETECTED BY CARILEAD ENGINE" : "CARILEAD 引擎检测到新意向机会"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters Controls Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-8 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-navy">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold">{language === "en" ? "Filter Dashboard Feed" : "筛选控制面板"}</span>
            </div>
            
            {/* Auto-pause warning if user starts filtering */}
            {(selectedIndustry !== "All" || selectedSignal !== "All" || selectedLocation !== "All") && (
              <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                {language === "en" ? "⚠️ Live stream paused (filters active)" : "⚠️ 实时流已暂停 (筛选已启用)"}
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Industry Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {language === "en" ? "Industry" : "行业"}
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => handleFilterChange("industry", e.target.value)}
                className="w-full text-sm bg-[#F8FAFC] border border-slate-200 text-navy font-semibold rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind === "All" ? (language === "en" ? "All Industries" : "全部行业") : translateIndustry(ind, language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Signal Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {language === "en" ? "Signal Type" : "意向类型"}
              </label>
              <select
                value={selectedSignal}
                onChange={(e) => handleFilterChange("signal", e.target.value)}
                className="w-full text-sm bg-[#F8FAFC] border border-slate-200 text-navy font-semibold rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
              >
                {signals.map((sig) => (
                  <option key={sig} value={sig}>
                    {sig === "All" ? (language === "en" ? "All Signals" : "全部意向") : translateSignal(sig, language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {language === "en" ? "Location (State)" : "所在地 (州)"}
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full text-sm bg-[#F8FAFC] border border-slate-200 text-navy font-semibold rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === "All" ? (language === "en" ? "All Locations" : "全部地区") : translateLocation(loc, language)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Demo Cards Grid */}
        {filteredOpportunities.length > 0 ? (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOpportunities.map((opp) => (
                <motion.div
                  key={opp.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <OpportunityCard
                    opp={opp}
                    onViewSource={(o) => setActiveModalOpp(o)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-navy font-bold text-lg mb-1">
              {language === "en" ? "No matching opportunities found" : "未找到匹配的意向线索"}
            </p>
            <p className="text-slate-400 text-sm">
              {language === "en" ? "Try widening your filters to show the demo dataset." : "请尝试放宽筛选条件以显示演示数据。"}
            </p>
            <button
              onClick={() => {
                setSelectedIndustry("All");
                setSelectedSignal("All");
                setSelectedLocation("All");
                setIsLive(true);
              }}
              className="mt-4 text-xs font-bold text-primary hover:underline"
            >
              {language === "en" ? "Reset Filters & Resume Live Stream" : "重置筛选并恢复实时扫描"}
            </button>
          </div>
        )}

        {/* Live feed warning label */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            {language === "en" 
              ? "⚠️ DEMO EXAMPLES ONLY. NO REAL CONVERSATIONS LIVE-STREAMED IN FREE VERSION." 
              : "⚠️ 仅为功能演示。免费版中不提供实时真实的对话数据。"}
          </p>
        </div>
      </div>

      {/* View Source Modal Simulation */}
      <AnimatePresence>
        {activeModalOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalOpp(null)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-navy">
                    {language === "en" ? "Public Conversation Link" : "公开对话来源链接"}
                  </span>
                </div>
                <button
                  onClick={() => setActiveModalOpp(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-4 bg-slate-50 border border-slate-200/50 p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {language === "en" ? "PUBLIC SOURCE COMMENTS:" : "公开源评论内容:"}
                  </p>
                  <p className="text-sm font-semibold text-navy leading-relaxed italic">
                    &ldquo;{translateQuote(activeModalOpp.quote, language)}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 font-medium">
                    <span className="font-semibold text-slate-500">
                      {translateSource(activeModalOpp.source, language)}
                    </span>
                    <span>•</span>
                    <span>
                      {language === "en" ? "Posted" : "发布时间"} {translateTime(activeModalOpp.time, language)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary-dark">
                      1
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-navy mb-0.5">
                        {language === "en" ? "Click to Open Public Discussion" : "点击打开公开讨论帖子"}
                      </h5>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {language === "en" 
                          ? "CariLead redirects you directly to the original forum thread, Facebook group, or public portal."
                          : "CariLead 将引导您直接访问原始论坛帖子、脸书群组或公开门户。"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary-dark">
                      2
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-navy mb-0.5">
                        {language === "en" ? "Disclose and Respond" : "真诚且公开地进行回复"}
                      </h5>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {language === "en"
                          ? "You write a helpful public response directly on that platform, helping the user solve their query transparently."
                          : "您直接在该平台上撰写公开且有针对性的专业回复，以真诚服务用户的态度解答疑问。"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary-dark">
                      3
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-navy mb-0.5">
                        {language === "en" ? "Private Conversation" : "转化为私信深入沟通"}
                      </h5>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {language === "en"
                          ? "If they like your response, they reply publicly or DM you to schedule a consultation."
                          : "如果用户认可您的解答，他们会公开跟帖或直接私信联系您，咨询详细的服务细节。"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated Link action */}
                <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/15 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">{language === "en" ? "Simulated Destination:" : "模拟跳转目标平台:"}</span>
                    <span className="text-primary-dark font-bold flex items-center gap-0.5">
                      {activeModalOpp.source.replace(" ", "_").toLowerCase()}.com.my
                      <LinkIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      alert(language === "en" 
                        ? "Simulating redirect to the public source post! In the real SaaS, this redirects you straight to the platform's original discussion URL."
                        : "正在模拟跳转至公开的源贴！在实际的 SaaS 产品中，这将直接带您访问该平台的原始讨论网址。");
                      setActiveModalOpp(null);
                    }}
                    className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5"
                  >
                    <span>{language === "en" ? "Test External Redirect (Demo)" : "测试外部链接跳转 (演示)"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
