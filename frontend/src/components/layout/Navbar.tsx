import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {  useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, Globe, Crown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationBell } from "./NotificationBell";

const Logo = new URL("../../assets/logo.jpeg", import.meta.url).href;

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const isFrontPage = location.pathname === "/";
  const isPremiumUser = Boolean(user?.isPremium);

  // Use framer-motion's native optimized scroll listener
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 30);

    if (latest <= 30) {
      setIsVisible(true);
      lastScrollY.current = latest;
      return;
    }

    if (latest > lastScrollY.current + 8) {
      setIsVisible(false);
    } else if (latest < lastScrollY.current - 8) {
      setIsVisible(true);
    }

    lastScrollY.current = latest;
  });

  const isSolid = scrolled || !isFrontPage;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "hi" ? "en" : "hi");
  };

  const handleSubscriptionClick = () => {
    if (!user) { navigate("/login"); return; }
    isPremiumUser ? navigate("/profile/billing") : navigate("/pricing");
  };

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/matches", label: t("nav.matches") },
    { to: "/kundali", label: t("nav.kundali") },
    { to: "/success-stories", label: t("nav.stories") },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isSolid
          ? "bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-xl"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto grid h-[76px] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-6 lg:px-10">
        
        {/* --- BRAND LOGO MODULE --- */}
        <Link to="/" className="flex shrink-0 items-center gap-3 group">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/10 shadow-sm transition-transform group-hover:scale-102">
            <img 
              src={Logo} 
              alt="Devbhoomi Bandhan Logo" 
              className="w-full h-full object-cover"
            />
          </span>
          <div className="leading-tight">
            <h1 className={`font-serif text-[18px] font-extrabold tracking-tight transition-colors duration-300 ${
              isSolid ? "text-[#241F1C]" : "text-white drop-shadow-md"
            }`}>
              देवभूमि बंधन
            </h1>
            <p className={`text-[10px] font-bold tracking-[0.16em] uppercase transition-colors duration-300 ${
              isSolid ? "text-[#241F1C]/50" : "text-zinc-200 drop-shadow-sm"
            }`}>
              Devbhoomi Bandhan
            </p>
          </div>
        </Link>

        {/* --- DESKTOP ROUTING ARCHITECTURE --- */}
        <nav className="hidden items-center justify-center gap-10 md:flex">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `group relative py-2 text-[13.5px] font-bold tracking-wide transition-colors duration-300 ${
                  isActive
                    ? isSolid ? "text-[#241F1C]" : "text-white drop-shadow-sm"
                    : isSolid ? "text-[#241F1C]/60 hover:text-[#241F1C]" : "text-white/85 hover:text-white drop-shadow-sm"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-0.5 left-0 h-[2px] bg-[#A9792C] transition-all duration-300 ease-out ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* --- ACTION PERIPHERALS MODULE --- */}
        <div className="flex items-center justify-end gap-3.5">
          {!isPremiumUser && (
            <button
              onClick={handleSubscriptionClick}
              className={`flex h-9 items-center gap-1.5 rounded-xl px-4 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ${
                isSolid 
                  ? "bg-[#A9792C] text-white hover:bg-[#8e6423] shadow-sm shadow-amber-900/10"
                  : "bg-amber-500 text-zinc-950 hover:bg-amber-400 font-extrabold shadow-md"
              }`}
            >
              <Crown className={`h-3.5 w-3.5 ${!isSolid ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{t("nav.upgrade", "Go Premium")}</span>
            </button>
          )}

          <button
            onClick={toggleLanguage}
            aria-label="Toggle language"
            className={`hidden h-9 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition-all duration-300 sm:flex active:scale-[0.98] ${
              isSolid 
                ? "border-[#241F1C]/[0.12] text-[#241F1C]/70 hover:bg-[#241F1C]/[0.05]" 
                : "border-white/30 text-white hover:bg-white/10 drop-shadow-sm"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            {i18n.language === "hi" ? "EN" : "हिं"}
          </button>

          {/* --- NOTIFICATIONS MODULE --- */}
          {user && <NotificationBell isSolid={isSolid} />}

          {user ? (
            <UserProfileMenu />
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className={`hidden h-9 items-center px-2 text-[13px] font-bold transition-colors duration-300 sm:inline-flex ${
                  isSolid ? "text-[#241F1C]/75 hover:text-[#241F1C]" : "text-white/90 hover:text-white drop-shadow-sm"
                }`}
              >
                {t("nav.login")}
              </button>
              <Button
                variant="primary"
                onClick={() => navigate("/signup")}
                className="hidden !h-9 items-center !rounded-xl !bg-[#6B1F2A] px-4 text-[13px] font-bold !text-white shadow-none transition-colors duration-300 hover:!bg-[#591824] sm:inline-flex"
              >
                {t("nav.signup")}
              </Button>
            </>
          )}

          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className={`transition-colors duration-300 md:hidden p-1 rounded-lg ${
              isSolid ? "text-[#241F1C] hover:bg-zinc-200/40" : "text-white hover:bg-white/10"
            }`}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};