import React, { useState, useEffect } from "react";
import {
  Coffee,
  Sun,
  Cookie,
  Moon,
  Utensils,
  Plus,
  Trash2,
  Flame,
  ChevronRight,
  Clock,
  Droplets,
  Minus,
  PlusCircle,
  RotateCcw,
} from "lucide-react";
import { supabase } from "../supabase";
import { Input } from "../components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/Select";

const categoryIcons = {
  "Café da manhã": <Coffee className="w-5 h-5 text-amber-500" />,
  Almoço: <Sun className="w-5 h-5 text-yellow-500" />,
  Lanche: <Cookie className="w-5 h-5 text-orange-500" />,
  Jantar: <Moon className="w-5 h-5 text-indigo-500" />,
  Outro: <Utensils className="w-5 h-5 text-emerald-500" />,
};

const categoryGradients = {
  "Café da manhã": "from-amber-700/20 to-orange-800/10 border-amber-700/20",
  Almoço: "from-yellow-700/20 to-amber-800/10 border-yellow-700/20",
  Lanche: "from-orange-700/20 to-red-800/10 border-orange-700/20",
  Jantar: "from-indigo-700/20 to-purple-800/10 border-indigo-700/20",
  Outro: "from-emerald-700/20 to-teal-800/10 border-emerald-700/20",
};

