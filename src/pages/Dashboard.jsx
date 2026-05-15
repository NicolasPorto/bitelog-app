import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

import Header from "../components/dashboard/Header";
import MealList from "../components/dashboard/MealList";
import StatsCards from "../components/dashboard/StatsCards";
import MealForm from "../components/dashboard/MealForm";
import EmptyState from "../components/dashboard/EmptyState";

import { translations } from "../translations";
import { getLocalDateKey, getStartOfLocalDay } from "../utils/date";

export default function Dashboard({ session, setPage, lang }) {
  const [meals, setMeals] = useState([]);
  const [waterMl, setWaterMl] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [yesterdayMeals, setYesterdayMeals] = useState([]);
  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [editingMeal, setEditingMeal] = useState(null);

  const t = translations[lang] || translations["pt"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);

    setTitle(meal.title);
    setCalories(meal.calories ? meal.calories.toString() : "");

    setMealType(meal.meal_type);

    setNotes(meal.notes || "");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const fetchDashboardData = async () => {
    const today = getStartOfLocalDay();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: todayMeals } = await supabase
      .from("meals")
      .select("*")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });
    if (todayMeals) setMeals(todayMeals);

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

    const { data: waterLogs } = await supabase
      .from("water_logs")
      .select("amount_ml")
      .gte("created_at", today.toISOString());
    if (waterLogs)
      setWaterMl(waterLogs.reduce((acc, log) => acc + log.amount_ml, 0));

    const { data: profile } = await supabase
      .from("profiles")
      .select("streak_count, last_active_date")
      .eq("id", session.user.id)
      .single();
    if (profile) setStreak(profile.streak_count || 0);
  };

  const updateStreak = async () => {
    const todayStr = getLocalDateKey();
    const { data: profile } = await supabase
      .from("profiles")
      .select("streak_count, last_active_date")
      .eq("id", session.user.id)
      .single();

    if (profile && profile.last_active_date !== todayStr) {
      const yesterday = new Date();

      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayStr = getLocalDateKey(yesterday);

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

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    const payload = {
      title,
      calories: calories ? parseInt(calories) : null,
      meal_type: mealType,
      notes: notes.trim() || null,
    };

    if (editingMeal) {
      const { error } = await supabase
        .from("meals")
        .update(payload)
        .eq("id", editingMeal.id);
    } else {
      await supabase.from("meals").insert([
        {
          user_id: session.user.id,
          ...payload,
        },
      ]);

      updateStreak();
    }

    setTitle("");
    setCalories("");
    setNotes("");
    setMealType("breakfast");

    setEditingMeal(null);

    setShowForm(false);

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
      <Header session={session} streak={streak} lang={lang} />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-4">
        <StatsCards
          totalCalories={totalCalories}
          waterMl={waterMl}
          waterProgress={waterProgress}
          onAddWater={handleAddWater}
          onRemoveWater={handleRemoveWater}
          t={t}
        />

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full h-14 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg"
          >
            {t.add_meal}
          </button>
        ) : (
          <MealForm
            title={title}
            setTitle={setTitle}
            mealType={mealType}
            setMealType={setMealType}
            calories={calories}
            setCalories={setCalories}
            notes={notes}
            setNotes={setNotes}
            handleAdd={handleAdd}
            showForm={showForm}
            setShowForm={setShowForm}
            yesterdayMeals={yesterdayMeals}
            autoFillMeal={autoFillMeal}
            lang={lang}
            t={t}
            editingMeal={editingMeal}
            setEditingMeal={setEditingMeal}
          />
        )}

        {meals.length === 0 && !showForm && yesterdayMeals.length === 0 ? (
          <EmptyState lang={lang} />
        ) : (
          <MealList
            meals={meals}
            onDelete={handleDelete}
            onEdit={handleEditMeal}
            t={t}
            lang={lang}
          />
        )}
      </main>
    </div>
  );
}
