import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { translations } from "../translations";
import { LogOut, Globe, User, Activity, Flame, Edit2, X, Check, Scale, History as HistoryIcon } from "lucide-react";
import { Input } from "../components/ui/Input";

export default function Profile({ session, profile, lang, setLang, refreshProfile }) {
  const t = translations[lang];
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(profile?.full_name || "");
  const [weight, setWeight] = useState(profile?.weight || "");
  const [height, setHeight] = useState(profile?.height || "");
  const [age, setAge] = useState(profile?.age || "");
  
  const [weightLogs, setWeightLogs] = useState([]);

  useEffect(() => {
    fetchWeightLogs();
  }, [session.user.id, isEditing]);

  const fetchWeightLogs = async () => {
    const { data } = await supabase.from('weight_logs').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (data) setWeightLogs(data);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    let tmb = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
    tmb += profile?.gender === "Masculino" ? 5 : -161;
    const dailyKcal = Math.round(tmb * 1.2);

    const { error } = await supabase.from('profiles').update({
      full_name: name, weight: Number(weight), height: Number(height), age: Number(age), daily_kcal: dailyKcal
    }).eq('id', session.user.id);

    if (error) {
      alert("Erro ao atualizar o perfil.");
    } else {
      if (Number(weight) !== profile?.weight) {
        await supabase.from('weight_logs').insert([{ user_id: session.user.id, weight: Number(weight) }]);
      }
      
      await refreshProfile();
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleCancelEdit = () => {
    setName(profile?.full_name || ""); setWeight(profile?.weight || ""); setHeight(profile?.height || ""); setAge(profile?.age || "");
    setIsEditing(false);
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-24">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-top">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t.profile}</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-6">
        
        <div className="relative p-5 bg-card border border-border rounded-2xl shadow-sm transition-all duration-300">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-full transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {isEditing ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-foreground">{t.edit}</h2>
                </div>
                <button onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground p-1.5 rounded-full bg-muted/50 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground ml-1 mb-1.5 block">{t.name}</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-background border-border h-11" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground ml-1 mb-1.5 block">{t.weight}</label>
                  <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="bg-background border-border h-11" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground ml-1 mb-1.5 block">{t.height}</label>
                  <Input type="number" value={height} onChange={e => setHeight(e.target.value)} className="bg-background border-border h-11" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground ml-1 mb-1.5 block">{t.age}</label>
                  <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="bg-background border-border h-11" />
                </div>
              </div>

              <button onClick={handleSaveProfile} disabled={loading} className="w-full flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground font-bold rounded-xl mt-4 active:scale-[0.98] transition-all">
                {loading ? "..." : <><Check className="w-5 h-5" />{t.save}</>}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 shadow-inner shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div className="min-w-0 flex-1 pr-6">
                <h2 className="text-lg font-bold truncate text-foreground">{profile?.full_name || session.user.email}</h2>
                <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
            <div className="p-4 bg-muted/30 border border-border rounded-2xl flex flex-col items-center justify-center text-center">
              <Activity className="w-5 h-5 text-primary mb-2" />
              <span className="text-xs text-muted-foreground mb-0.5">{t.weight} / {t.height}</span>
              <strong className="text-lg text-foreground">{profile?.weight}kg / {profile?.height}cm</strong>
            </div>
            <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
              <Flame className="w-5 h-5 text-primary mb-2" />
              <span className="text-xs text-primary/80 mb-0.5">{t.daily_goal}</span>
              <strong className="text-xl text-primary">{profile?.daily_kcal} kcal</strong>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">{t.weight_evolution}</h3>
            </div>

            {weightLogs.length > 0 ? (
              <div className="max-h-40 overflow-y-auto pr-2 space-y-2 no-scrollbar">
                {weightLogs.map(log => (
                  <div key={log.id} className="flex justify-between items-center p-3 rounded-xl bg-background border border-border/40 shadow-sm">
                    <span className="text-sm font-bold text-foreground">{log.weight} kg</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {new Date(log.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{t.weight_evolution_desc}</p>
            )}
          </div>
        )}

        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">{t.language}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setLang('pt')} className={`px-3 py-1 text-xs rounded-full transition-colors font-medium ${lang === 'pt' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>PT</button>
              <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs rounded-full transition-colors font-medium ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>EN</button>
            </div>
          </div>

          <button 
            onClick={() => supabase.auth.signOut()} 
            className="w-full flex items-center justify-center gap-2 h-14 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-2xl transition-colors font-semibold active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5" />
            {t.logout}
          </button>
        </div>
      </main>
    </div>
  );
}