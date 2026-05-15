export function calculateDailyCalories({
  weight,
  height,
  age,
  gender,
  activityLevel = 1.2,
  goal = "maintain",
}) {
  if (!weight || !height || !age) {
    return 0;
  }

  let bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);

  bmr += gender === "male" ? 5 : -161;

  let calories = bmr * Number(activityLevel);

  switch (goal) {
    case "lose":
      calories -= 400;
      break;

    case "gain":
      calories += 300;
      break;

    default:
      break;
  }

  return Math.round(calories);
}

export function calculateIMC({ weight, height, lang }) {
  const bmi =
    weight && height
      ? (weight / (height / 100) ** 2).toFixed(1)
      : null;

  const getBMICategory = (val) => {
    if (!val)
      return { label: "-", color: "text-muted-foreground", bg: "bg-muted" };
    const v = parseFloat(val);
    if (v < 18.5)
      return {
        label: lang === "pt" ? "Abaixo do peso" : "Underweight",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        bmi: val,
      };
    if (v < 25)
      return {
        label: lang === "pt" ? "Peso ideal" : "Normal",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        bmi: val,
      };
    if (v < 30)
      return {
        label: lang === "pt" ? "Sobrepeso" : "Overweight",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        bmi: val,
      };
    return {
      label: lang === "pt" ? "Obesidade" : "Obesity",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      bmi: val,
    };
  };

  return getBMICategory(bmi);
}
