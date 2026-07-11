import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";

interface Props {
  freeUnlocksRemaining: number;
  onUnlockClick: () => void;
}

/**
 * Shown in place of the About/Education/Family/Horoscope/Gallery sections
 * when the viewer hasn't spent a free unlock (or gone premium) on this
 * specific profile yet. Basic info (age, height, district, occupation,
 * education) is already visible up in ProfileHero.
 */
export const LockedDetailsCard = ({ freeUnlocksRemaining, onUnlockClick }: Props) => {
  const noUnlocksLeft = freeUnlocksRemaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card relative overflow-hidden p-8 text-center"
    >
      <div className="absolute -right-8 -top-8 rotate-12 text-maroon/5 pointer-events-none">
        <Lock size={140} />
      </div>
      <div
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
          noUnlocksLeft ? "bg-line text-muted" : "bg-maroon/10 text-maroon"
        }`}
      >
        {noUnlocksLeft ? <Lock size={24} /> : <Sparkles size={24} />}
      </div>

      <h3 className="font-display text-lg font-bold">
        {noUnlocksLeft ? "Upgrade to See Full Details" : "Full Profile Details Locked"}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        {noUnlocksLeft
          ? "About, family, horoscope, lifestyle, partner preferences and the full photo gallery are visible to Premium members."
          : "About, family, horoscope, lifestyle, partner preferences and the full photo gallery unlock permanently once you use one of your free unlocks."}
      </p>

      <button onClick={onUnlockClick} className="btn-primary mt-6">
        {noUnlocksLeft ? "View Upgrade Options" : `Unlock Profile (${freeUnlocksRemaining} left)`}
      </button>
    </motion.div>
  );
};
