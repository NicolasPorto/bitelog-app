import { Trash2, Clock, Pencil } from "lucide-react";

import { categoryConfig } from "../../constants/constants";

export default function MealCard({ meal, onDelete, onEdit, t, lang }) {
  const config = categoryConfig[meal.meal_type];

  const Icon = config?.icon;

  return (
    <div
      className={`
        p-4 rounded-xl
        bg-gradient-to-r
        ${config?.gradient}
        border border-border
        backdrop-blur-sm shadow-sm
        flex items-start justify-between gap-3
      `}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center shrink-0 mt-0.5">
          {Icon && <Icon className={`w-5 h-5 ${config.iconClass}`} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground text-sm truncate">
            {meal.title}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {t.meal_categories[meal.meal_type]}
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
      
      <div className="flex flex-col items-end gap-2 shrink-0">

  <div className="flex items-center gap-1">

    <button
      onClick={() => onEdit(meal)}
      className="
        w-8 h-8
        rounded-lg
        bg-background/40
        border border-border/40
        text-muted-foreground/70
        hover:text-primary
        hover:bg-primary/10
        transition-all duration-200
        active:scale-95
        flex items-center justify-center
      "
    >
      <Pencil className="w-4 h-4" />
    </button>

    <button
      onClick={() => onDelete(meal.id)}
      className="
        w-8 h-8
        rounded-lg
        bg-background/40
        border border-border/40
        text-muted-foreground/70
        hover:text-destructive
        hover:bg-destructive/10
        transition-all duration-200
        active:scale-95
        flex items-center justify-center
      "
    >
      <Trash2 className="w-4 h-4" />
    </button>

  </div>

  <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
    <Clock className="w-3 h-3" />

    {new Date(meal.created_at).toLocaleTimeString(
      lang === "pt" ? "pt-BR" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}
  </span>
</div>
    </div>
  );
}
