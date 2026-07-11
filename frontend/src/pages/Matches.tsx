import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  SlidersHorizontal, Search, Users, X, Filter, ChevronDown, RotateCcw,
} from "lucide-react";
import { api } from "../lib/axios";
import { ProfileCard } from "../components/ui/ProfileCard";
import type { Profile } from "../types";

const districts = ["Shimla", "Mandi", "Kullu", "Kangra", "Hamirpur", "Una", "Bilaspur", "Solan", "Sirmaur", "Chamba", "Kinnaur", "Lahaul-Spiti"];
const maritalStatuses = [
  { value: "never_married", label: "Never Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "awaiting_divorce", label: "Awaiting Divorce" },
];
const manglikOptions = [
  { value: "yes", label: "Manglik" },
  { value: "no", label: "Non-Manglik" },
  { value: "dont_know", label: "Don't Know" },
];
const habitOptions = [
  { value: "no", label: "No" },
  { value: "occasionally", label: "Occasionally" },
  { value: "yes", label: "Yes" },
];
const familyTypes = [
  { value: "nuclear", label: "Nuclear" },
  { value: "joint", label: "Joint" },
];
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "recentlyActive", label: "Recently Active" },
  { value: "highestMatch", label: "Highest Match" },
  { value: "premium", label: "Premium Members" },
  { value: "verified", label: "Verified Members" },
];

type Filters = {
  district: string;
  minAge: string;
  maxAge: string;
  minHeight: string;
  maxHeight: string;
  education: string;
  profession: string;
  income: string;
  religion: string;
  community: string;
  maritalStatus: string;
  manglik: string;
  smoking: string;
  drinking: string;
  familyType: string;
};

const emptyFilters: Filters = {
  district: "", minAge: "", maxAge: "", minHeight: "", maxHeight: "",
  education: "", profession: "", income: "", religion: "", community: "",
  maritalStatus: "", manglik: "", smoking: "", drinking: "", familyType: "",
};

