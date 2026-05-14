import { Input } from "../ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/Select";
import { X } from "lucide-react";
import React from "react";
import YesterdaySuggestions from "./YesterdaySuggestions";
import { categoryConfig } from "../../constants/constants";

export default function MealForm({
  title,
  setTitle,
  mealType,
  setMealType,
  calories,
  setCalories,
  notes,
  setNotes,
  handleAdd,
  showForm,
  setShowForm,
  yesterdayMeals,
  autoFillMeal,
  lang,
  t,
  editingMeal,
  setEditingMeal,
}) {
  if (!showForm) return null;

  return (
    <div className="p-4 bg-card rounded-2xl border border-border/40 shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">
          {editingMeal ? t.edit_meal : t.new_meal}
        </h3>

        <button
          onClick={() => {
            setShowForm(false);
            setEditingMeal(null);
          }}
          className="
            w-8 h-8
            rounded-full
            bg-muted/50
            hover:bg-destructive/10
            border border-border/50
            text-muted-foreground
            hover:text-destructive
            transition-all duration-200
            active:scale-95
            flex items-center justify-center
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <YesterdaySuggestions
        yesterdayMeals={yesterdayMeals}
        autoFillMeal={autoFillMeal}
        lang={lang}
      />

      <Input
        placeholder={t.what_ate}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="h-12 bg-muted/50 border-transparent rounded-xl"
      />

      <Select value={mealType} onValueChange={setMealType}>
        <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl w-full text-left">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>

        <SelectContent className="rounded-xl border-border/40 shadow-xl">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;

            return (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${config.iconClass}`} />

                  <span>{t.meal_categories[key]}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Input
        type="number"
        placeholder={t.calories_opt}
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        className="h-12 bg-muted/50 border-transparent rounded-xl"
      />

      <Input
        placeholder={t.obs_opt}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-12 bg-muted/50 border-transparent rounded-xl"
      />

      <button
        type="button"
        onClick={handleAdd}
        className="w-full h-12 bg-primary text-primary-foreground font-semibold mt-4 rounded-xl"
      >
        {editingMeal ? t.save_changes : t.save_meal}
      </button>
    </div>
  );
}
