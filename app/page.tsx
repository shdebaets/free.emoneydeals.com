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

export default function BonusCall() {
  const vslRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Timer logic
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

  const scrollToUnlock = () => {
    if (unlocked) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      trackEvent("scroll_to_locked_section");
      vslRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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
              onClick={scrollToUnlock}
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
          Watch this short video to see how to use your membership the right way.  
          When the timer hits zero, you’ll unlock your{" "}
          <span className="font-semibold">3-day free extension</span>.
        </p>

        <div ref={vslRef} className="card mt-5 p-3">
          <WistiaVSL
            mediaId="gx53ks9jkf"
            caption="How to use eMoney the right way so you actually get results"
            onPlayClick={() => trackEvent("wistia_play")}
            onEvents={{
              play: () => trackEvent("wistia_play"),
              pause: () => trackEvent("wistia_pause"),
              quartile: () => {},
            }}
          />

          <div className="mt-3 grid gap-2 text-sm text-white/80">
           
          </div>

          <button
            onClick={scrollToUnlock}
            className="btn btn-primary mt-4 w-full hover:shadow-glow"
          >
            {unlocked
              ? "Claim My 3 Free Days"
              : "Keep Watching To Unlock 3 Free Days"}
          </button>

          <p className="mt-2 text-center text-[11px] text-white/60">
            {unlocked
              ? "Unlocked — scroll below to activate."
              : "Your 3-day extension unlocks when the timer hits zero."}
          </p>
        </div>
      </section>

      {/* Uncancel Section */}
      <section ref={sectionRef} className="container-tight mt-10">
        <div className="card p-5 relative">
          <h3 className="text-center text-lg font-semibold">
            Activate Your Free 3-Day Extension
          </h3>
          <p className="mt-1 text-center text-sm text-white/70">
            Once unlocked, click below to uncancel or update payment and instantly
            receive your free 3-day extension.
          </p>

          {!unlocked && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[rgb(0_0_0_/_0.6)] backdrop-blur-[2px]">
              <div className="text-center text-white/80 text-sm">
                Unlocks in{" "}
                <span className="font-semibold">{formatMMSS(remaining)}</span>
              </div>
            </div>
          )}

          <div className={unlocked ? "" : "pointer-events-none blur-[1px]"}>
            <a
              href="https://whop.com/@me/settings/orders/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-6 w-full text-center"
            >
              Uncancel / Update Payment
            </a>

            <p className="mt-3 text-center text-xs text-white/60">
              Uncancel or update your payment method to claim your free 3-day extension.
            </p>
          </div>
        </div>
      </section>

      <footer className="container-tight mt-10 text-center text-xs text-white/55">
        © {new Date().getFullYear()} eMoney • Terms • Privacy
      </footer>
    </main>
  );
}
