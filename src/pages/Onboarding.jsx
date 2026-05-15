import { useState } from "react";
import { supabase } from "../supabase";
import { translations } from "../translations";
import { Input } from "../components/ui/Input";
import { calculateDailyCalories } from "../utils/nutrition";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  User, 
  Scale, 
  Ruler, 
  Activity,
  Calendar
} from "lucide-react";

export default function Onboarding({ session, lang, onComplete }) {
  const t = translations[lang];
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("1.2");
  const [loading, setLoading] = useState(false);

  const progress = (step / totalSteps) * 100;

  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSave = async () => {
    setLoading(true);
    const dailyKcal = calculateDailyCalories({
      weight, height, age, gender, activityLevel, goal: "maintain",
    });

    await supabase
      .from("profiles")
      .update({
        weight: Number(weight),
        height: Number(height),
        age: Number(age),
        gender,
        activity_level: Number(activityLevel),
        daily_kcal: dailyKcal,
        is_onboarded: true,
      })
      .eq("id", session.user.id);

    onComplete();
  };

  // Validação simples por step
  const isStepDisabled = () => {
    if (step === 1) return !age || !gender;
    if (step === 2) return !weight || !height;
    return false;
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col p-6 text-foreground">
      {/* Header com Progresso */}
      <header className="w-full max-w-md mx-auto pt-8 pb-12">
        <div className="flex items-center justify-between mb-4 px-1">
          <button 
            onClick={handleBack}
            className={`p-2 rounded-full bg-muted/50 transition-opacity ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-black tracking-widest uppercase text-muted-foreground">
            {t.step || "Passo"} {step} <span className="opacity-30">/</span> {totalSteps}
          </span>
          <div className="w-9" /> {/* Spacer */}
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto flex flex-col">
        {/* STEP 1: BÁSICO */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
              <h2 className="text-3xl font-black leading-tight">{lang === 'pt' ? 'Conte um pouco sobre você' : 'Tell us about yourself'}</h2>
              <p className="text-muted-foreground mt-2">{t.onboarding_sub}</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setGender("male")}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${gender === 'male' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gender === 'male' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <span className="font-bold">{t.male}</span>
                </button>
                <button
                  onClick={() => setGender("female")}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${gender === 'female' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gender === 'female' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    <User className="w-6 h-6 rotate-180" />
                  </div>
                  <span className="font-bold">{t.female}</span>
                </button>
              </div>

              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder={t.age}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="h-16 pl-12 rounded-2xl bg-card border-border text-lg font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MEDIDAS */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
              <h2 className="text-3xl font-black leading-tight">{lang === 'pt' ? 'Suas medidas atuais' : 'Your measurements'}</h2>
              <p className="text-muted-foreground mt-2">{lang === 'pt' ? 'Isso ajuda a calcular sua meta calórica.' : 'This helps us calculate your calorie goal.'}</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder={`${t.weight} (kg)`}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="h-16 pl-12 rounded-2xl bg-card border-border text-lg font-bold"
                />
              </div>
              <div className="relative">
                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder={`${t.height} (cm)`}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="h-16 pl-12 rounded-2xl bg-card border-border text-lg font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ATIVIDADE */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div>
              <h2 className="text-3xl font-black leading-tight">{lang === 'pt' ? 'Nível de Atividade' : 'Activity Level'}</h2>
              <p className="text-muted-foreground mt-2">{lang === 'pt' ? 'Como é sua rotina semanal?' : 'What is your weekly routine like?'}</p>
            </div>

            <div className="space-y-3">
              {[
                { val: "1.2", label: lang === 'pt' ? 'Sedentário' : 'Sedentary', desc: 'Escritório, pouco movimento' },
                { val: "1.375", label: lang === 'pt' ? 'Levemente ativo' : 'Lightly active', desc: 'Exercício 1-3 dias/semana' },
                { val: "1.55", label: lang === 'pt' ? 'Moderadamente ativo' : 'Moderately active', desc: 'Exercício 3-5 dias/semana' },
                { val: "1.725", label: lang === 'pt' ? 'Muito ativo' : 'Very active', desc: 'Exercício intenso 6-7 dias' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setActivityLevel(item.val)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${activityLevel === item.val ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                >
                  <div>
                    <p className="font-bold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  {activityLevel === item.val && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rodapé de Navegação */}
        <div className="mt-auto pt-8">
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={isStepDisabled()}
              className="w-full h-16 bg-primary text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              {lang === 'pt' ? 'Continuar' : 'Continue'}
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-16 bg-primary text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              {loading ? "..." : (
                <>
                  {t.finish}
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}