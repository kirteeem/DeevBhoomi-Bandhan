import { motion } from "framer-motion";
import { Sun } from "lucide-react";

/**
 * "Today's Shubh Muhurat" floating widget.
 * Currently static placeholder values — wire up to a real Panchang API/backend
 * endpoint later and swap the hardcoded tithi/nakshatra/time below.
 */
export const MuhuratWidget = () => (
  <section className="bg-cream px-6 py-16">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl rounded-[28px] bg-gradient-to-r from-gold-soft via-maroon to-forest p-[2px]"
    >
      <div className="grid items-center gap-8 rounded-[26px] bg-cream p-8 sm:grid-cols-[auto_1fr_auto] sm:p-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-soft to-gold text-[#3a2c06]"
        >
          <Sun size={28} />
        </motion.div>

        <div className="font-hindi grid grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted">आज की तिथि</div>
            <div className="text-lg font-extrabold">तृतीया</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted">नक्षत्र</div>
            <div className="text-lg font-extrabold">रोहिणी</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted">शुभ मुहूर्त</div>
            <div className="text-lg font-extrabold">6:12–8:40 AM</div>
          </div>
        </div>

        <p className="font-hindi max-w-[180px] text-right text-sm italic text-muted sm:text-right">
          "शुभस्य शीघ्रम् — शुभ कार्य में देर न करें।"
        </p>
      </div>
    </motion.div>
  </section>
);
