import { useState, useEffect } from "react";

/**
 * Returns true when the viewport width is below 1024px (tablet/mobile).
 * Uses a media-query listener so it updates on resize.
 * SSR-safe: defaults to false (desktop) on the server.
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 1023px)");
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return isMobile;
}
