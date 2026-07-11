import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Lock, Crown, Heart, User } from "lucide-react";
import type { Profile } from "../../types";
import { getDisplayPhoto } from "../../lib/media";
import { api } from "../../lib/axios";
import { useProfileGate } from "../../context/ProfileGateContext";

export const ProfileCard = ({ profile }: { profile: Profile }) => {
  const queryClient = useQueryClient();
  const { guardBrowse } = useProfileGate();
  const [likeSent, setLikeSent] = useState(Boolean(profile.interestSent));

  // Age calculation
  const age = profile.dateOfBirth
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const primaryPhoto = profile.photos?.find((p) => p.isProfilePhoto) ?? profile.photos?.[0];

 const photoUrl = getDisplayPhoto(primaryPhoto?.url);
  const isLocked = Boolean(profile.isLocked);

  const likeMutation = useMutation({
    mutationFn: async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return api.post("/interests", { receiverId: profile.user._id });
    },
    onMutate: () => setLikeSent(true),
    onError: () => setLikeSent(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interests-sent"] });
    },
  });

  return (
    <Link
      to={isLocked ? "/pricing" : `/profile/${profile.user._id}`}
      onClick={(e) => {
        if (isLocked) return;
        if (!guardBrowse()) {
          e.preventDefault();
        }
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-maroon/5"
    >
      {/* Expanded Profile Photo Container */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-100">
       {photoUrl ? (
  <img
    src={photoUrl}
    alt={profile.user.fullName}
    loading="lazy"
  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "";
    }}
  />
) : (
  <div className="flex h-full w-full items-center justify-center bg-slate-100">
    <User className="h-16 w-16 text-slate-300" />
  </div>
)}
        {/* Soft elegant shadow mask */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

        {/* Floating Interactive Action */}
        {!isLocked && (
          <button
            onClick={(e) => !likeSent && likeMutation.mutate(e)}
            disabled={likeSent}
            aria-label="Send interest"
            className={`absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
              likeSent
                ? "bg-maroon text-white"
                : "bg-white/90 text-maroon hover:scale-110 hover:bg-white"
            }`}
          >
            <Heart size={18} fill={likeSent ? "currentColor" : "none"} />
          </button>
        )}

        {/* Lock State UI */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/50 text-center text-white backdrop-blur-[2px]">
            <span className="flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-950">
              <Crown size={12} className="fill-current" /> Premium
            </span>
            <div className="flex items-center gap-1.5 text-sm font-semibold tracking-wide">
              <Lock size={14} /> Upgrade to View
            </div>
          </div>
        )}
      </div>

      {/* Structured Details Grid */}
      <div className="flex flex-1 flex-col p-6">
        {/* Header Block: Name & Age */}
        <div className="flex items-baseline justify-between gap-2 border-b border-slate-50 pb-3">
          <h3 className="font-sans text-xl font-extrabold tracking-tight text-slate-800 transition-colors group-hover:text-maroon line-clamp-1">
            {isLocked ? "Premium Member" : profile.user.fullName}
          </h3>
          
          {age && !isLocked && (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 font-mono text-xs font-bold text-maroon">
              <User size={12} className="text-maroon/70" />
              {age} Yrs
            </span>
          )}
        </div>

        {/* Location Block: District */}
        <div className="mt-3.5 flex items-center gap-2 text-sm font-medium text-slate-500">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 transition-colors group-hover:bg-rose-50/50">
            <MapPin size={15} className="shrink-0 text-slate-400 transition-colors group-hover:text-maroon" />
          </div>
          <span className="tracking-wide">{profile.district ? `${profile.district}, HP` : "Himachal Pradesh"}</span>
        </div>
      </div>
    </Link>
  );
};