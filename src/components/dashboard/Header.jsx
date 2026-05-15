import { Flame } from "lucide-react";

export default function Header({ session, streak, lang, setPage }) {
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-top">
      <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">
            {lang === "pt" ? "Olá," : "Hello,"}
          </span>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {session.user.user_metadata?.full_name?.split(" ")[0] || "User"}
            </h1>

            <img
              src="/logo-bowl.png"
              alt="BiteLog"
              className="w-7 h-7 object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Transformamos em um botão clicável */}
        <button 
          onClick={() => setPage && setPage("streak")}
          className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full shrink-0 hover:bg-orange-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          <span className="text-sm font-black text-orange-500">
            {streak}
          </span>
        </button>
      </div>
    </header>
  );
}