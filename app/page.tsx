"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import WistiaVSL from "@/components/WistiaVSL";

// ——— CONFIG ———
const REQUIRED_SECONDS = 600;

// ——— UTILS ———
function formatMMSS(s: number) {
  const clamped = Math.max(0, Math.ceil(s));
  const m = Math.floor(clamped / 60);
  const sec = clamped % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

async function trackEvent(event: string) {
  try {
    await fetch("https://emoneydeals.com/api/web-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: window.location.href,
        event,
      }),
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

// ——— TYPEFORM INLINE (no external package needed) ———
function TypeformInline({ formId }: { formId: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-tf-embed]");
    if (!existing) {
      const s = document.createElement("script");
      s.src = "//embed.typeform.com/next/embed.js";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-tf-embed", "1");
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-[700px] w-full"
      data-tf-live={formId}
    />
  );
}

export default function BonusCall() {
  const bookRef = useRef<HTMLDivElement | null>(null);
  const vslRef = useRef<HTMLDivElement | null>(null);

  // ⬇️ NEW: simple wall-clock countdown (no video dependency)
  const [remaining, setRemaining] = useState(REQUIRED_SECONDS);
  const unlocked = remaining <= 0;
  const startAtRef = useRef<number | null>(null);

  useEffect(() => {
    startAtRef.current = Date.now();
    const id = setInterval(() => {
      if (!startAtRef.current) return;
      const elapsed = Math.floor((Date.now() - startAtRef.current) / 1000);
      setRemaining(Math.max(0, REQUIRED_SECONDS - elapsed));
    }, 250); // smooth enough; uses wall clock so throttling won’t drift
    return () => clearInterval(id);
  }, []);

  // Track scroll events (kept)
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        trackEvent("scroll");
      }, 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const scrollToBooking = () => {
    if (unlocked) {
      bookRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      trackEvent("unlock_in_button");
      vslRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleKeepWatchingClick = () => {
    trackEvent("keep_watching_to_unlock");
    scrollToBooking();
  };

  const handleGoBackToVideoClick = () => {
    trackEvent("go_back_to_video");
    vslRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePlayVideo = () => {
    trackEvent("play_video_button");
  };

  return (
    <main className="min-h-dvh pb-16">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-transparent">
        <div className="container-tight pt-3">
          <div className="card flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-br from-brand-purple to-brand-magenta" />
              <div className="text-xs font-semibold text-white/85">
                Free Bonus Call | eMoney
              </div>
            </div>

            <button
              onClick={scrollToBooking}
              className="btn btn-primary btn-sm"
              aria-disabled={!unlocked}
              title={
                unlocked
                  ? "Book now"
                  : `Unlocks in ${formatMMSS(remaining)}`
              }
            >
              {unlocked ? "Book now" : `Unlock in ${formatMMSS(remaining)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Hero + VSL */}
      <section className="container-tight mt-8">
        <motion.h1
          className="text-center text-4xl font-black leading-tight"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          Book Your{" "}
          <span className="bg-gradient-to-r from-brand-purple to-brand-magenta bg-clip-text text-transparent">
            Free Bonus Amazon Reselling
          </span>{" "}
          1 on 1 Call Now
        </motion.h1>

        <p className="mt-3 text-center text-sm text-white/80">
          Watch the first minute to unlock your free bonus call.
        </p>

        <div ref={vslRef} className="card mt-5 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <WistiaVSL
                mediaId="f783avi3bj"
                caption="How members scale up to $20,000+/month with Amazon Reselling"
                onPlayClick={handlePlayVideo}
                onEvents={{
                  // ⬇️ We keep these for analytics only; no timer control anymore
                  play: () => trackEvent("wistia_play"),
                  pause: () => trackEvent("wistia_pause"),
                  quartile: (_pct) => {},
                }}
              />
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-sm text-white/80">
            <div>✅ Personalized steps to resell on the most powerful platform</div>
            <div>✅ Accelerate your progress by learning to resell on Amazon</div>
            <div>✅ Skip the guesswork</div>
          </div>

          <button
            onClick={handleKeepWatchingClick}
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

      {/* Booking (Typeform) */}
      <section ref={bookRef} className="container-tight mt-8">
        <div className="card relative min-h-[700px] p-4">
          <h3 className="text-center text-lg font-semibold">Lock your bonus call</h3>
          <p className="mt-1 text-center text-sm text-white/70">
            We'll personalize your plan + answer questions.
          </p>

          {!unlocked && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[rgb(0_0_0_/_0.6)] backdrop-blur-[2px]">
              <div className="mx-auto max-w-sm text-center">
                <div className="text-sm text-white/80">
                  Booking unlocks in{" "}
                  <span className="font-semibold">{formatMMSS(remaining)}</span>.
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleGoBackToVideoClick}
                    className="btn btn-primary"
                  >
                    Go back to video
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={unlocked ? "" : "pointer-events-none blur-[1px]"}>
            <TypeformInline formId="01K8NV9S6T9VKEPWMEXDEXZTMR" />
          </div>
        </div>
      </section>

      <footer className="container-tight mt-10 text-center text-xs text-white/55">
        © {new Date().getFullYear()} eMoney • Terms • Privacy
      </footer>
    </main>
  );
}
