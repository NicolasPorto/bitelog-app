import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { Home, History as HistoryIcon, User } from "lucide-react";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [lang, setLang] = useState(() => {
    const savedLang = localStorage.getItem("bitelog_lang");
    if (savedLang) return savedLang;

    const systemLang = navigator.language || navigator.userLanguage;

    return systemLang.startsWith("pt") ? "pt" : "en";
  });

  useEffect(() => {
    localStorage.setItem("bitelog_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      setPage("reset-password");
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoadingProfile(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoadingProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      setProfile(data);
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  if (!session) return <Auth lang={lang} setLang={setLang} />;

  if (loadingProfile)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-primary font-bold tracking-widest text-xs uppercase animate-pulse">
          Carregando BiteLog
        </span>
      </div>
    );

  if (!profile?.is_onboarded) {
    return (
      <Onboarding
        session={session}
        lang={lang}
        onComplete={() => fetchProfile(session.user.id)}
      />
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-background">
      <main className="animate-in fade-in duration-500">
        {page === "dashboard" && (
          <Dashboard session={session} lang={lang} setPage={setPage} />
        )}
        {page === "history" && <History lang={lang} setPage={setPage} />}
        {page === "profile" && (
          <Profile
            session={session}
            profile={profile}
            lang={lang}
            setLang={setLang}
            refreshProfile={() => fetchProfile(session.user.id)}
          />
        )}
        {page === "reset-password" && (
          <ResetPassword lang={lang} onComplete={() => setPage("dashboard")} />
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background/40 backdrop-blur-3xl border border-border/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-1.5 rounded-[2rem] flex items-center gap-1">
        <NavButton
          active={page === "dashboard"}
          onClick={() => setPage("dashboard")}
          icon={<Home className="w-6 h-6" />}
        />
        <NavButton
          active={page === "history"}
          onClick={() => setPage("history")}
          icon={<HistoryIcon className="w-6 h-6" />}
        />
        <NavButton
          active={page === "profile"}
          onClick={() => setPage("profile")}
          icon={<User className="w-6 h-6" />}
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-14 h-12 rounded-3xl transition-all duration-500 ${
        active
          ? "bg-gradient-to-b from-primary/30 to-primary/10 border border-primary/30 shadow-[0_4px_12px_0_rgba(0,0,0,0.2)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] text-primary scale-105"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      {icon}
    </button>
  );
}
