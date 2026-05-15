import { useEffect, useState } from "react";

export default function Loader({
  onComplete,
  minDuration = 2000,
  t
}) {
  const [visible, setVisible] = useState(true);

  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, minDuration - 400);

    const hideTimer = setTimeout(() => {
      setVisible(false);

      if (onComplete) {
        onComplete();
      }
    }, minDuration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [minDuration, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex flex-col items-center justify-center
        bg-background
        transition-opacity duration-500
        ${
          fading
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        }
      `}
    >
      {/* Bowl Animation */}
      <div className="relative w-24 h-24">
        {/* Floating particles */}
        <span className="loader-particle loader-particle-1" />
        <span className="loader-particle loader-particle-2" />
        <span className="loader-particle loader-particle-3" />
        <span className="loader-particle loader-particle-4" />
        <span className="loader-particle loader-particle-5" />

        {/* Bowl body */}
        <div
          className="
            absolute bottom-0 left-1/2
            -translate-x-1/2
            w-20 h-10
            border-4 border-primary/80
            rounded-b-[2.5rem]
            rounded-t-sm
            overflow-hidden
            bg-primary/5
          "
        >
          <div className="absolute bottom-0 left-0 right-0 h-full">
            <div className="loader-wave" />
          </div>
        </div>

        <div
          className="
            absolute -top-2 left-1/2
            -translate-x-1/2
            w-16 h-10
          "
        >
          <span className="loader-steam loader-steam-1" />
          <span className="loader-steam loader-steam-2" />
          <span className="loader-steam loader-steam-3" />
        </div>
      </div>

      <div className="mt-6 text-center">
        <h1
          className="
            text-2xl font-bold
            text-foreground
            tracking-tight
            loader-text-reveal
          "
        >
          BiteLog
        </h1>

        <p
          className="
            text-xs text-muted-foreground
            mt-1
            loader-sub-reveal
          "
        >
          {t.your_food_diary}
        </p>
      </div>
    </div>
  );
}