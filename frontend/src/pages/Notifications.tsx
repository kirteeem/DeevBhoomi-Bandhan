import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom"; // Hook used for redirecting
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  CheckCheck,
  Inbox,
  Clock,
  Settings,
  MoreVertical,
  User
} from "lucide-react";
import { api } from "../lib/axios";
import type { AppNotification } from "../types";

// Dynamic styling depending on notification type
const iconConfigFor = (type: AppNotification["type"]) => {
  switch (type) {
    case "new_interest":
    case "interest_accepted":
      return { icon: Heart, color: "text-rose-600 bg-rose-50 border-rose-100" };
    case "new_message":
      return { icon: MessageCircle, color: "text-blue-600 bg-blue-50 border-blue-100" };
    case "kundali_ready":
      return { icon: Sparkles, color: "text-amber-600 bg-amber-50 border-amber-100" };
    case "profile_verified":
      return { icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    default:
      return { icon: Bell, color: "text-slate-600 bg-slate-50 border-slate-100" };
  }
};

const timeAgo = (dateStr: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const Notifications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); 
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications-full"],
    queryFn: async () => (await api.get("/notifications")).data.data.notifications as AppNotification[],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications-full"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: async () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  
  const displayedNotifications = notifications?.filter(n => {
    if (filter === "unread") return !n.isRead;
    return true;
  }) ?? [];

  // Updated handler using 'relatedId' matching your backend schema
  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      await markReadMutation.mutateAsync(n._id);
    }

    // Direct user to the other person's profile on interest events. relatedId
    // points at the Interest document, not a user id, so we use fromUser
    // (the user this notification is about) to build the profile link.
    const isRequestType = n.type === "new_interest" || n.type === "interest_accepted";
    const fromUserId = typeof n.fromUser === "string" ? n.fromUser : n.fromUser?._id;
    if (isRequestType && fromUserId) {
      navigate(`/profile/${fromUserId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        
        {/* --- HERO TOP BANNER --- */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-zinc-200/60 pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6B1F2A]/10 text-[#6B1F2A] ring-4 ring-[#6B1F2A]/5">
              <Bell size={22} className="animate-swing" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
                Notification Center
              </h1>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''} requires attention` : "System optimal — all caught up"}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-xs transition-all hover:border-[#6B1F2A] hover:text-[#6B1F2A] active:scale-98"
            >
              <CheckCheck size={16} /> Mark all as read
            </button>
          )}
        </div>

        {/* --- MAIN GRID LAYOUT ARCHITECTURE --- */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT FILTER MANAGEMENT SIDEBAR */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
              <div className="px-2 py-1">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Filters</p>
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                    filter === "all"
                      ? "bg-[#6B1F2A] text-white shadow-sm shadow-red-950/10"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox size={16} />
                    <span>All Notifications</span>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] ${filter === "all" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"}`}>
                    {notifications?.length ?? 0}
                  </span>
                </button>

                <button
                  onClick={() => setFilter("unread")}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                    filter === "unread"
                      ? "bg-[#6B1F2A] text-white shadow-sm shadow-red-950/10"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} />
                    <span>Unread Only</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold ${filter === "unread" ? "bg-white text-[#6B1F2A]" : "bg-red-50 text-red-600"}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              </nav>

              <div className="border-t border-zinc-100 pt-3 mt-2 px-2 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                <span className="flex items-center gap-1"><Settings size={12}/> Configured Priorities</span>
                <span className="cursor-pointer hover:text-[#6B1F2A]">Manage</span>
              </div>
            </div>
          </aside>

          {/* RIGHT NOTIFICATIONS CONTAINER STREAM */}
          <main className="lg:col-span-8">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-zinc-100 bg-white p-5 flex gap-4">
                    <div className="h-11 w-11 rounded-xl bg-zinc-200" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 w-1/4 rounded bg-zinc-200" />
                      <div className="h-3 w-3/4 rounded bg-zinc-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center shadow-xs">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-400">
                  <Inbox size={24} />
                </div>
                <h3 className="text-sm font-bold text-zinc-800">No notifications here</h3>
                <p className="mt-1 max-w-xs text-xs text-zinc-400">
                  {filter === "unread" ? "You have read all platform updates." : "When you receive activity reports or matching updates, they will appear right here."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs divide-y divide-zinc-100">
                {displayedNotifications.map((n: any) => {
                  const config = iconConfigFor(n.type);
                  const Icon = config.icon;
                  const isRequestType = n.type === "new_interest" || n.type === "interest_accepted";
                  
                  return (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`group relative flex w-full items-start gap-4 p-5 text-left transition-all duration-200 hover:bg-zinc-50/80 cursor-pointer ${
                        !n.isRead ? "bg-[#6B1F2A]/[0.015]" : ""
                      }`}
                    >
                      {/* Left Unread Bar Highlight */}
                      {!n.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#6B1F2A]" />
                      )}

                      {/* Icon Component Container */}
                      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border shadow-xs ${config.color}`}>
                        <Icon size={18} />
                      </div>

                      {/* Content Blocks */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm tracking-tight ${!n.isRead ? "font-bold text-zinc-900" : "font-semibold text-zinc-700"}`}>
                            {n.title || "Update"}
                          </h4>
                          <span className="flex-shrink-0 text-[11px] font-medium text-zinc-400">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-500 max-w-2xl">
                          {n.body}
                        </p>

                        {/* Inline Button showing "View Profile" link */}
                        {isRequestType && (typeof n.fromUser === "string" ? n.fromUser : n.fromUser?._id) && (
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B1F2A] hover:underline">
                              <User size={14} /> View Profile
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Options context menu anchor */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center pl-2 hidden sm:block">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Stops routing events from executing on menu interaction
                          }}
                          className="p-1 rounded-lg hover:bg-zinc-200/60 text-zinc-400 hover:text-zinc-600"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
          
        </div>
      </div>
    </div>
  );
};