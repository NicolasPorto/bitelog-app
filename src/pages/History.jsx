import React, { useState, useEffect } from "react";
import { Coffee, Sun, Cookie, Moon, Utensils, Flame, CalendarDays, ChevronDown, ChevronUp, Clock, Download } from "lucide-react";
import { supabase } from "../supabase";

const categoryIcons = {
  "Café da manhã": <Coffee className="w-4 h-4 text-amber-500" />,
  "Almoço": <Sun className="w-4 h-4 text-yellow-500" />,
  "Lanche": <Cookie className="w-4 h-4 text-orange-500" />,
  "Jantar": <Moon className="w-4 h-4 text-indigo-500" />,
  "Outro": <Utensils className="w-4 h-4 text-emerald-500" />,
};

export default function History({ setPage }) {
  const [historyGrouped, setHistoryGrouped] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => { 
    fetchHistory(); 
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase.from('meals').select('*').order('created_at', { ascending: false });
    if (!data) return;

    const grouped = data.reduce((acc, meal) => {
      const date = new Date(meal.created_at).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = { date, meals: [], totalCalories: 0 };
      acc[date].meals.push(meal);
      acc[date].totalCalories += meal.calories || 0;
      return acc;
    }, {});

    const historyArray = Object.values(grouped);
    setHistoryGrouped(historyArray);
  };

  const exportNutriReport = () => {
    let csvContent = "Data,Horario,Refeicao,Alimento,Calorias,Observacoes\n";
    
    historyGrouped.forEach(day => {
      day.meals.forEach(meal => {
        const date = day.date.split('-').reverse().join('/');
        const time = new Date(meal.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const notes = meal.notes ? `"${meal.notes}"` : ""; 
        csvContent += `${date},${time},${meal.meal_type},${meal.title},${meal.calories || 0},${notes}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BiteLog_RelatorioNutri_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayKey = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col text-foreground pb-24">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-top">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Histórico</h1>
          <button onClick={exportNutriReport} className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors active:scale-95">
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-4">
        
        {historyGrouped.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm">Nenhum histórico ainda</p>
          </div>
        )}

        {historyGrouped.map((day) => {
          const isToday = day.date === todayKey;
          const isExpanded = expandedDay === day.date;
          const formattedDate = day.date.split('-').reverse().join('/');

          return (
            <div key={day.date} className={`rounded-xl overflow-hidden border transition-all ${isToday ? "bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20" : "bg-card border-border"}`}>
              <button onClick={() => setExpandedDay(isExpanded ? null : day.date)} className="w-full p-4 flex items-center justify-between outline-none">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                    <CalendarDays className={`w-5 h-5 ${isToday ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{formattedDate}</p>
                    <p className="text-xs text-muted-foreground">{day.meals.length} {day.meals.length === 1 ? "refeição" : "refeições"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {day.totalCalories > 0 && (
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Flame className="w-3.5 h-3.5" /> {day.totalCalories}
                    </div>
                  )}
                  {isToday && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">Hoje</span>}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-1 fade-in duration-200">
                  <div className="h-px bg-border/40 mb-3" />
                  {day.meals.map((meal) => (
                    <div key={meal.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/40">
                      <div className="w-8 h-8 rounded-lg bg-background/60 flex items-center justify-center shrink-0">
                        {categoryIcons[meal.meal_type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{meal.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{meal.meal_type}</span>
                          <span className="text-[10px] text-primary font-medium">{meal.calories} kcal</span>
                        </div>
                        {meal.notes && <p className="text-[10px] text-muted-foreground/70 mt-1 italic truncate">"{meal.notes}"</p>}
                      </div>
                      <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(meal.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}