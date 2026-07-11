import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle, Sparkles, PhoneCall, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Account & Profile",
    question: "How do I verify my profile on Devbhoomi Bandhan?",
    answer: "Profile verification can be done by uploading a valid government ID (such as Aadhaar or Voter ID) in your account settings. Verified profiles receive a 'Verified' badge, which increases credibility and matching rates by over 60%."
  },
  {
    category: "Account & Profile",
    question: "Can I hide my profile photo from specific members?",
    answer: "Yes. Our advanced privacy controls allow you to choose who views your profile photos. You can set visibility options to 'All Members', 'Premium Only', or 'Only Accepted Matches' within your Settings panel."
  },
  {
    category: "Kundali & Matching",
    question: "How accurate is the Free Kundali matching system?",
    answer: "Our automated Kundali matching platform runs on authentic Vedic astrology calculations. It evaluates Guna Milan, Dosha configurations (like Manglik Dosha), and planetary alignments to provide an deeply analytical compatibility rating report."
  },
  {
    category: "Premium Membership",
    question: "What are the benefits of upgrading to a Premium Plan?",
    answer: "Premium memberships instantly lift the curtain on your profile insights. You can see who visited your profile, access unlocked high-definition photo views, initiate direct chat messaging protocols, and get priority visibility features."
  },
  {
    category: "Premium Membership",
    question: "Is my payment details secure?",
    answer: "Completely secure. All financial transactions are processed through enterprise-grade encrypted payment pathways (Razorpay/Stripe). Devbhoomi Bandhan never records or keeps your credit card details on our local database logs."
  },
  {
    category: "Support & Security",
    question: "How do you protect members from fake profiles?",
    answer: "Every individual application profile undergoes a thorough manual screening process managed by our security operations team. We actively monitor suspicious behaviors and prompt users for automated validation protocols to guarantee a secure environment."
  }
];

const categories = ["All", "Account & Profile", "Kundali & Matching", "Premium Membership", "Support & Security"];

export const Faq: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1C1917] antialiased selection:bg-[#6B122F]/10 relative overflow-hidden pb-24">
      {/* Premium Luxury Glowing Accents */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-gradient-to-b from-[#6B122F]/8 via-transparent to-transparent blur-3xl opacity-60" />
      <div className="absolute top-[400px] -left-20 -z-10 h-[500px] w-[500px] bg-gradient-to-tr from-[#7A1E3A]/4 to-transparent blur-3xl opacity-40" />

      <div className="mx-auto max-w-4xl px-6 pt-12">
        {/* --- LUXURY HEADER --- */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6B122F]/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#6B122F]">
            <Sparkles size={11} className="fill-[#6B122F]/10" /> Support Desk
          </div>
          <h1 className="font-serif text-4xl font-black tracking-tight sm:text-5xl text-[#1C1917]">
            Frequently Asked <span className="font-light italic text-[#6B122F]">Questions</span>
          </h1>
          <p className="text-sm font-medium text-[#78716C] max-w-lg mx-auto leading-relaxed">
            Everything you need to know about finding your perfect life partner securely under the blessings of Maa Naina Devi.
          </p>

          {/* Search Box Engine */}
          <div className="max-w-xl mx-auto mt-8 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-stone-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search running concerns, guidelines, setup questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EFECE6] rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-[#1C1917] placeholder-stone-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#6B122F]/20 focus:border-[#6B122F]"
            />
          </div>
        </div>

        {/* --- FILTER BUTTONS BAR --- */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 border-b border-[#EFECE6] pb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => { setActiveCategory(category); setExpandedIndex(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                activeCategory === category
                  ? "bg-[#6B122F] text-white shadow-md shadow-[#6B122F]/10"
                  : "bg-white border border-[#EFECE6] text-[#78716C] hover:border-[#6B122F]/20 hover:text-[#6B122F]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* --- DYNAMIC ACCORDION WRAPPER --- */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#EFECE6] rounded-3xl bg-white p-8">
            <HelpCircle size={32} className="mx-auto text-stone-300 mb-3" />
            <p className="text-sm font-medium text-[#78716C]">No answers match your specific parameters.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-[#EFECE6] bg-white overflow-hidden transition-all duration-300 hover:border-[#6B122F]/20 hover:shadow-sm"
                >
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-serif font-bold text-base text-[#1C1917] hover:text-[#6B122F] transition-colors"
                  >
                    <span className="leading-tight">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className={`shrink-0 text-stone-400 ${isExpanded ? "text-[#6B122F]" : ""}`}
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-[#78716C] font-medium border-t border-dashed border-[#FAF8F5]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* --- FOOTER CALL TO ACTION --- */}
        <div className="mt-16 rounded-3xl border border-[#EFECE6] bg-gradient-to-br from-white to-[#FAF8F5] p-8 text-center shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#1C1917]">Still have pending concerns?</h3>
          <p className="text-xs font-medium text-[#78716C] mt-1">Our customer experience agents are available live to guide you.</p>
          
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              to="/contact"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#6B122F] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#6B122F]/5 transition-all hover:bg-[#520B21]"
            >
              <MessageCircle size={14} /> Send Message
            </Link>
            <a 
              href="tel:+91XXXXXXXXXX"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#EFECE6] bg-white px-5 py-3 text-xs font-bold text-[#78716C] hover:border-[#6B122F]/20 hover:text-[#6B122F] transition-all"
            >
              <PhoneCall size={14} /> Call Helpline
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};