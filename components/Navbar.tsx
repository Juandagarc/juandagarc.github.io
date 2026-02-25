"use client";

import { useTranslation } from "./I18nProvider";
import { px } from "../utils/px";
import { usePathname, useRouter } from "next/navigation";

const imgEarthGlobe = "./assets/92b9b428999016f1c32488d030aef3a460492980.png";
const imgLogo = "./assets/105a200fc672a2ad41d145328a723eeb0564bbc1.svg";

export default function Navbar() {
    const { t, language, setLanguage } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();

    const handleScroll = (id: string) => {
        if (pathname !== "/") {
            router.push(`/#${id}`);
            return;
        }
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: px(81),
                backgroundColor: "#0d0d0d",
                zIndex: 50,
            }}
        >
            {/* ── NAV CONTENT: x:113 y:25.5 w:1502 h:30 ── */}
            <div
                style={{
                    position: "absolute",
                    top: px(25.5),
                    left: px(113),
                    display: "inline-grid",
                    gridTemplateColumns: `${px(40)} auto`,
                    alignItems: "center",
                    gap: 0,
                    height: px(30),
                    cursor: "pointer",
                }}
                onClick={() => handleScroll("home")}
            >
                <div style={{ position: "relative", width: px(40), height: px(20) }}>
                    <img
                        src={imgLogo}
                        alt=""
                        style={{ position: "absolute", display: "block", width: "100%", height: "100%" }}
                    />
                </div>
                <p
                    style={{
                        margin: 0,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 500,
                        fontSize: px(24),
                        lineHeight: "normal",
                        color: "#ffffff",
                        whiteSpace: "nowrap",
                    }}
                >
                    Juandagarc
                </p>
            </div>

            {/* ── NAV LINKS: right-anchored ── */}
            <div
                style={{
                    position: "absolute",
                    top: px(-5),
                    right: px(113),
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: px(30),
                    height: px(91),
                }}
            >
                <p
                    style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: px(24), lineHeight: "normal", color: "#fff", whiteSpace: "nowrap", cursor: "pointer" }}
                    onClick={() => handleScroll("about")}
                >
                    {t("nav.about")}
                </p>
                <p
                    style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: px(24), lineHeight: "normal", color: "#fff", whiteSpace: "nowrap", cursor: "pointer" }}
                    onClick={() => handleScroll("projects")}
                >
                    {t("nav.projects")}
                </p>
                <p
                    style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: px(24), lineHeight: "normal", color: "#fff", whiteSpace: "nowrap", cursor: "pointer" }}
                    onClick={() => handleScroll("work")}
                >
                    {t("work.title1")}
                </p>
                <a
                    href="/contact"
                    style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: px(24), lineHeight: "normal", color: "#fff", whiteSpace: "nowrap", cursor: "pointer", textDecoration: "none" }}
                >
                    {t("nav.contact")}
                </a>

                <button
                    onClick={() => setLanguage(language === "en" ? "es" : "en")}
                    aria-label="Toggle language"
                    style={{
                        width: px(39),
                        height: px(91),
                        flexShrink: 0,
                        padding: 0,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <img
                        src={imgEarthGlobe}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
                    />
                </button>
            </div>
        </div>
    );
}
