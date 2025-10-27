"use client";

import { useEffect, useRef } from "react";

type Props = {
    url: string;
    initialHeight?: number;
    className?: string;
};

declare global {
    interface Window {
        Calendly?: {
            initInlineWidget: (opts: {
                url: string;
                parentElement: HTMLElement;
                resize?: boolean;
            }) => void;
            destroyInlineWidgets?: () => void;
        };
    }
}

export default function CalendlyInline({
    url,
    initialHeight = 700,
    className = "",
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const src = "https://assets.calendly.com/assets/external/widget.js";

        let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
        let added = false;
        if (!script) {
            script = document.createElement("script");
            script.src = src;
            script.async = true;
            document.body.appendChild(script);
            added = true;
        }

        const init = () => {
            if (!containerRef.current || !window.Calendly) return;
            window.Calendly.initInlineWidget({
                url,
                parentElement: containerRef.current,
                resize: true,
            });
        };

        if ((script as any).readyState === "complete") {
            init();
        } else {
            script!.addEventListener("load", init, { once: true });
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
            
            try {
                window.Calendly?.destroyInlineWidgets?.();
            } catch { /* ignore */ }

            if (added && script && script.parentNode) {
                /* ignore */
            }
        };
    }, [url]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ minWidth: 320, height: initialHeight }}
        />
    );
}
