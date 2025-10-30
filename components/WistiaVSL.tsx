"use client";

import { useEffect, useRef, useState } from "react";
import { useWistiaPoster } from "./useWistiaPoster";

function useWistiaScript() {
    useEffect(() => {
        if (document.querySelector('script[src^="https://fast.wistia.com/assets/external/E-v1.js"]')) return;
        const s = document.createElement("script");
        s.src = "https://fast.wistia.com/assets/external/E-v1.js";
        s.async = true;
        document.head.appendChild(s);
        return () => { };
    }, []);
}

type Props = {
    mediaId: string;
    caption?: string;
    posterUrl?: string;
    onPlayClick?: () => void;
    onEvents?: {
        play?: () => void;
        pause?: () => void;
        quartile?: (pct: 25 | 50 | 75 | 100) => void;
    };
};

export default function WistiaVSL({ mediaId, caption, posterUrl, onPlayClick, onEvents }: Props) {
    useWistiaScript();
    const [playing, setPlaying] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const fetchedPoster = useWistiaPoster(mediaId, posterUrl);
    const poster = posterUrl || fetchedPoster || `https://fast.wistia.com/embed/medias/${mediaId}/swatch`;

    useEffect(() => {
        if (!playing || !onEvents) return;
        // @ts-expect-error wistia globals
        window._wq = window._wq || [];
        // @ts-expect-error wistia globals
        window._wq.push({
            id: mediaId,
            onReady: (video: any) => {
                if (onEvents.play) video.bind("play", onEvents.play);
                if (onEvents.pause) video.bind("pause", onEvents.pause);
                if (onEvents.quartile) {
                    video.bind("secondchange", () => {
                        const p = Math.round((video.time() / video.duration()) * 100);
                        if ([25, 50, 75, 100].includes(p)) onEvents.quartile!(p as 25 | 50 | 75 | 100);
                    });
                }
            },
        });
    }, [playing, mediaId, onEvents]);

    const handlePlayClick = () => {
        if (onPlayClick) {
            onPlayClick();
        }
        setPlaying(true);
    };

    return (
        <div className="relative overflow-hidden rounded-xl border border-white/10">
            <div className="relative aspect-video w-full bg-black/40">
                {!playing && (
                    <button
                        type="button"
                        onClick={handlePlayClick}
                        className="group absolute inset-0"
                        aria-label="Play video"
                    >
                        <img src={poster} alt="" className="h-full w-full object-cover opacity-95" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute inset-0 grid place-items-center">
                            <div className="flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md border border-white/10">
                                <div className="grid place-items-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta h-10 w-10">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-semibold">Play Video</span>
                            </div>
                        </div>
                    </button>
                )}

                {playing && (
                    <div
                        ref={containerRef}
                        className="wistia_responsive_wrapper absolute inset-0"
                        style={{ height: "100%", width: "100%" }}
                    >
                        <iframe
                            className="wistia_embed"
                            src={`https://fast.wistia.net/embed/iframe/${mediaId}?videoFoam=true&autoplay=1&muted=1&playsinline=1&seo=false&controlsVisibleOnLoad=true`}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title="Wistia video"
                            referrerPolicy="no-referrer-when-downgrade"
                            style={{ width: "100%", height: "100%", border: 0 }}
                        />
                    </div>
                )}
            </div>

            {caption ? (
                <div className="bg-[color:var(--card)] px-3 py-2 text-sm text-white/80">{caption}</div>
            ) : null}
        </div>
    );
}