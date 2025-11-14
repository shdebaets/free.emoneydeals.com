"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import WistiaVSL from "@/components/WistiaVSL";

// ——— CONFIG ———
const REQUIRED_SECONDS = 90;

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

  // Simple wall-clock countdown
  const [remaining, setRemaining] = useState(REQUIRED_SECONDS);
  const unlocked = remaining <= 0;
  const startAtRef = useRef<number | null>(null);

  useEffect(() => {
    startAtRef.current = Date.now();
    const id = setInterval(() => {
      if (!startAtRef.current) return;
      const elapsed = Math.floor((Date.now() - startAtRef.current) / 1000);
      setRemaining(Math.max(0, REQUIRED_SECONDS - elapsed));
    }, 250);
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
                Stay in eMoney & Get 3 Days Free
              </div>
            </div>

            <button
              onClick={scrollToBooking}
              className="btn btn-primary btn-sm"
              aria-disabled={!unlocked}
              title={
                unlocked
                  ? "Activate your 3 free days"
                  : `Unlocks in ${formatMMSS(remaining)}`
              }
            >
              {unlocked ? "Activate 3 Free Days" : `Unlock in ${formatMMSS(remaining)}`}
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
          Thinking Of Canceling?{" "}
          <span className="bg-gradient-to-r from-brand-purple to-brand-magenta bg-clip-text text-transparent">
            Watch This First
          </span>{" "}
          & Get <span className="text-brand-magenta">3 Extra Days Free</span>
        </motion.h1>

        <p className="mt-3 text-center text-sm text-white/80">
          Watch this short video to see how to actually use your membership. Once
          the timer hits zero, you&apos;ll unlock a{" "}
          <span className="font-semibold">3-day free extension</span> to stay in
          the community instead of canceling.
        </p>

        <div ref={vslRef} className="card mt-5 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <WistiaVSL
                mediaId="gx53ks9jkf"
                caption="How to use eMoney the right way so you actually get results"
                onPlayClick={handlePlayVideo}
                onEvents={{
                  play: () => trackEvent("wistia_play"),
                  pause: () => trackEvent("wistia_pause"),
                  quartile: (_pct) => {},
                }}
              />
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-sm text-white/80">
            
          </div>

          <button
            onClick={handleKeepWatchingClick}
            className="btn btn-primary mt-4 w-full hover:shadow-glow"
          >
            {unlocked ? "I Want My 3 Free Days & To Stay" : "Keep Watching To Unlock 3 Free Days"}
          </button>

          <p className="mt-2 text-center text-[11px] text-white/60">
            {unlocked
              ? "You’ve unlocked your extension—confirm below to keep your access + get 3 days free."
              : "To unlock your 3-day free extension, you need to finish the key parts of this video."}
          </p>
        </div>
      </section>

      {/* “Uncancel” / 3-Day Extension (Typeform) */}
      <section ref={bookRef} className="container-tight mt-8">
        <div className="card relative min-h-[700px] p-4">
          <h3 className="text-center text-lg font-semibold">
            Confirm You&apos;re Staying & Activate Your 3 Free Days
          </h3>
          <p className="mt-1 text-center text-sm text-white/70">
            Fill this out to keep your membership active, get 3 extra days for free,
            and let us know what support you need to actually get results.
          </p>

          {!unlocked && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[rgb(0_0_0_/_0.6)] backdrop-blur-[2px]">
              <div className="mx-auto max-w-sm text-center">
                <div className="text-sm text-white/80">
                  Your 3-day free extension unlocks in{" "}
                  <span className="font-semibold">{formatMMSS(remaining)}</span>.
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleGoBackToVideoClick}
                    className="btn btn-primary"
                  >
                    Go Back To Video
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={unlocked ? "" : "pointer-events-none blur-[1px]"}>
            {/* Use this form to collect “why were you canceling / what do you need” + confirm they want to stay */}
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