export default function Dashboard({ session, setPage }) {
  const [meals, setMeals] = useState([]);
  const [waterMl, setWaterMl] = useState(0);
  const [streak, setStreak] = useState(0);
  const [yesterdayMeals, setYesterdayMeals] = useState([]);

  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState("Café da manhã");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Refeições de Hoje
    const { data: todayMeals } = await supabase
      .from("meals")
      .select("*")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });
    if (todayMeals) setMeals(todayMeals);

    // Refeições de Ontem
    const { data: yestMeals } = await supabase
      .from("meals")
      .select("*")
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString());
    if (yestMeals) {
      const uniqueYestMeals = Array.from(
        new Map(yestMeals.map((item) => [item.title, item])).values(),
      );
      setYesterdayMeals(uniqueYestMeals);
    }

    // Água de Hoje
    const { data: waterLogs } = await supabase
      .from("water_logs")
      .select("amount_ml")
      .gte("created_at", today.toISOString());
    if (waterLogs)
      setWaterMl(waterLogs.reduce((acc, log) => acc + log.amount_ml, 0));

    // Perfil
    const { data: profile } = await supabase
      .from("profiles")
      .select("streak_count, last_active_date")
      .eq("id", session.user.id)
      .single();
    if (profile) setStreak(profile.streak_count || 0);
  };

  const updateStreak = async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: profile } = await supabase
      .from("profiles")
      .select("streak_count, last_active_date")
      .eq("id", session.user.id)
      .single();

    if (profile && profile.last_active_date !== todayStr) {
      const yesterdayStr = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];
      const newStreak =
        profile.last_active_date === yesterdayStr
          ? (profile.streak_count || 0) + 1
          : 1;

      await supabase
        .from("profiles")
        .update({ streak_count: newStreak, last_active_date: todayStr })
        .eq("id", session.user.id);
      setStreak(newStreak);
    }
  };

  // Controle de água
  const handleAddWater = async () => {
    await supabase
      .from("water_logs")
      .insert([{ user_id: session.user.id, amount_ml: 250 }]);
    setWaterMl((prev) => prev + 250);
  };

  const handleRemoveWater = async () => {
    if (waterMl <= 0) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("water_logs")
      .select("id")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      await supabase.from("water_logs").delete().match({ id: data[0].id });
      setWaterMl((prev) => Math.max(0, prev - 250));
    }
  };

  // Refeições
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await supabase.from("meals").insert([
      {
        user_id: session.user.id,
        title,
        calories: calories ? parseInt(calories) : null,
        meal_type: mealType,
        notes: notes.trim() || null,
      },
    ]);
    setTitle("");
    setCalories("");
    setNotes("");
    setMealType("Café da manhã");
    setShowForm(false);
    updateStreak();
    fetchDashboardData();
  };

  const handleRepeatYesterday = async () => {
    if (yesterdayMeals.length === 0) return;
    const mealsToInsert = yesterdayMeals.map((m) => ({
      user_id: session.user.id,
      title: m.title,
      calories: m.calories,
      meal_type: m.meal_type,
      notes: m.notes,
    }));
    await supabase.from("meals").insert(mealsToInsert);
    updateStreak();
    fetchDashboardData();
  };

  const handleDelete = async (id) => {
    await supabase.from("meals").delete().match({ id });
    fetchDashboardData();
  };

  const autoFillMeal = (meal) => {
    setTitle(meal.title);
    setCalories(meal.calories ? meal.calories.toString() : "");
    setMealType(meal.meal_type);
  };

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const waterProgress = Math.min(100, (waterMl / 2000) * 100);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col text-foreground pb-24">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-top">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Olá,</span>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {session.user.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}
              </h1>
              <img src="/logo-bowl.png" alt="BiteLog" className="w-7 h-7 object-contain drop-shadow-md" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full shrink-0">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-500">{streak}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-4 shadow-sm flex flex-col justify-center">
            <p className="text-xs text-muted-foreground mb-1">Calorias Hoje</p>
            <div className="flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold text-foreground">
                {totalCalories}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500" /> Água
                </p>
                <p className="text-lg font-bold text-foreground">
                  {waterMl}
                  <span className="text-xs text-muted-foreground font-normal">
                    /2000ml
                  </span>
                </p>
              </div>
              {waterMl > 0 && (
                <button
                  onClick={handleRemoveWater}
                  className="w-6 h-6 bg-destructive/10 text-destructive rounded flex items-center justify-center hover:bg-destructive/20 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="w-full bg-muted rounded-full h-1.5 mb-3">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${waterProgress}%` }}
              ></div>
            </div>

            <button
              onClick={handleAddWater}
              className="w-full py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" /> +250ml
            </button>
          </div>
        </div>

        {meals.length === 0 && yesterdayMeals.length > 0 && !showForm && (
          <button
            onClick={handleRepeatYesterday}
            className="w-full h-12 flex items-center justify-center gap-2 bg-muted/30 border border-border hover:bg-muted/50 text-foreground font-medium rounded-xl transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 text-primary" /> Copiar cardápio de
            ontem
          </button>
        )}

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full h-14 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Adicionar refeição
          </button>
        ) : (
          <div className="p-4 bg-card rounded-2xl border border-border/40 shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">
                Nova refeição
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </button>
            </div>

            {yesterdayMeals.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">
                  Sugestões (Seu cardápio de ontem):
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {yesterdayMeals.map((meal) => (
                    <button
                      key={meal.id}
                      onClick={() => autoFillMeal(meal)}
                      className="whitespace-nowrap px-3 py-1.5 bg-muted/50 hover:bg-primary/20 border border-border hover:border-primary/50 text-xs text-foreground rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {React.cloneElement(categoryIcons[meal.meal_type], {
                        className: "w-3 h-3",
                      })}
                      {meal.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Input
              placeholder="O que você comeu?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-12 bg-muted/50 border-transparent rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl focus:ring-1 focus:ring-primary w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 shadow-xl">
                {Object.keys(categoryIcons).map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className="rounded-lg my-0.5 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {React.cloneElement(categoryIcons[cat], {
                        className: "w-4 h-4",
                      })}
                      <span>{cat}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Calorias (opcional)"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="h-12 bg-muted/50 border-transparent rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Input
              placeholder="Observações (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-12 bg-muted/50 border-transparent rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
            />
            <button
              onClick={handleAdd}
              className="w-full h-12 bg-primary text-primary-foreground font-semibold mt-4 rounded-xl hover:bg-primary/90 transition active:scale-[0.98]"
            >
              Salvar Refeição
            </button>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {meals.length === 0 && !showForm && yesterdayMeals.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Utensils className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm">
                Nenhuma refeição registrada hoje
              </p>
            </div>
          )}
          {meals.map((meal) => (
            <div
              key={meal.id}
              className={`p-4 rounded-xl bg-gradient-to-r ${categoryGradients[meal.meal_type]} border border-border backdrop-blur-sm shadow-sm transition-all flex items-start justify-between gap-3`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center shrink-0 mt-0.5">
                  {categoryIcons[meal.meal_type]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {meal.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {meal.meal_type}
                    </span>
                    {meal.calories && (
                      <span className="text-xs text-primary font-medium">
                        {meal.calories} kcal
                      </span>
                    )}
                  </div>
                  {meal.notes && (
                    <p className="text-xs text-muted-foreground/80 mt-1.5 italic line-clamp-2">
                      "{meal.notes}"
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <button
                  onClick={() => handleDelete(meal.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(meal.created_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
