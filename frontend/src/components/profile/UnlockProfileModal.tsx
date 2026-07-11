import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Lock, X } from "lucide-react";

interface Props {
  open: boolean;
  freeUnlocksRemaining: number;
  isUnlocking: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * The popup shown the first time a member opens someone else's profile.
 * Spending a free unlock permanently reveals that profile's full details
 * (not contact info — that stays premium-gated separately via ContactGate).
 */
export const UnlockProfileModal = ({ open, freeUnlocksRemaining, isUnlocking, onCancel, onConfirm }: Props) => {
  const noUnlocksLeft = freeUnlocksRemaining <= 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="card relative w-full max-w-sm overflow-hidden p-7 text-center shadow-2xl"
          >
            <button
              onClick={onCancel}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1 text-muted transition-colors hover:bg-black/5 hover:text-foreground"
            >
              <X size={16} />
            </button>

            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                noUnlocksLeft ? "bg-line text-muted" : "bg-gold/15 text-gold"
              }`}
            >
              {noUnlocksLeft ? <Lock size={24} /> : <Sparkles size={24} />}
            </div>

            {noUnlocksLeft ? (
              <>
                <h3 className="font-display text-lg font-bold">Free Unlocks Used Up</h3>
                <p className="mt-2 text-sm text-muted">
                  You've used all 5 of your free profile unlocks. Upgrade to Premium for unlimited access to full
                  profile details.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button onClick={onCancel} className="btn-ghost">
                    Not Now
                  </button>
                  <Link to="/subscription" className="btn-gold">
                    Upgrade to Premium
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-display text-lg font-bold">Unlock This Profile?</h3>
                <p className="mt-2 text-sm text-muted">
                  You have <span className="font-bold text-maroon">{freeUnlocksRemaining}</span> free profile unlock
                  {freeUnlocksRemaining === 1 ? "" : "s"} remaining. Unlocking reveals this member's full profile
                  details, permanently, for free.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button onClick={onCancel} className="btn-ghost" disabled={isUnlocking}>
                    Cancel
                  </button>
                  <button onClick={onConfirm} className="btn-primary" disabled={isUnlocking}>
                    {isUnlocking ? "Unlocking..." : "Unlock Profile"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
