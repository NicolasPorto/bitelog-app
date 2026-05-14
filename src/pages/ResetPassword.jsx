import { useState } from 'react';
import { supabase } from '../supabase';
import { translations } from '../translations';
import { Input } from '../components/ui/Input';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function ResetPassword({ lang, onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const t = translations[lang] || translations['pt'];

  // Mesma validação do cadastro: 6 chars, Maiúscula, Minúscula e Número
  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(pass);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      alert(t.password_error);
      return;
    }

    if (password !== confirmPassword) {
      alert(t.passwords_not_match);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onComplete(); // Redireciona para o login ou dashboard
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-[100dvh] bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2.5rem] shadow-2xl p-8">
          {success ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">{t.success_update}</h2>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-foreground tracking-tight">{t.reset_title}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{t.reset_subtitle}</p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder={t.new_password} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                    className="h-12 rounded-2xl px-11 bg-background/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/40" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-3.5 text-muted-foreground/40 hover:text-primary transition-colors outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Input 
                    type="password" 
                    placeholder={t.confirm_password} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required
                    className="h-12 rounded-2xl pl-11 bg-background/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/40" />
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-2xl mt-4 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? '...' : t.update_password}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}