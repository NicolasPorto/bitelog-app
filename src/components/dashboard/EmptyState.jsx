import { Utensils } from "lucide-react";

export default function EmptyState({ lang }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
        <Utensils className="w-8 h-8 text-muted-foreground/50" />
      </div>

      <p className="text-muted-foreground text-sm">
        {lang === "pt"
          ? "Nenhuma refeição hoje"
          : "No meals today"}
      </p>
    </div>
  );
}