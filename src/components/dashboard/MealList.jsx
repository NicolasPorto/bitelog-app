import MealCard from "./MealCard";

export default function MealList({
  meals,
  onDelete,
  onEdit,
  t,
  lang
}) {
  return (
    <div className="space-y-3 pt-2">
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          onDelete={onDelete}
          t={t}
          lang={lang}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}