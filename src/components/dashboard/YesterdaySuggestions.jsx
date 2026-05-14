import { categoryConfig } from "../../constants/constants";

export default function YesterdaySuggestions({
  yesterdayMeals,
  autoFillMeal,
  lang,
}) {
  if (yesterdayMeals.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">
        {lang === "pt"
          ? "Sugestões (Cardápio de ontem):"
          : "Suggestions (Yesterday):"}
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {yesterdayMeals.map((meal) => {
          const config =
            categoryConfig[meal.meal_type];

          const Icon = config?.icon;

          return (
            <button
              key={meal.id}
              onClick={() => autoFillMeal(meal)}
              className="
                whitespace-nowrap
                px-3 py-1.5
                bg-muted/50
                border border-border
                text-xs text-foreground
                rounded-lg
                flex items-center gap-1.5
                transition-all
                hover:bg-muted
                active:scale-95
              "
            >
              {Icon && (
                <Icon
                  className={`w-3 h-3 ${config.iconClass}`}
                />
              )}

              {meal.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}