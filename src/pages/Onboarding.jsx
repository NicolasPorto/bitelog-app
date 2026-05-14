import { useState } from "react";
import { supabase } from "../supabase";
import { translations } from "../translations";
import { Input } from "../components/ui/Input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/Select";

export default function Onboarding({ session, lang, onComplete }) {
  const t = translations[lang];
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Masculino");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    let tmb = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
    tmb += gender === "Masculino" ? 5 : -161;
    const dailyKcal = Math.round(tmb * 1.2);

    await supabase.from('profiles').update({
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      gender,
      daily_kcal: dailyKcal,
      is_onboarded: true
    }).eq('id', session.user.id);

    onComplete();
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-6 text-foreground">
      <div className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        <h2 className="text-2xl font-black mb-2 text-primary">{t.onboarding_title}</h2>
        <p className="text-sm text-muted-foreground mb-8">{t.onboarding_sub}</p>

        <div className="space-y-4">
          <Input type="number" placeholder={t.weight} value={weight} onChange={e => setWeight(e.target.value)} className="h-12 rounded-xl" />
          <Input type="number" placeholder={t.height} value={height} onChange={e => setHeight(e.target.value)} className="h-12 rounded-xl" />
          <Input type="number" placeholder={t.age} value={age} onChange={e => setAge(e.target.value)} className="h-12 rounded-xl" />
          
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">{t.male}</SelectItem>
              <SelectItem value="Feminino">{t.female}</SelectItem>
            </SelectContent>
          </Select>

          <button 
            onClick={handleSave} 
            disabled={!weight || !height || !age || loading}
            className="w-full h-12 mt-6 bg-primary text-primary-foreground font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "..." : t.finish}
          </button>
        </div>
      </div>
    </div>
  );
}