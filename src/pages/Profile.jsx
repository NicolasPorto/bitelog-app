import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { translations } from "../translations";
import {
  LogOut,
  Globe,
  User,
  Activity,
  Flame,
  Edit2,
  X,
  Check,
  Scale,
  History as HistoryIcon,
  Ruler,
  TrendingDown,
  TrendingUp,
  Minus,
  Target,
  ChevronRight,
  PersonStanding
} from "lucide-react";
import { Input } from "../components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/Select";
import { calculateDailyCalories, calculateIMC } from "../utils/nutrition";

export default function Profile({
  session,
  profile,
  lang,
  setLang,
  refreshProfile,
}) {
  const t = translations[lang];

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(profile?.full_name || "");
  const [weight, setWeight] = useState(profile?.weight || "");
  const [height, setHeight] = useState(profile?.height || "");
  const [age, setAge] = useState(profile?.age || "");
  const [activityLevel, setActivityLevel] = useState(
    profile?.activity_level?.toString() || "1.2",
  );
  const [weightLogs, setWeightLogs] = useState([]);

  useEffect(() => {
    fetchWeightLogs();
  }, [session.user.id, isEditing]);

  const fetchWeightLogs = async () => {
    const { data } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (data) setWeightLogs(data);
  };

  const handleSaveProfile = async () => {
    setLoading(true);

    const dailyKcal = calculateDailyCalories({
      weight,
      height,
      age,
      gender: profile?.gender,
      activityLevel,
      goal: "maintain",
    });

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        weight: Number(weight),
        height: Number(height),
        age: Number(age),
        activity_level: Number(activityLevel),
        daily_kcal: dailyKcal,
      })
      .eq("id", session.user.id);

    if (error) {
      alert("Erro ao atualizar o perfil.");
    } else {
      if (Number(weight) !== profile?.weight) {
        await supabase
          .from("weight_logs")
          .insert([{ user_id: session.user.id, weight: Number(weight) }]);
      }

      await refreshProfile();
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleCancelEdit = () => {
    setName(profile?.full_name || "");
    setWeight(profile?.weight || "");
    setHeight(profile?.height || "");
    setAge(profile?.age || "");
    setIsEditing(false);
    setActivityLevel(profile?.activity_level?.toString() || "1.2");
  };

  const getActivityLabel = (value) => {
    const labels = {
      1.2: lang === "pt" ? "Sedentário" : "Sedentary",
      1.375: lang === "pt" ? "Levemente ativo" : "Lightly active",
      1.55: lang === "pt" ? "Moderadamente ativo" : "Moderately active",
      1.725: lang === "pt" ? "Muito ativo" : "Very active",
      1.9: lang === "pt" ? "Extremamente ativo" : "Extremely active",
    };

    return labels[String(value)] || "-";
  };

  const bmiData = calculateIMC({
    weight: profile?.weight,
    height: profile?.height,
    lang,
  });

  const getPercentage = (bmi) => {
    const min = 15;
    const max = 40;
    const percentage = ((bmi - min) / (max - min)) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const markerPosition = getPercentage(parseFloat(bmiData.bmi));

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-24">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-top">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t.profile}</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-6">
        <div className="relative p-5 bg-card border border-border rounded-2xl shadow-sm transition-all duration-300">
          {isEditing ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-foreground">{t.edit}</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {lang === "pt" ? "Informações Pessoais" : "Personal Info"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="text-muted-foreground hover:text-foreground p-2 rounded-full bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-2">
                  <User className="w-3 h-3" /> {t.name}
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl bg-background border-border/60 focus:border-primary font-medium px-4"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-tight text-center block">
                    {t.weight} (kg)
                  </label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="h-14 rounded-2xl bg-background border-border/60 text-center font-bold text-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-tight text-center block">
                    {t.height} (cm)
                  </label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="h-14 rounded-2xl bg-background border-border/60 text-center font-bold text-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-tight text-center block">
                    {t.age}
                  </label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-14 rounded-2xl bg-background border-border/60 text-center font-bold text-lg"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-2">
                  <Activity className="w-3 h-3" />{" "}
                  {lang === "pt" ? "Nível de Atividade" : "Activity Level"}
                </label>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      val: "1.2",
                      label: lang === "pt" ? "Sedentário" : "Sedentary",
                    },
                    {
                      val: "1.375",
                      label:
                        lang === "pt" ? "Levemente ativo" : "Lightly active",
                    },
                    {
                      val: "1.55",
                      label:
                        lang === "pt"
                          ? "Moderadamente ativo"
                          : "Moderately active",
                    },
                    {
                      val: "1.725",
                      label: lang === "pt" ? "Muito ativo" : "Very active",
                    },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setActivityLevel(item.val)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        activityLevel === item.val
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/40 bg-background hover:border-border"
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${activityLevel === item.val ? "text-primary" : "text-foreground/70"}`}
                      >
                        {item.label}
                      </span>
                      {activityLevel === item.val && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-16 bg-primary text-primary-foreground font-black rounded-[1.5rem] mt-6 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    {t.save}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary border border-primary/20 shadow-inner shrink-0 rotate-3">
                <User className="w-8 h-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black truncate text-foreground leading-tight">
                  {profile?.full_name || session.user.email?.split("@")[0]}
                </h2>
                <p className="text-xs text-muted-foreground truncate font-medium">
                  {session.user.email}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="w-10 h-10 flex items-center justify-center bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all active:scale-90"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="grid grid-cols-6 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="col-span-6 p-1 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-[2rem] border border-primary/20 shadow-lg shadow-primary/5">
              <div className="bg-card rounded-[1.8rem] p-6 flex items-center justify-between overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

                <div className="space-y-1 relative z-10">
                  <div className="flex items-center gap-2 text-primary">
                    <Flame className="w-4 h-4 fill-primary/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {t.daily_goal}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight text-foreground">
                      {profile?.daily_kcal}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">
                      kcal
                    </span>
                  </div>
                </div>

                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-3">
                  <Flame className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
            </div>

            <div className="col-span-3 p-5 bg-card border border-border/60 rounded-[2rem] flex flex-col justify-between shadow-sm hover:border-primary/30 transition-colors group">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <Ruler className="w-5 h-5" />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t.weight}
                  </p>
                  <p className="text-lg font-black text-foreground">
                    {profile?.weight}{" "}
                    <small className="text-[10px] font-normal opacity-60">
                      kg
                    </small>
                  </p>
                </div>
                <div className="h-px bg-border/40 w-full" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t.height}
                  </p>
                  <p className="text-lg font-black text-foreground">
                    {profile?.height}{" "}
                    <small className="text-[10px] font-normal opacity-60">
                      cm
                    </small>
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-3 p-5 bg-card border border-border/60 rounded-[2rem] flex flex-col justify-between shadow-sm hover:border-primary/30 transition-colors group">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {lang === "pt" ? "Nível de Atividade" : "Activity Level"}
                </p>
                <p className="text-sm font-black text-foreground leading-tight">
                  {getActivityLabel(profile?.activity_level)}
                </p>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((step) => {
                    const level = parseFloat(profile?.activity_level);
                    const active =
                      (step === 1 && level <= 1.2) ||
                      (step === 2 && level > 1.2 && level <= 1.375) ||
                      (step === 3 && level > 1.375 && level <= 1.55) ||
                      (step === 4 && level > 1.55);
                    return (
                      <div
                        key={step}
                        className={`h-1 flex-1 rounded-full ${active ? "bg-amber-500" : "bg-muted"}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-border/80 bg-card p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b-2 border-border/40 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <PersonStanding className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs text-foreground">
                    {lang === "pt" ? "Índice Corporal" : "Body Index"}
                  </span>
                </div>

                <div
                  className={`px-3 py-1 border-2 rounded-full font-black text-[10px] uppercase tracking-wider bg-transparent ${bmiData.color} border-current`}
                >
                  {bmiData.label}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-2 mb-6">
                <span
                  className={`text-6xl font-black tracking-tighter drop-shadow-sm ${bmiData.color}`}
                >
                  {bmiData.bmi || "--"}
                </span>
                <span className="text-xs font-bold text-foreground uppercase tracking-widest mt-2">
                  Score Atual
                </span>

                <p className="text-[10px] font-medium text-muted-foreground/70 mt-2 text-center max-w-[200px] leading-relaxed">
                  {lang === "pt"
                    ? "Baseado no seu peso e altura atuais."
                    : "Based on your current weight and height."}
                </p>
              </div>

              <div className="mt-2 bg-muted/20 p-4 rounded-2xl border border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {lang === "pt" ? "Faixa do IMC" : "BMI Range"}
                  </span>
                  <span className={`text-sm font-black ${bmiData.color}`}>
                    {bmiData.bmi}
                  </span>
                </div>

                <div className="relative">
                  <div className="h-3 overflow-hidden rounded-full bg-muted border border-border/50">
                    <div className="h-full w-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-500 opacity-90" />
                  </div>

                  {profile?.weight && profile?.height && (
                    <div
                      className="absolute -top-1 transition-all duration-700 ease-out"
                      style={{
                        left: `${markerPosition}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-5 w-5 rounded-full border-4 border-background shadow-md ${bmiData.color.replace("text", "bg")}`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[
                    { label: lang === "pt" ? "Baixo" : "Low", value: "18.5" },
                    { label: lang === "pt" ? "Ideal" : "Ideal", value: "25" },
                    { label: lang === "pt" ? "Sobre" : "Over", value: "30" },
                    { label: lang === "pt" ? "Obeso" : "Obese", value: "35+" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border/60 bg-background/80 p-2 text-center"
                    >
                      <p className="text-sm font-black text-foreground">
                        {item.value}
                      </p>
                      <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg">
                  {t.weight_evolution}
                </h3>
              </div>
            </div>

            {weightLogs.length > 0 ? (
              <div className="space-y-4">
                {/* Sumário de Progresso */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-card border border-border rounded-2xl">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                      {lang === "pt" ? "Variação Total" : "Total Change"}
                    </p>
                    <div className="flex items-center gap-2">
                      {weightLogs[0]?.weight -
                        weightLogs[weightLogs.length - 1]?.weight <=
                      0 ? (
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                      )}
                      <span
                        className={`text-xl font-black ${
                          weightLogs[0]?.weight -
                            weightLogs[weightLogs.length - 1]?.weight <=
                          0
                            ? "text-emerald-500"
                            : "text-amber-500"
                        }`}
                      >
                        {Math.abs(
                          weightLogs[0]?.weight -
                            weightLogs[weightLogs.length - 1]?.weight,
                        ).toFixed(1)}{" "}
                        kg
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-card border border-border rounded-2xl">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                      {lang === "pt" ? "Peso Inicial" : "Start Weight"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary/60" />
                      <span className="text-xl font-black text-foreground">
                        {weightLogs[weightLogs.length - 1]?.weight}{" "}
                        <small className="text-xs font-normal opacity-60">
                          kg
                        </small>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="max-h-56 overflow-y-auto no-scrollbar">
                    {weightLogs.map((log, index) => {
                      const nextLog = weightLogs[index + 1];
                      const diff = nextLog ? log.weight - nextLog.weight : 0;

                      return (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-4 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                diff < 0
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : diff > 0
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {diff < 0 ? (
                                <TrendingDown className="w-4 h-4" />
                              ) : diff > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <Minus className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground leading-none">
                                {log.weight} kg
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(log.created_at).toLocaleDateString(
                                  lang === "pt" ? "pt-BR" : "en-US",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>

                          {diff !== 0 && (
                            <span
                              className={`text-[10px] font-black px-2 py-1 rounded-md ${
                                diff < 0
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-amber-500/10 text-amber-600"
                              }`}
                            >
                              {diff > 0
                                ? `+${diff.toFixed(1)}`
                                : `${diff.toFixed(1)}`}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-card border border-dashed border-border rounded-2xl flex flex-col items-center text-center">
                <Scale className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t.weight_evolution_desc}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">
                {t.language}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLang("pt")}
                className={`px-3 py-1 text-xs rounded-full transition-colors font-medium ${lang === "pt" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                PT
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs rounded-full transition-colors font-medium ${lang === "en" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="pt-8 mt-4 border-t border-border/40">
            <button
              onClick={() => supabase.auth.signOut()}
              className="group relative w-full transition-all active:scale-[0.97]"
            >
              <div className="relative flex items-center justify-between bg-destructive/5 hover:bg-destructive/10 border border-destructive/10 hover:border-destructive/20 p-4 rounded-[2rem] transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-sm group-hover:bg-destructive group-hover:text-destructive-foreground transition-all duration-300 rotate-0 group-hover:-rotate-6">
                    <LogOut className="w-5 h-5" />
                  </div>

                  <div className="text-left">
                    <p className="text-base font-black text-destructive leading-none">
                      {t.logout}
                    </p>
                    <p className="mt-1.5 text-[10px] font-bold text-destructive/50 uppercase tracking-widest">
                      {lang === "pt"
                        ? "Encerrar sessão"
                        : "Sign out of account"}
                    </p>
                  </div>
                </div>

                <div className="pr-2">
                  <ChevronRight className="w-5 h-5 text-destructive/30 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            <div className="mt-8 flex flex-col items-center gap-1 opacity-40">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">
                PORTYX
              </p>
              <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">
                v1.0.4 • 2026
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
