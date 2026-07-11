import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, Phone, Mail, MapPin, Loader2, Crown, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchContactDetails, unlockContactDetails } from "../../lib/profileApi";
import { useAuth } from "../../context/AuthContext";

interface Props {
  userId: string;
  /** true once a mutually accepted interest exists between the two members */
  mutualInterestAccepted: boolean;
}

export const ContactGate = ({ userId, mutualInterestAccepted }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["contact-details", userId],
    queryFn: () => fetchContactDetails(userId),
    enabled: !!userId,
  });

  const unlockMutation = useMutation({
    mutationFn: () => unlockContactDetails(userId),
    onSuccess: () => {
      setError("");
      queryClient.invalidateQueries({ queryKey: ["contact-details", userId] });
    },
    onError: (err: any) => setError(err?.response?.data?.message || "Unable to unlock contact details."),
  });

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-line bg-white p-6 shadow-sm">
        <Loader2 size={24} className="animate-spin text-maroon/70" />
      </div>
    );
  }

  const unlocked = data?.contactUnlocked;
  const remaining = user?.isPremium ? data?.planUnlocksRemaining : data?.freeUnlocksRemaining;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:shadow-md"
    >
      {/* Upper Status Bar */}
      <div className={`flex items-center justify-between border-b border-line px-6 py-3.5 text-xs font-medium tracking-wide uppercase ${unlocked ? "bg-forest/5" : "bg-stone-50"}`}>
        <div className="flex items-center gap-2">
          {unlocked ? (
            <span className="flex items-center gap-1.5 text-forest">
              <CheckCircle2 size={14} /> Verified Connection
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-muted">
              <Lock size={13} /> Secure Verification Required
            </span>
          )}
        </div>
        
        {/* Plan / Quota Badge */}
        <div>
          {user?.isPremium ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200/60">
              <Crown size={12} className="fill-amber-500 text-amber-500" /> 
              {remaining ?? 0} Premium Unlocks Left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/60">
              {remaining ?? 0} Free Unlocks Remaining
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {unlocked ? (
            <motion.div 
              key="unlocked"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-4"
            >
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-900">Contact Information</h3>
                <p className="text-xs text-muted">Direct communication access granted for this profile.</p>
              </div>

              {/* Data Grid */}
              <div className="grid gap-3 text-sm sm:grid-cols-1">
                {data?.contact?.phone && (
                  <div className="flex items-center gap-3 rounded-xl border border-line bg-stone-50/50 px-4 py-3 transition-colors hover:bg-stone-50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-maroon/10 text-maroon">
                      <Phone size={15} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium tracking-wider text-muted uppercase">Phone Number</span>
                      <span className="font-medium text-neutral-800 truncate">{data.contact.phone}</span>
                    </div>
                  </div>
                )}
                
                {data?.contact?.email && (
                  <div className="flex items-center gap-3 rounded-xl border border-line bg-stone-50/50 px-4 py-3 transition-colors hover:bg-stone-50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-maroon/10 text-maroon">
                      <Mail size={15} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium tracking-wider text-muted uppercase">Email Address</span>
                      <span className="font-medium text-neutral-800 truncate">{data.contact.email}</span>
                    </div>
                  </div>
                )}
                
                {data?.contact?.address && (
                  <div className="flex items-start gap-3 rounded-xl border border-line bg-stone-50/50 px-4 py-3 transition-colors hover:bg-stone-50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-maroon/10 text-maroon mt-0.5">
                      <MapPin size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium tracking-wider text-muted uppercase">Location Details</span>
                      <span className="font-medium text-neutral-800 leading-relaxed">{data.contact.address}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link 
                  to="/kundali" 
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold tracking-wide shadow-sm"
                >
                  <Sparkles size={16} /> Request Kundali Match
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="locked"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center max-w-md mx-auto"
            >
              {/* Central Lock Graphics */}
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                <Lock size={26} strokeWidth={1.75} />
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-maroon/10 flex items-center justify-center text-maroon">
                  <span className="text-[10px] font-bold">!</span>
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-neutral-900">Contact Details Protected</h3>
              
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {mutualInterestAccepted
                  ? "Great news! Your mutual interest is accepted. Go ahead and unlock full access."
                  : "To protect family privacy, direct contact channels are hidden until a matching invitation or mutual interest is established."}
              </p>

              {/* Action Buttons Container */}
              <div className="mt-5 w-full space-y-3">
                {user?.isPremium ? (
                  <>
                    <button
                      onClick={() => unlockMutation.mutate()}
                      disabled={unlockMutation.isPending || remaining === 0}
                      className="btn-primary w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold tracking-wide disabled:opacity-50"
                    >
                      {unlockMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Unlocking Profile...
                        </>
                      ) : remaining === 0 ? (
                        "No unlocks left in current quota"
                      ) : (
                        `Instant Premium Unlock (${remaining} remaining)`
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => unlockMutation.mutate()}
                      disabled={unlockMutation.isPending || !mutualInterestAccepted}
                      className="btn-primary w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold tracking-wide disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-200"
                    >
                      {unlockMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Authorizing...
                        </>
                      ) : mutualInterestAccepted ? (
                        `Reveal Contact Access (${remaining} Left)`
                      ) : (
                        "Awaiting Mutual Interest Acceptance"
                      )}
                    </button>

                    {!mutualInterestAccepted && (
                      <div className="flex items-start gap-2 rounded-xl bg-stone-50 p-3 text-left border border-stone-150">
                        <AlertCircle size={15} className="mt-0.5 shrink-0 text-stone-500" />
                        <p className="text-xs text-muted leading-normal">
                          Send an interest connection request. Once both families accept, phone, address, and email profiles activate safely automatically.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Unified Error Handling bar */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg bg-rose-50 border border-rose-100 p-2.5 text-center text-xs font-medium text-rose-600"
                  >
                    {error}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};