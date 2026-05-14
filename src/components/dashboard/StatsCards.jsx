import { Flame } from "lucide-react";
import WaterCard from "./WaterCard";

export default function StatsCards({
  totalCalories,
  waterMl,
  waterProgress,
  onAddWater,
  onRemoveWater,
  t,
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-4 shadow-sm flex flex-col justify-center">
        <p className="text-xs text-muted-foreground mb-1">
          {t.calories_today}
        </p>

        <div className="flex items-center gap-1.5">
          <Flame className="w-5 h-5 text-primary" />

          <p className="text-2xl font-bold text-foreground">
            {totalCalories}
          </p>
        </div>
      </div>

      <WaterCard
        waterMl={waterMl}
        waterProgress={waterProgress}
        onAdd={onAddWater}
        onRemove={onRemoveWater}
        t={t}
      />
    </div>
  );
}