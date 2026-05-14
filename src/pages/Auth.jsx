import { useState } from 'react';
import { supabase } from '../supabase';
import { translations } from '../translations';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Auth({ lang, setLang }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState('auth'); // 'auth' ou 'recovery'

  const t = translations[lang] || translations['pt'];

  // Validação: 6 chars, 1 Maiúscula, 1 Minúscula, 1 Número
  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(pass);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && !validatePassword(password)) {
      alert(t.password_error);
      setLoading(false);
      return;
    }

    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: { full_name: email.split('@')[0] } } 
        });

    if (error) alert(error.message);
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      alert(lang === 'pt' ? "Digite seu e-mail primeiro." : "Enter your email first.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) alert(error.message);
    else setView('recovery_sent');
    setLoading(false);
  };

  return (
    <div className="relative min-h-[100dvh] bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Glow de Fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <img src="/icon-512x512.png" alt="Logo" className="w-20 h-20 mx-auto mb-6 rounded-[1.2rem] shadow-2xl border border-white/10" />
          <h2 className="text-3xl font-black text-foreground tracking-tight">{t.welcome}</h2>
          <p className="text-muted-foreground mt-2 text-sm">{t.subtitle}</p>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2.5rem] shadow-2xl p-8">
          {view === 'recovery_sent' ? (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-foreground">{t.reset_sent}</h3>
              <button onClick={() => setView('auth')} className="flex items-center gap-2 mx-auto text-primary text-sm font-bold hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-4 h-4" /> {t.back}
              </button>
            </div>
          ) : view === 'recovery' ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-foreground mb-2">{t.forgot_password}</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Input 
                    type="email" placeholder={t.email} value={email} 
                    onChange={(e) => setEmail(e.target.value)} required
                    className="h-12 rounded-2xl pl-11 bg-background/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/40" />
                </div>
                <button type="submit" disabled={loading} className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
                  {loading ? '...' : t.send_recovery}
                </button>
                <button onClick={() => setView('auth')} className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
                  {t.back}
                </button>
              </form>
            </div>
          ) : (
            <>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="relative">
                  <Input 
                    type="email" placeholder={t.email} value={email} 
                    onChange={(e) => setEmail(e.target.value)} required
                    className="h-12 rounded-2xl pl-11 bg-background/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/40" />
                </div>

                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} placeholder={t.password} value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    className="h-12 rounded-2xl px-11 bg-background/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/40" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-muted-foreground/40 hover:text-primary transition-colors outline-none">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {isLogin && (
                  <button type="button" onClick={() => setView('recovery')} className="w-full text-right text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-1">
                    {t.forgot_password}
                  </button>
                )}
                
                <button type="submit" disabled={loading} className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-2xl mt-2 shadow-lg active:scale-95 transition-all">
                  {loading ? '...' : (isLogin ? t.login : t.signup)}
                </button>
              </form>

              <div className="relative flex items-center py-6 text-muted-foreground/30">
                <div className="flex-grow border-t border-current"></div>
                <span className="mx-4 text-[10px] font-bold uppercase tracking-widest">ou</span>
                <div className="flex-grow border-t border-current"></div>
              </div>

              <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="w-full h-12 flex items-center justify-center gap-3 bg-background/50 border border-border/50 rounded-2xl text-sm font-semibold hover:bg-muted/50 transition-all">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5" alt="Google" />
                {t.google_login}
              </button>

              <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full mt-8 text-sm text-primary font-medium hover:underline">
                {isLogin ? t.no_account : t.has_account}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}