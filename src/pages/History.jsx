import React, { useState, useEffect } from "react";
import {
  Flame,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
} from "lucide-react";

import { supabase } from "../supabase";

import { translations } from "../translations";

import { categoryConfig } from "../constants/constants";
import { getLocalDateKey, formatDate, formatTime } from "../utils/date";

export default function History({ setPage, lang }) {
  const [historyGrouped, setHistoryGrouped] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);

  const t = translations[lang] || translations["pt"];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("meals")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;

    const grouped = data.reduce((acc, meal) => {
      const date = getLocalDateKey(new Date(meal.created_at));

      if (!acc[date]) {
        acc[date] = {
          date,
          meals: [],
          totalCalories: 0,
        };
      }

      acc[date].meals.push(meal);

      acc[date].totalCalories += meal.calories || 0;

      return acc;
    }, {});

    const historyArray = Object.values(grouped);

    setHistoryGrouped(historyArray);
  };

  const exportNutriReport = () => {
    const headers =
      lang === "pt"
        ? "Data,Horario,Refeicao,Alimento,Calorias,Observacoes\n"
        : "Date,Time,MealType,Food,Calories,Notes\n";

    let csvContent = headers;

    historyGrouped.forEach((day) => {
      day.meals.forEach((meal) => {
        const date = formatDate(day.date, lang);

        const time = formatTime(meal.created_at, lang);

        const notes = meal.notes ? `"${meal.notes}"` : "";

        csvContent += `${date},${time},${t.meal_categories[meal.meal_type]},${meal.title},${meal.calories || 0},${notes}\n`;
      });
    });

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      `BiteLog_Report_${new Date().toISOString().split("T")[0]}.csv`,
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const todayKey = getLocalDateKey();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col text-foreground pb-24">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-top">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            {t.history_title}
          </h1>

          <button
            onClick={exportNutriReport}
            className="
              flex items-center gap-1.5
              text-xs font-semibold
              text-primary
              bg-primary/10
              hover:bg-primary/20
              px-3 py-1.5
              rounded-full
              transition-colors
              active:scale-95
            "
          >
            <Download className="w-3.5 h-3.5" />

            {t.export_csv}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-4">
        {historyGrouped.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-muted-foreground/50" />
            </div>

            <p className="text-muted-foreground text-sm">{t.no_history}</p>
          </div>
        )}

        {historyGrouped.map((day) => {
          const isToday = day.date === todayKey;

          const isExpanded = expandedDay === day.date;

          const formattedDate = formatDate(day.date, lang);

          return (
            <div
              key={day.date}
              className={`
                rounded-xl overflow-hidden
                border transition-all
                ${
                  isToday
                    ? "bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20"
                    : "bg-card border-border"
                }
              `}
            >
              <button
                onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                className="w-full p-4 flex items-center justify-between outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                    <CalendarDays
                      className={`
                        w-5 h-5
                        ${isToday ? "text-primary" : "text-muted-foreground"}
                      `}
                    />
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {formattedDate}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {day.meals.length}{" "}
                      {day.meals.length === 1 ? t.meal_count : t.meals_count}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {day.totalCalories > 0 && (
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Flame className="w-3.5 h-3.5" />

                      {day.totalCalories}
                    </div>
                  )}

                  {isToday && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {t.today}
                    </span>
                  )}

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-1 fade-in duration-200">
                  <div className="h-px bg-border/40 mb-3" />

                  {day.meals.map((meal) => {
                    const config = categoryConfig[meal.meal_type];

                    const Icon = config?.icon;

                    return (
                      <div
                        key={meal.id}
                        className={`
                          flex items-center gap-3
                          py-2 px-3 rounded-lg
                          bg-gradient-to-r
                          ${config?.gradient}
                          border border-border/40
                        `}
                      >
                        <div className="w-8 h-8 rounded-lg bg-background/60 flex items-center justify-center shrink-0">
                          {Icon && (
                            <Icon className={`w-4 h-4 ${config.iconClass}`} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {meal.title}
                          </p>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {t.meal_categories[meal.meal_type]}
                            </span>

                            {meal.calories && (
                              <span className="text-[10px] text-primary font-medium">
                                {meal.calories} kcal
                              </span>
                            )}
                          </div>

                          {meal.notes && (
                            <p className="text-[10px] text-muted-foreground/70 mt-1 italic truncate">
                              "{meal.notes}"
                            </p>
                          )}
                        </div>

                        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5 shrink-0">
                          <Clock className="w-3 h-3" />

                          {formatTime(meal.created_at, lang)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
