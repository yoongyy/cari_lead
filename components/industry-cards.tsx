"use client";

import { motion } from "framer-motion";
import { Shield, Home, Car, GraduationCap, HardHat, Briefcase, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function IndustryCards() {
  const { language } = useLanguage();

  const useCases = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: language === "en" ? "Insurance Agents" : "保险代理人",
      description: language === "en" 
        ? "Find people asking about medical cards, premium increases, claims, policy comparisons, and switching options."
        : "寻找询问医药卡选择、保费上涨、理赔纠纷、保单横向对比及转保选项的高意向客户。",
    },
    {
      icon: <Home className="w-6 h-6 text-primary" />,
      title: language === "en" ? "Property Agents" : "地产经纪人",
      description: language === "en"
        ? "Find public requests for agents, rentals, property advice, and complaints about listings or service."
        : "捕获寻找靠谱经纪人、租房找房、置业建议的请求，以及对现有中介服务或房源的吐槽。",
    },
    {
      icon: <Car className="w-6 h-6 text-primary" />,
      title: language === "en" ? "Car Salespeople" : "汽车销售顾问",
      description: language === "en"
        ? "Find buyers comparing models, asking about financing, or looking for recommendations."
        : "寻找对比不同车型、打听汽车金融贷款方案或寻找靠谱车行推荐的意向买家。",
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-primary" />,
      title: language === "en" ? "Education Consultants" : "教育培训咨询",
      description: language === "en"
        ? "Find parents and students asking about schools, courses, tuition, and study options."
        : "发现正在咨询升学规划、选课疑问、补习班口碑及留学方案的家长和学生。",
    },
    {
      icon: <HardHat className="w-6 h-6 text-primary" />,
      title: language === "en" ? "Renovation & Home Services" : "装修与家居服务商",
      description: language === "en"
        ? "Find homeowners actively seeking contractors, advice, quotations, and alternatives."
        : "对接正在寻求装修承包商、施工建议、预算报价以及对比各家服务细节的业主。",
    },
    {
      icon: <Briefcase className="w-6 h-6 text-primary" />,
      title: language === "en" ? "Agencies & Sales Teams" : "销售团队与企业机构",
      description: language === "en"
        ? "Track opportunities across industries and assign relevant conversations to team members."
        : "全方位追踪多行业商机，并将对应的公开对话智能指派给团队不同成员跟进。",
    },
  ];

  return (
    <section id="industries" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-primary uppercase tracking-wider mb-2">
            {language === "en" ? "Who It is For" : "适用对象"}
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            {language === "en" ? "Built for agents and service businesses." : "专为独立代理人及服务性企业量身打造。"}
          </h3>
          <p className="text-slate-500 text-sm mt-3 max-w-xl mx-auto">
            {language === "en"
              ? "Whether you are a solo professional or running a team, CariLead filters out the noise to show you high-quality public interest."
              : "无论您是独立执业的顾问，还是管理着业务团队，CariLead 都能为您过滤市场杂音，直观展示高质量的公开兴趣线索。"}
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
                {language === "en" ? "Learn more" : "了解更多"}
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
