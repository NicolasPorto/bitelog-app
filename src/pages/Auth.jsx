import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { translations } from "../translations";
import { Input } from "../components/ui/Input";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  ArrowLeft,
  CircleAlert,
  CircleCheck,
} from "lucide-react";

export default function Auth({ lang, setLang }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState("auth");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const t = translations[lang] || translations["pt"];

  const getAuthErrorMessage = (message) => {
    const errors = {
      "Invalid login credentials":
        lang === "pt"
          ? "E-mail ou senha inválidos."
          : "Invalid email or password.",

      "Email not confirmed":
        lang === "pt"
          ? "Confirme seu e-mail antes de entrar."
          : "Please confirm your email before logging in.",

      "User already registered":
        lang === "pt"
          ? "Este e-mail já está cadastrado."
          : "This email is already registered.",

      "Password should be at least 6 characters":
        lang === "pt"
          ? "A senha deve ter pelo menos 6 caracteres."
          : "Password should have at least 6 characters.",

      "Unable to validate email address: invalid format":
        lang === "pt" ? "Formato de e-mail inválido." : "Invalid email format.",
    };

    return errors[message] || message;
  };

  const passwordChecks = {
    length: password.length >= 6,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  const validatePassword = () => {
    return Object.values(passwordChecks).every(Boolean);
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    clearMessages();

    setLoading(true);

    if (!isLogin && !validatePassword()) {
      setErrorMessage(t.password_error);
      setLoading(false);
      return;
    }

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({
          email,
          password,
        })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split("@")[0],
            },
          },
        });

    if (error) {
      setErrorMessage(getAuthErrorMessage(error.message));
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!email) {
      setErrorMessage(
        lang === "pt"
          ? "Digite seu e-mail primeiro."
          : "Enter your email first.",
      );

      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMessage(getAuthErrorMessage(error.message));
    } else {
      setView("recovery_sent");
    }

    setLoading(false);
  };

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  useEffect(() => {
    clearMessages();
  }, [isLogin, view]);

  return (
    <div className="relative min-h-[100dvh] bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <img
            src="/icon-512x512.png"
            alt="Logo"
            className="w-20 h-20 mx-auto mb-6 rounded-[1.2rem] shadow-2xl border border-white/10"
          />

          <h2 className="text-3xl font-black text-foreground tracking-tight">
            {t.welcome}
          </h2>

          <p className="text-muted-foreground mt-2 text-sm">{t.subtitle}</p>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2.5rem] shadow-2xl p-8">
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 animate-in fade-in">
              <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400 animate-in fade-in">
              <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {view === "recovery_sent" ? (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <h3 className="font-bold text-foreground">{t.reset_sent}</h3>

              <button
                onClick={() => {
                  clearMessages();
                  setView("auth");
                }}
                className="flex items-center gap-2 mx-auto text-primary text-sm font-bold hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </button>
            </div>
          ) : view === "recovery" ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-foreground mb-2">
                {t.forgot_password}
              </h3>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder={t.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="
                      h-12 rounded-2xl pl-11
                      bg-background/50
                      border-transparent
                      focus-visible:ring-1
                      focus-visible:ring-primary
                    "
                  />

                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/40" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full h-12
                    bg-primary
                    text-primary-foreground
                    font-bold rounded-2xl
                    shadow-lg
                    active:scale-95
                    transition-all
                    disabled:opacity-50
                  "
                >
                  {loading ? "..." : t.send_recovery}
                </button>
              </form>
              <button
                onClick={() => {
                  clearMessages();
                  setView("auth");
                }}
                className="flex items-center gap-2 mx-auto text-primary text-sm font-bold hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder={t.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="
                      h-12 rounded-2xl pl-11
                      bg-background/50
                      border-transparent
                      focus-visible:ring-1
                      focus-visible:ring-primary
                    "
                  />

                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/40" />
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="
                      h-12 rounded-2xl px-11
                      bg-background/50
                      border-transparent
                      focus-visible:ring-1
                      focus-visible:ring-primary
                    "
                  />

                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground/40" />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute right-4 top-3.5
                      text-muted-foreground/40
                      hover:text-primary
                      transition-colors
                    "
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {!isLogin && password.length > 0 && (
                  <div className="space-y-2 rounded-2xl bg-muted/30 p-4">
                    <PasswordCheck
                      valid={passwordChecks.length}
                      text={
                        lang === "pt"
                          ? "Mínimo 6 caracteres"
                          : "At least 6 characters"
                      }
                    />

                    <PasswordCheck
                      valid={passwordChecks.upper}
                      text={
                        lang === "pt"
                          ? "Uma letra maiúscula"
                          : "One uppercase letter"
                      }
                    />

                    <PasswordCheck
                      valid={passwordChecks.lower}
                      text={
                        lang === "pt"
                          ? "Uma letra minúscula"
                          : "One lowercase letter"
                      }
                    />

                    <PasswordCheck
                      valid={passwordChecks.number}
                      text={lang === "pt" ? "Um número" : "One number"}
                    />
                  </div>
                )}

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setView("recovery");
                    }}
                    className="
                      w-full text-right text-xs
                      font-semibold
                      text-muted-foreground
                      hover:text-primary
                      transition-colors
                    "
                  >
                    {t.forgot_password}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full h-12
                    bg-primary
                    text-primary-foreground
                    font-bold rounded-2xl
                    shadow-lg
                    active:scale-95
                    transition-all
                    disabled:opacity-50
                  "
                >
                  {loading ? "..." : isLogin ? t.login : t.signup}
                </button>
              </form>

              <div className="relative flex items-center py-6 text-muted-foreground/30">
                <div className="flex-grow border-t border-current"></div>

                <span className="mx-4 text-[10px] font-bold uppercase tracking-widest">
                  ou
                </span>

                <div className="flex-grow border-t border-current"></div>
              </div>

              <button
                onClick={() =>
                  supabase.auth.signInWithOAuth({
                    provider: "google",
                  })
                }
                className="
                  w-full h-12
                  flex items-center justify-center gap-3
                  bg-background/50
                  border border-border/50
                  rounded-2xl
                  text-sm font-semibold
                  hover:bg-muted/50
                  transition-all
                  active:scale-[0.98]
                "
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="w-5 h-5"
                  alt="Google"
                />

                {t.google_login}
              </button>

              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setIsLogin(!isLogin);
                }}
                className="
                  w-full mt-8
                  text-sm text-primary
                  font-medium hover:underline
                "
              >
                {isLogin ? t.no_account : t.has_account}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordCheck({ valid, text }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-colors ${
        valid ? "text-emerald-400" : "text-muted-foreground"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          valid ? "bg-emerald-400" : "bg-muted-foreground/40"
        }`}
      />

      {text}
    </div>
  );
}
