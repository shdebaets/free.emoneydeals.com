"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CalendlyInline from "@/components/CalendlyInline";
import WistiaVSL from "@/components/WistiaVSL";

const REQUIRED_SECONDS = 120; // e.g. 60 seconds = 1 minute

function formatMMSS(s: number) {
  const clamped = Math.max(0, Math.ceil(s));
  const m = Math.floor(clamped / 60);
  const sec = clamped % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function BonusCall() {
  const bookRef = useRef<HTMLDivElement | null>(null);
  const vslRef = useRef<HTMLDivElement | null>(null);

  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastPlayAt, setLastPlayAt] = useState<number | null>(null);

  const remaining = Math.max(0, REQUIRED_SECONDS - watchedSeconds);
  const unlocked = remaining <= 0;

  useEffect(() => {
    if (!isPlaying || lastPlayAt == null || unlocked) return;

    const tick = () => {
      const now = performance.now();
      const delta = (now - lastPlayAt) / 1000;
      setWatchedSeconds((prev) => {
        const next = prev + delta;
        return next >= REQUIRED_SECONDS ? REQUIRED_SECONDS : next;
      });
      setLastPlayAt(now);
      raf = requestAnimationFrame(tick);
    };

    let raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, lastPlayAt, unlocked]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        setIsPlaying(false);
        setLastPlayAt(null);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const scrollToBooking = () => {
    if (unlocked) {
      bookRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      vslRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-dvh pb-16">
      <div className="sticky top-0 z-50 bg-transparent">
        <div className="container-tight pt-3">
          <div className="card flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-br from-brand-purple to-brand-magenta" />
              <div className="text-xs font-semibold text-white/85">
                Bonus Call — eMoney
              </div>
            </div>

            <button
              onClick={scrollToBooking}
              className="btn btn-primary btn-sm"
              aria-disabled={!unlocked}
              title={
                unlocked
                  ? "Book now"
                  : `Unlocks after ${formatMMSS(remaining)} of watch time`
              }
            >
              {unlocked ? "Book now" : `Unlock in ${formatMMSS(remaining)}`}
            </button>
          </div>
        </div>
      </div>

      <section className="container-tight mt-8">
        <motion.h1
          className="text-center text-4xl font-black leading-tight"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          Welcome to{" "}
          <span className="bg-gradient-to-r from-brand-purple to-brand-magenta bg-clip-text text-transparent">
            eMoney
          </span>
        </motion.h1>

        <p className="mt-3 text-center text-sm text-white/80">
          Watch the first minute to unlock your free bonus call.
        </p>

        <div ref={vslRef} className="card mt-5 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <WistiaVSL
                mediaId="i5voqxuarc"
                caption="How members flip penny deals into daily profit"
                onEvents={{
                  play: () => {
                    setIsPlaying(true);
                    setLastPlayAt(performance.now());
                  },
                  pause: () => {
                    setIsPlaying(false);
                    setLastPlayAt(null);
                  },
                  quartile: (_pct) => {
                  },
                }}
              />
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-sm text-white/80">
            <div>✅ Exact steps to find live penny items near you</div>
            <div>✅ How alerts + aisles = speed (and why that matters)</div>
            <div>✅ What to do on the floor so you don’t miss</div>
          </div>

          <button
            onClick={scrollToBooking}
            className="btn btn-primary mt-4 w-full hover:shadow-glow"
          >
            {unlocked ? "Book your bonus call" : "Keep watching to unlock"}
          </button>

          <p className="mt-2 text-center text-[11px] text-white/60">
            {unlocked
              ? "You're unlocked—grab a time below."
              : "We only unlock the booking after you catch the key setup steps."}
          </p>
        </div>
      </section>

      <section ref={bookRef} className="container-tight mt-8">
        <div className="card relative min-h-[700px] p-4">
          <h3 className="text-center text-lg font-semibold">Lock your bonus call</h3>
          <p className="mt-1 text-center text-sm text-white/70">
            We’ll personalize your plan + answer questions.
          </p>

          {!unlocked && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[rgb(0_0_0_/_0.6)] backdrop-blur-[2px]">
              <div className="mx-auto max-w-sm text-center">
                <div className="text-sm text-white/80">
                  Booking unlocks after{" "}
                  <span className="font-semibold">{formatMMSS(remaining)}</span>{" "}
                  more watch time.
                </div>
                <div className="mt-3">
                  <button
                    onClick={() =>
                      vslRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                    className="btn btn-primary"
                  >
                    Go back to video
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={unlocked ? "" : "pointer-events-none blur-[1px]"}>
            <CalendlyInline url="https://calendly.com/omarfakhoury01/30min?background_color=191822&text_color=ffffff&primary_color=ff2e8f" />
          </div>
        </div>
      </section>

      <footer className="container-tight mt-10 text-center text-xs text-white/55">
        © {new Date().getFullYear()} eMoney • Terms • Privacy
      </footer>
    </main>
  );
}