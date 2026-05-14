import {
  Droplets,
  Minus,
  PlusCircle,
} from "lucide-react";

export default function WaterCard({
  waterMl,
  waterProgress,
  onAdd,
  onRemove,
  t,
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-500" />
            {t.water}
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
            onClick={onRemove}
            className="w-6 h-6 bg-destructive/10 text-destructive rounded flex items-center justify-center"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="w-full bg-muted rounded-full h-1.5 mb-3">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${waterProgress}%` }}
        />
      </div>

      <button
        onClick={onAdd}
        className="w-full py-1.5 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-lg flex items-center justify-center gap-1"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        +250ml
      </button>
    </div>
  );
}