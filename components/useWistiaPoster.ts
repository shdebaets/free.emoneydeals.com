"use client";

import { useEffect, useState } from "react";

export function useWistiaPoster(mediaId: string, fallback?: string) {
    const [url, setUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const meta = await fetch(`https://fast.wistia.com/embed/medias/${mediaId}.json`, {
                    mode: "cors",
                    cache: "force-cache",
                }).then(r => r.json());

                const assets = meta?.media?.assets || [];
                const stills = assets.filter((a: any) => a.type === "still_image");
                const previews = assets.filter((a: any) => a.type === "preview");
                const pickLargest = (arr: any[]) =>
                    arr.sort((a, b) => (b.width || 0) - (a.width || 0))[0];

                const best = pickLargest(stills) || pickLargest(previews);
                let href: string | undefined = best?.url;

                if (href && !href.includes("image_crop_resized")) {
                    const sep = href.includes("?") ? "&" : "?";
                    href = `${href}${sep}image_crop_resized=1920x1080`;
                }

                if (alive) setUrl(href || fallback);
            } catch {
                if (alive) setUrl(fallback);
            }
        })();

        return () => { alive = false; };
    }, [mediaId, fallback]);

    return url;
}