export const Matches = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters, district: searchParams.get("district") ?? "" });
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const setFilter = (key: keyof Filters, value: string) => setFilters((f) => ({ ...f, [key]: value }));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } = useInfiniteQuery({
    queryKey: ["matches", filters, sortBy],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string> = { page: String(pageParam), limit: "12", sortBy };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const { data } = await api.get("/matches", { params });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

  const allProfiles: Profile[] = data?.pages.flatMap((p) => p.results) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const viewerIsPremium = data?.pages[0]?.viewerIsPremium ?? false;

  const profiles = useMemo(() => {
    if (!searchTerm.trim()) return allProfiles;
    const q = searchTerm.trim().toLowerCase();
    return allProfiles.filter(
      (p) =>
        p.user.fullName?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.occupation?.title?.toLowerCase().includes(q) ||
        p.education?.degree?.toLowerCase().includes(q)
    );
  }, [allProfiles, searchTerm]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters, sortBy]);

  const resetFilters = () => setFilters(emptyFilters);

  const FilterField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );

  const selectClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10";
  const inputClass = selectClass;

  const FiltersPanel = (
    <div className="space-y-6">
      <FilterField label="District / Region">
        <select value={filters.district} onChange={(e) => setFilter("district", e.target.value)} className={selectClass}>
          <option value="">All Districts (Himachal)</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Age Range">
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={filters.minAge} onChange={(e) => setFilter("minAge", e.target.value)} className={`${inputClass} text-center`} />
          <span className="text-xs font-medium text-slate-400">to</span>
          <input type="number" placeholder="Max" value={filters.maxAge} onChange={(e) => setFilter("maxAge", e.target.value)} className={`${inputClass} text-center`} />
        </div>
      </FilterField>

      <FilterField label="Height (cm)">
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={filters.minHeight} onChange={(e) => setFilter("minHeight", e.target.value)} className={`${inputClass} text-center`} />
          <span className="text-xs font-medium text-slate-400">to</span>
          <input type="number" placeholder="Max" value={filters.maxHeight} onChange={(e) => setFilter("maxHeight", e.target.value)} className={`${inputClass} text-center`} />
        </div>
      </FilterField>

      <FilterField label="Education">
        <input type="text" placeholder="e.g. B.Tech, MBA" value={filters.education} onChange={(e) => setFilter("education", e.target.value)} className={inputClass} />
      </FilterField>

      <FilterField label="Profession">
        <input type="text" placeholder="e.g. Doctor, Engineer" value={filters.profession} onChange={(e) => setFilter("profession", e.target.value)} className={inputClass} />
      </FilterField>

      <FilterField label="Annual Income">
        <input type="text" placeholder="e.g. 5-10 LPA" value={filters.income} onChange={(e) => setFilter("income", e.target.value)} className={inputClass} />
      </FilterField>

      <FilterField label="Religion">
        <input type="text" placeholder="e.g. Hindu" value={filters.religion} onChange={(e) => setFilter("religion", e.target.value)} className={inputClass} />
      </FilterField>

      <FilterField label="Community / Caste">
        <input type="text" placeholder="e.g. Rajput, Brahmin" value={filters.community} onChange={(e) => setFilter("community", e.target.value)} className={inputClass} />
      </FilterField>

      <FilterField label="Marital Status">
        <select value={filters.maritalStatus} onChange={(e) => setFilter("maritalStatus", e.target.value)} className={selectClass}>
          <option value="">Any</option>
          {maritalStatuses.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Manglik">
        <select value={filters.manglik} onChange={(e) => setFilter("manglik", e.target.value)} className={selectClass}>
          <option value="">Any</option>
          {manglikOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Smoking">
        <select value={filters.smoking} onChange={(e) => setFilter("smoking", e.target.value)} className={selectClass}>
          <option value="">Any</option>
          {habitOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Drinking">
        <select value={filters.drinking} onChange={(e) => setFilter("drinking", e.target.value)} className={selectClass}>
          <option value="">Any</option>
          {habitOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Family Type">
        <select value={filters.familyType} onChange={(e) => setFilter("familyType", e.target.value)} className={selectClass}>
          <option value="">Any</option>
          {familyTypes.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FilterField>

      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
        >
          <RotateCcw size={13} /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-rose-50/10 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-maroon animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-maroon uppercase">Browse Matches</span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-slate-900">
              Discover Your <span className="bg-gradient-to-r from-maroon to-gold bg-clip-text text-transparent">Perfect Match</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isLoading ? "Finding profiles for you..." : `${total} member${total === 1 ? "" : "s"} found`}
              {!viewerIsPremium && <span className="ml-1">&middot; Free members see full details on the first 5 profiles</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative shadow-sm rounded-xl">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, district, profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="relative flex items-center gap-2 rounded-xl bg-white border border-slate-200 p-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
            >
              <Filter size={18} className="text-maroon" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-maroon text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* SORT BAR */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="hidden text-xs font-bold uppercase tracking-wider text-slate-400 sm:block">Sort By</span>
          <div className="relative w-full sm:w-56">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* SIDEBAR FILTERS */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out lg:sticky lg:top-6 lg:z-0 lg:block lg:col-span-3 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:w-auto lg:max-w-none lg:transform-none lg:rounded-2xl lg:border lg:border-slate-200/60 lg:shadow-sm
            ${showMobileFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-maroon" />
                <h2 className="text-base font-bold text-slate-900">Refine Preferences</h2>
              </div>
              <button onClick={() => setShowMobileFilters(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden">
                <X size={18} />
              </button>
            </div>
            <div className="mt-6">{FiltersPanel}</div>
          </aside>

          {showMobileFilters && (
            <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileFilters(false)} />
          )}

          {/* PROFILE GRID */}
          <main className="w-full lg:col-span-9">
            {isLoading && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-56 w-full bg-slate-100" />
                    <div className="space-y-2 p-5">
                      <div className="h-4 w-2/3 rounded bg-slate-100" />
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                      <div className="h-3 w-1/3 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && profiles.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {profiles.map((profile) => (
                    <ProfileCard key={profile._id} profile={profile} />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetching}
                      className="rounded-xl bg-maroon px-8 py-3 text-sm font-bold text-cream shadow-md transition hover:bg-maroon/90 disabled:opacity-60"
                    >
                      {isFetching ? "Loading..." : "Load More Profiles"}
                    </button>
                  </div>
                )}
              </>
            )}

            {!isLoading && profiles.length === 0 && (
              <div className="w-full rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-maroon/10 text-maroon shadow-inner">
                  <Users size={26} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-slate-900">No Profiles Found</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 px-6">
                  Try relaxing your filters or clearing the search to discover more members.
                </p>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="btn-primary mt-6 inline-flex">
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};