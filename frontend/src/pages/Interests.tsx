import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Check, X, Clock, BadgeCheck, Sparkles, 
  ArrowUpRight, ArrowDownLeft, ShieldCheck, Inbox, Flame
} from "lucide-react";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { getDisplayPhoto } from "../lib/media";

interface InterestUser {
  _id: string;
  fullName: string;
  gender?: string;
  isProfileVerified?: boolean;
  photos?: { url: string; isProfilePhoto?: boolean }[];
}

interface InterestItem {
  _id: string;
  sender: InterestUser;
  receiver: InterestUser;
  status: "pending" | "accepted" | "declined";
  message?: string;
  createdAt: string;
}

const statusConfig: Record<InterestItem["status"], { wrapper: string; indicator: string }> = {
  pending: { 
    wrapper: "bg-amber-50/60 text-amber-800 border border-amber-200/50", 
    indicator: "bg-amber-500 animate-pulse" 
  },
  accepted: { 
    wrapper: "bg-emerald-50/60 text-emerald-800 border border-emerald-200/50", 
    indicator: "bg-emerald-500" 
  },
  declined: { 
    wrapper: "bg-rose-50/60 text-rose-800 border border-rose-200/50", 
    indicator: "bg-rose-500" 
  },
};

export const Interests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"received" | "sent">("received");

  const { data: interests, isLoading } = useQuery({
    queryKey: ["interests", tab],
    queryFn: async () => (await api.get(`/interests?direction=${tab}`)).data.data.interests as InterestItem[],
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "declined" }) =>
      api.patch(`/interests/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interests"] });
      queryClient.invalidateQueries({ queryKey: ["interests-received"] });
    },
  });

  const list = interests ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50/50 text-zinc-900 antialiased selection:bg-rose-100">
      
      {/* --- ELITE DESIGN AMBIENT DECORATION --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-rose-500/5 to-transparent blur-[130px]" />
        <div className="absolute bottom-[20%] left-[-5%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-amber-500/5 to-transparent blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* --- DYNAMIC HEADER REGION --- */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-zinc-200/80 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700 border border-rose-200/40">
              <Flame size={12} className="fill-current" /> Relationship Core
            </div>
            <h1 className="font-serif text-3xl font-extrabold tracking-tight text-zinc-950 md:text-4xl">
              Proposals & Connection Ledger
            </h1>
            <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
              Monitor lifecycle milestones, track incoming proposal matrices, and engage with potential complementary profiles.
            </p>
          </div>

          {/* CUSTOM ARCHITECTURAL TOGGLE */}
          <div className="inline-flex rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm shadow-zinc-100/80">
            <button
              onClick={() => setTab("received")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                tab === "received" 
                  ? "bg-zinc-950 text-white shadow-md shadow-zinc-950/10" 
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <ArrowDownLeft size={13} className={tab === "received" ? "text-rose-400" : ""} /> Received Requests
            </button>
            <button
              onClick={() => setTab("sent")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                tab === "sent" 
                  ? "bg-zinc-950 text-white shadow-md shadow-zinc-950/10" 
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <ArrowUpRight size={13} className={tab === "sent" ? "text-amber-400" : ""} /> Outbound Sent
            </button>
          </div>
        </div>

        {/* --- MAIN INTERFACE SECTION --- */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-950" />
              <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-zinc-400">Querying Network Layers...</p>
            </div>
          ) : list.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-dashed border-zinc-200 bg-white/60 backdrop-blur-sm p-12 text-center shadow-sm max-w-xl mx-auto mt-6"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 border border-zinc-200/60">
                <Inbox size={20} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-zinc-900">No entries recorded in this vector</h3>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                {tab === "received" 
                  ? "You have no passive proposal vectors pending alignment evaluation at this time." 
                  : "You have not initialized any external engagement vectors yet."}
              </p>
              <div className="mt-6">
                <Link to="/matches" className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-bold tracking-wide text-white hover:bg-zinc-900 transition-transform hover:translate-y-[-1px]">
                  Discover Active Matches
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {list.map((interest) => {
                  const person = tab === "received" ? interest.sender : interest.receiver;
                  const primaryPhoto = person.photos?.find((p) => p.isProfilePhoto) ?? person.photos?.[0];
                  const photoUrl = getDisplayPhoto(primaryPhoto?.url);
                  const currentStatus = statusConfig[interest.status] || statusConfig.pending;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      key={interest._id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm shadow-zinc-100/80 transition-all duration-300 hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-200/40"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={photoUrl} 
                            alt={person.fullName} 
                            className="h-20 w-20 rounded-xl object-cover ring-1 ring-zinc-200 group-hover:scale-[1.02] transition-transform duration-300" 
                          />
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Link 
                              to={`/profile/${person._id}`} 
                              className="font-serif text-base font-bold tracking-tight text-zinc-950 hover:text-zinc-700 truncate"
                            >
                              {person.fullName}
                            </Link>
                            {person.isProfileVerified && (
                              <BadgeCheck size={15} className="text-emerald-600 flex-shrink-0"/>
                            )}
                          </div>

                          {/* DYNAMIC PILL STATUS INDICATOR */}
                          <div className="flex items-center">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${currentStatus.wrapper}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.indicator}`} />
                              <Clock size={10} /> {interest.status}
                            </span>
                          </div>

                          {interest.message && (
                            <div className="relative rounded-xl bg-zinc-50 border border-zinc-100 p-2.5 mt-2">
                              <p className="text-xs text-zinc-500 italic leading-relaxed break-words">
                                "{interest.message}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS ROW MODULE */}
                      <div className="mt-5 flex items-center justify-end gap-2 border-t border-zinc-100 pt-3.5">
                        {tab === "received" && interest.status === "pending" && (
                          <>
                            <button
                              onClick={() => respondMutation.mutate({ id: interest._id, status: "declined" })}
                              disabled={respondMutation.isPending}
                              className="inline-flex items-center justify-center h-9 rounded-xl border border-zinc-200 bg-white px-4 text-xs font-bold text-zinc-500 transition-colors hover:border-rose-200 hover:bg-rose-50/40 hover:text-rose-700 disabled:opacity-40"
                            >
                              <X size={13} className="mr-1" /> Dismiss
                            </button>
                            <button
                              onClick={() => respondMutation.mutate({ id: interest._id, status: "accepted" })}
                              disabled={respondMutation.isPending}
                              className="inline-flex items-center justify-center h-9 rounded-xl bg-zinc-950 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-40"
                            >
                              <Check size={13} className="mr-1 text-emerald-400" /> Accept Proposal
                            </button>
                          </>
                        )}
                        {interest.status === "accepted" && (
                          <Link
                            to="/kundali"
                            className="inline-flex w-full sm:w-auto items-center justify-center h-9 gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2 text-xs font-bold tracking-wide uppercase text-white shadow-md shadow-amber-600/10 transition-transform hover:translate-y-[-1px]"
                          >
                            <Sparkles size={12} className="text-amber-200" /> Compute Kundali Alignment
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* --- SECURITY DISCLAIMER FOOTER --- */}
        {!user && (
          <div className="mt-10 text-center rounded-2xl border border-zinc-200 bg-white/40 p-4 backdrop-blur-sm max-w-sm mx-auto">
            <p className="text-xs font-medium text-zinc-500">
              Please authenticate your credentials to interact with pipeline streams.
            </p>
          </div>
        )}
        
        <div className="mt-16 flex items-center justify-center gap-1.5 text-center text-[11px] text-zinc-400">
          <ShieldCheck size={14} className="text-emerald-600" /> High-security isolation layer protecting profile data integrity.
        </div>

      </div>
    </div>
  );
};
