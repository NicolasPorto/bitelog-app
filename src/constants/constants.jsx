import {
  Coffee,
  Sun,
  Cookie,
  Moon,
  Utensils,
} from "lucide-react";

export const categoryConfig = {
  breakfast: {
    icon: Coffee,
    iconClass: "text-amber-500",
    gradient:
      "from-amber-700/20 to-orange-800/10 border-amber-700/20",
  },

  lunch: {
    icon: Sun,
    iconClass: "text-yellow-500",
    gradient:
      "from-yellow-700/20 to-amber-800/10 border-yellow-700/20",
  },

  snack: {
    icon: Cookie,
    iconClass: "text-orange-500",
    gradient:
      "from-orange-700/20 to-red-800/10 border-orange-700/20",
  },

  dinner: {
    icon: Moon,
    iconClass: "text-indigo-500",
    gradient:
      "from-indigo-700/20 to-purple-800/10 border-indigo-700/20",
  },

  other: {
    icon: Utensils,
    iconClass: "text-emerald-500",
    gradient:
      "from-emerald-700/20 to-teal-800/10 border-emerald-700/20",
  },
};