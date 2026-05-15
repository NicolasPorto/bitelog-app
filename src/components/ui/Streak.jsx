import React, { useState, useEffect } from "react";
import { ArrowLeft, Flame, Calendar, Trophy, Target, Zap, Share2 } from "lucide-react";
import { supabase } from "../../supabase";
import { getLocalDateKey } from "../../utils/date";

export default function Streak({ session, streak = 0, lang, setPage }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalLogs: 0,
    bestStreak: streak,
    weeklyMap: {}
  });

  useEffect(() => {
    fetchMetrics();
  }, [session.user.id, streak]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const { count: totalLogs } = await supabase
        .from("meals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("best_streak")
        .eq("id", session.user.id)
        .single();

      const bestStreak = profile?.best_streak 
        ? Math.max(profile.best_streak, streak) 
        : streak;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data: recentMeals } = await supabase
        .from("meals")
        .select("created_at")
        .eq("user_id", session.user.id)
        .gte("created_at", sevenDaysAgo.toISOString());

      const weeklyMap = {};
      if (recentMeals) {
        recentMeals.forEach((meal) => {
          const dateKey = getLocalDateKey(new Date(meal.created_at));
          weeklyMap[dateKey] = true;
        });
      }

      setMetrics({
        totalLogs: totalLogs || 0,
        bestStreak,
        weeklyMap,
      });

    } catch (error) {
      console.error("Erro ao buscar métricas de streak:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyProgress = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const dateKey = getLocalDateKey(d);
      
      const isActive = !!metrics.weeklyMap[dateKey]; 
      
      days.push({
        date: d,
        isActive,
        dayName: d.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { weekday: "short" }).substring(0, 1).toUpperCase()
      });
    }
    return days;
  };

  const weeklyDays = getWeeklyProgress();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[500px] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none" />

      <header className="sticky top-0 z-20 bg-transparent safe-top pt-4">
        <div className="max-w-md mx-auto px-6 py-2 flex items-center justify-between relative z-10">
          <button
            onClick={() => setPage("dashboard")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-md border border-border/50 text-foreground hover:bg-muted transition-colors active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-lg font-bold tracking-tight">
            {lang === "pt" ? "Seu Progresso" : "Your Progress"}
          </h1>
          
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-foreground/50 hover:text-foreground transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="relative overflow-hidden rounded-[2.5rem] border border-orange-500/30 bg-gradient-to-b from-orange-500/10 to-background p-8 text-center shadow-2xl shadow-orange-500/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
          
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
            <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center shadow-inner relative z-10 border-4 border-background">
              <Flame className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
          </div>

          <h2 className="text-6xl font-black tracking-tighter text-foreground mb-2">
            {streak}
          </h2>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
            {lang === "pt" ? "Dias Consecutivos" : "Consecutive Days"}
          </p>
          
          <p className="mt-4 text-sm text-muted-foreground font-medium px-4">
            {streak === 0 
              ? (lang === "pt" ? "Registre sua primeira refeição para começar!" : "Log your first meal to start!")
              : streak < 3 
              ? (lang === "pt" ? "Um ótimo começo! Continue assim." : "A great start! Keep it up.")
              : (lang === "pt" ? "Você está pegando fogo! Não quebre a corrente." : "You're on fire! Don't break the chain.")
            }
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {lang === "pt" ? "Esta Semana" : "This Week"}
            </h3>
          </div>
          
          <div className="flex justify-between items-center gap-2">
            {weeklyDays.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {day.dayName}
                </span>
                <div 
                  className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    day.isActive 
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110" 
                      : "bg-muted/50 text-muted-foreground border border-border/50"
                  }`}
                >
                  {day.isActive ? <Flame className="w-3 h-3" /> : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border/50 rounded-[2rem] p-5 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-[100%] transition-transform group-hover:scale-110" />
            <Trophy className="w-6 h-6 text-blue-500 mb-3" />
            <span className="text-2xl font-black text-foreground">
              {loading ? "--" : metrics.bestStreak}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              {lang === "pt" ? "Melhor Marca" : "Best Streak"}
            </span>
          </div>

          <div className="bg-card border border-border/50 rounded-[2rem] p-5 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-[100%] transition-transform group-hover:scale-110" />
            <Target className="w-6 h-6 text-emerald-500 mb-3" />
            <span className="text-2xl font-black text-foreground">
              {loading ? "--" : metrics.totalLogs}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              {lang === "pt" ? "Refeições Salvas" : "Meals Logged"}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/20 rounded-[2rem] p-6 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground mb-1">
              {lang === "pt" ? "Você sabia?" : "Did you know?"}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "pt" 
                ? "Estudos mostram que após 21 dias de registros consecutivos, um hábito se torna automático para o cérebro. Você está no caminho certo!" 
                : "Studies show that after 21 days of consecutive logging, a habit becomes automatic for the brain. You are on the right track!"}
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}