import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, GraduationCap, Home, Heart, Moon, ArrowLeft, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { unlockProfile } from "../lib/profileApi";
import { AboutSection } from "../components/profile/AboutSection";
import { ProfileGallery } from "../components/profile/ProfileGallery";
import { LockedDetailsCard } from "../components/profile/LockedDetailsCard";
import { UnlockProfileModal } from "../components/profile/UnlockProfileModal";
import { ContactGate } from "../components/profile/ContactGate";
import type { Profile } from "../types";

interface ProfileViewResponse {
  profile: Profile;
  restrictedView: boolean;
  isOwnProfile: boolean;
  isShortlisted: boolean;
  profileViewsRemaining: number | null;
  detailsUnlocked: boolean;
  freeUnlocksRemaining: number;
}

export const ProfilePreview = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [interestState, setInterestState] = useState<"idle" | "sent" | "pending">("idle");
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  // GET /api/profiles/:userId — the single source of truth for what this
  // viewer is allowed to see. Premium members always get detailsUnlocked:
  // true from the backend (see profileController.js `viewerIsPremium`), so
  // once user.isPremium is correctly reported, this just works.
  const { data, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => (await api.get<{ data: ProfileViewResponse }>(`/profiles/${userId}`)).data.data,
    enabled: !!userId,
  });

  const { data: sentInterests } = useQuery({
    queryKey: ["interests-sent"],
    queryFn: async () => (await api.get("/interests?direction=sent")).data.data.interests as any[],
    enabled: !!userId && !data?.isOwnProfile,
  });

  const { data: receivedInterests } = useQuery({
    queryKey: ["interests-received"],
    queryFn: async () => (await api.get("/interests?direction=received")).data.data.interests as any[],
    enabled: !!userId && !data?.isOwnProfile,
  });

  const sendInterest = useMutation({
    mutationFn: () => api.post("/interests", { receiverId: userId }),
    onMutate: () => setInterestState("pending"),
    onSuccess: () => {
      setInterestState("sent");
      queryClient.invalidateQueries({ queryKey: ["interests-sent"] });
    },
    onError: () => setInterestState("idle"),
  });

  const unlockMutation = useMutation({
    mutationFn: () => unlockProfile(userId as string),
    onSuccess: () => {
      setUnlockModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-maroon border-t-transparent"></div>
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="mx-auto max-w-md py-24 text-center px-4">
        <h3 className="text-xl font-bold font-serif text-neutral-800">Profile Not Found</h3>
        <button onClick={() => navigate("/dashboard")} className="mt-4 inline-block text-sm text-maroon underline font-medium">
          Go Back Home
        </button>
      </div>
    );
  }

  const { profile, isOwnProfile, detailsUnlocked, freeUnlocksRemaining } = data;
  console.log("API RESPONSE", data);
  console.log("PROFILE OBJECT", data.profile);

  // Whether interest is mutually accepted — passed down to ContactGate as a
  // hint only. The actual unlock decision (mutual interest, Premium reveal,
  // or own profile) is made server-side by GET/POST /profiles/:userId/contact,
  // which is a separate gate from `detailsUnlocked` (About/Family/etc below).
  const mutualInterestAccepted =
    (sentInterests ?? []).some((i: any) => (i.receiver?._id ?? i.receiver) === userId && i.status === "accepted") ||
    (receivedInterests ?? []).some((i: any) => (i.sender?._id ?? i.sender) === userId && i.status === "accepted");

  const onUnlockClick = () => {
    if (!user?.isPremium) {
      setUnlockModalOpen(true);
      return;
    }
    unlockMutation.mutate();
  };

  // Find dynamic profile photo matching backend schema arrays
  const profilePhoto =
    (profile as any).photos?.find((photo: any) => photo.isProfilePhoto) ||
    (profile as any).photos?.[0];

  // Concatenate server URL environment variables safely for relative endpoints
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const userMainImage = profilePhoto?.url
    ? profilePhoto.url.startsWith("http") ? profilePhoto.url : `${baseUrl}${profilePhoto.url}`
    : "";

  // FIXED: Cast profile fields to avoid missing explicit property interface types compiled validation issues
 // FIXED: Cast profile to any to resolve the missing 'fullName' type error
const userCombinedName = (profile as any).fullName || `${(profile as any).firstName || ""} ${(profile as any).lastName || ""}`.trim() || "Verified Member";
  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans antialiased text-neutral-800 selection:bg-maroon/10 selection:text-maroon">
      
      {/* Absolute Header Actions */}
      <div className="absolute top-6 left-6 z-30">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-xs font-bold tracking-wider text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white"
        >
          <ArrowLeft size={14} /> BACK TO MATCHES
        </button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* LEFT COMPONENT: HIGH CONTEXT PERSISTENT PICTURE VIEW */}
        <div className="relative w-full lg:w-[45%] h-[65vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden bg-neutral-900">
          {userMainImage ? (
            <img 
              src={userMainImage} 
              alt={userCombinedName}
              className="w-full h-full object-cover object-top filter brightness-[0.93]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-stone-200 text-stone-400 gap-2">
              <User size={48} strokeWidth={1} />
              <span className="text-xs font-medium tracking-wider">No Photo Uploaded</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* Dynamic Details Frame Over Photo */}
          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white">
            <div className="flex items-center gap-2.5 mb-2.5">
              {(profile.religion || profile.caste) && (
                <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {profile.religion} {profile.caste ? `• ${profile.caste}` : ""}
                </span>
              )}
              {user?.isPremium && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-900">
                  <Sparkles size={10} fill="currentColor" /> Premium Verified
                </span>
              )}
            </div>
            
            <h1 className="font-serif text-4xl lg:text-5xl font-light tracking-wide text-white">
              {userCombinedName}
              {/* FIXED: Dynamic Inline Assertion */}
              {(profile as any).age && (
                <>
                  <span className="font-sans font-light text-white/80">, {(profile as any).age}</span>
                </>
              )}
            </h1>

            {profile.occupation?.title && (
              <p className="mt-2 text-sm text-neutral-300 font-light max-w-md">
                {profile.occupation.title} {profile.occupation.company ? `at ${profile.occupation.company}` : ""} 
                {profile.city ? ` • Based in ${profile.city}` : ""}
              </p>
            )}

            {/* Quick Primary Actions */}
            {!isOwnProfile && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => interestState === "idle" && sendInterest.mutate()}
                  disabled={interestState !== "idle"}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold tracking-wider uppercase shadow-xl transition-all ${
                    interestState === "sent" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-[#800020] text-white hover:bg-[#600018] active:scale-95"
                  }`}
                >
                  {interestState === "pending" && <Loader2 size={14} className="animate-spin" />}
                  {interestState === "sent" && <CheckCircle2 size={14} />}
                  {interestState === "idle" && "Express Interest"}
                  {interestState === "sent" && "Interest Sent"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT: METICULOUS STRUCTURAL DETAILS GRID */}
        <div className="w-full lg:w-[55%] px-6 py-12 lg:p-20 overflow-y-auto">
          <div className="max-w-2xl space-y-12">
            
            {/* Gated Access Layer Module */}
            {!isOwnProfile && userId && (
              <div className="focus-within:ring-0">
                <ContactGate userId={userId} mutualInterestAccepted={mutualInterestAccepted} />
              </div>
            )}

            {/* Structured Specifications Data */}
            <div className="space-y-12">
              {detailsUnlocked ? (
                <>
                  <AboutSection aboutMe={profile.aboutMe} />

                  <div className="space-y-6 pt-4">
  {/* SECTION TITLE */}
  <div className="border-b border-line pb-2">
    <h2 className="font-display font-bold tracking-wide text-neutral-900 uppercase text-xs">
      Profile Specifications
    </h2>
  </div>

  <div className="grid gap-6 sm:grid-cols-2">
    {/* Basic Details Card */}
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center gap-2.5 text-maroon">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-maroon/10">
          <User size={15} />
        </div>
        <h3 className="font-display text-sm font-bold tracking-wide text-neutral-800">Basic Details</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
        {[
          { label: "Height", value: profile.heightCm ? `${profile.heightCm} cm` : undefined },
          { label: "Marital Status", value: profile.maritalStatus?.replace(/_/g, " ") },
          { label: "Manglik Status", value: profile.manglik?.replace(/_/g, " ") },
          { label: "Religion", value: profile.religion },
          { label: "Caste / Sub-caste", value: profile.caste },
          { label: "Current City", value: profile.city },
        ].map((item, idx) => item.value && (
          <div key={idx} className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase mb-0.5">{item.label}</span>
            <span className="font-medium text-neutral-800 truncate capitalize">{item.value}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Education & Career Card */}
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center gap-2.5 text-maroon">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-maroon/10">
          <GraduationCap size={15} />
        </div>
        <h3 className="font-display text-sm font-bold tracking-wide text-neutral-800">Education & Career</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
        {[
          { label: "Degree", value: profile.education?.degree },
          { label: "Field of Study", value: profile.education?.field },
          { label: "Institution", value: profile.education?.college },
          { label: "Occupation", value: profile.occupation?.title },
          { label: "Organization", value: profile.occupation?.company },
          { label: "Annual Income", value: profile.occupation?.annualIncomeRange },
        ].map((item, idx) => item.value && (
          <div key={idx} className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase mb-0.5">{item.label}</span>
            <span className="font-medium text-neutral-800 truncate capitalize">{item.value}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Horoscope Matrix Card */}
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center gap-2.5 text-maroon">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-maroon/10">
          <Moon size={15} />
        </div>
        <h3 className="font-display text-sm font-bold tracking-wide text-neutral-800">Astro & Horoscope</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
        {[
          { label: "Birth Place", value: (profile as any).horoscope?.birthPlace },
          { label: "Moon Sign (Rashi)", value: (profile as any).horoscope?.rashi },
          { label: "Nakshatra", value: (profile as any).horoscope?.nakshatra },
        ].map((item, idx) => item.value && (
          <div key={idx} className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase mb-0.5">{item.label}</span>
            <span className="font-medium text-neutral-800 truncate capitalize">{item.value}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Family & Lifestyle Card */}
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center gap-2.5 text-maroon">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-maroon/10">
          <Home size={15} />
        </div>
        <h3 className="font-display text-sm font-bold tracking-wide text-neutral-800">Family & Lifestyle</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
        {[
          { label: "Family Layout", value: profile.family?.familyType },
          { label: "Dietary Preference", value: profile.lifestyle?.diet?.replace(/_/g, " ") },
          { label: "Smoking Habits", value: profile.lifestyle?.smoking },
          { label: "Drinking Habits", value: profile.lifestyle?.drinking },
        ].map((item, idx) => item.value && (
          <div key={idx} className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase mb-0.5">{item.label}</span>
            <span className="font-medium text-neutral-800 truncate capitalize">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Partner Preferences Banner Style Card */}
  <div className="rounded-2xl border border-line bg-stone-50/60 p-5 shadow-sm transition-all hover:shadow-md sm:col-span-2">
    <div className="mb-4 flex items-center gap-2.5 text-maroon">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-maroon/10">
        <Heart size={15} />
      </div>
      <h3 className="font-display text-sm font-bold tracking-wide text-neutral-800">Partner Expectations</h3>
    </div>
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs sm:grid-cols-4">
      {[
        {
          label: "Age Range",
          value: profile.partnerPreference?.ageMin || profile.partnerPreference?.ageMax
            ? `${profile.partnerPreference?.ageMin ?? "–"} to ${profile.partnerPreference?.ageMax ?? "–"} yrs`
            : undefined,
        },
        {
          label: "Min Height",
          value: profile.partnerPreference?.heightMinCm ? `${profile.partnerPreference.heightMinCm} cm` : undefined,
        },
        { label: "Preferred Cities", value: profile.partnerPreference?.districts?.join(", ") },
        { label: "Education Level", value: profile.partnerPreference?.education?.join(", ") },
      ].map((item, idx) => item.value && (
        <div key={idx} className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold tracking-wider text-muted uppercase mb-0.5">{item.label}</span>
          <span className="font-medium text-neutral-800 leading-tight">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
</div>

                  <div className="pt-6">
                    <ProfileGallery profile={profile} />
                  </div>
                </>
              ) : (
                !isOwnProfile && <LockedDetailsCard freeUnlocksRemaining={freeUnlocksRemaining} onUnlockClick={onUnlockClick} />
              )}
            </div>

          </div>
        </div>

      </div>

      <UnlockProfileModal
        open={unlockModalOpen}
        freeUnlocksRemaining={freeUnlocksRemaining}
        isUnlocking={unlockMutation.isPending}
        onCancel={() => setUnlockModalOpen(false)}
        onConfirm={() => unlockMutation.mutate()}
      />
    </div>
  );
};