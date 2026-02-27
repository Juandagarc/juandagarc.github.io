"use client";

import { useTranslation } from "./I18nProvider";
import { px } from "../utils/px";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useIsMobile } from "../utils/useIsMobile";

const imgEarthGlobe = "/assets/92b9b428999016f1c32488d030aef3a460492980.webp";
const imgLogo = "/assets/105a200fc672a2ad41d145328a723eeb0564bbc1.svg";

export default function Navbar() {
    const { t, language, setLanguage } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();

    const handleScroll = (id: string) => {
        setIsOpen(false);
        if (pathname !== "/") {
            router.push(`/#${id}`);
            return;
        }
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    // ── MOBILE NAV ──────────────────────────────────────────────────────────
    if (isMobile) {
        return (
            <>
                {/* Fixed top bar */}
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: 64,
                    backgroundColor: "#0d0d0d", zIndex: 100,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingLeft: 24, paddingRight: 24, boxSizing: "border-box",
                }}>
                    {/* Logo */}
                    <div
                        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                        onClick={() => handleScroll("home")}
                    >
                        <div style={{ position: "relative", width: 32, height: 16 }}>
                            <Image src={imgLogo} alt="" fill style={{ objectFit: "contain" }} />
                        </div>
                        <span style={{ color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 18 }}>
                            Juandagarc
                        </span>
                    </div>

                    {/* Hamburger button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                        style={{
                            background: "transparent", border: "none", cursor: "pointer",
                            display: "flex", flexDirection: "column", gap: 5,
                            justifyContent: "center", alignItems: "center",
                            width: 40, height: 40, padding: 0,
                        }}
                    >
                        <span style={{
                            display: "block", width: 26, height: 2, backgroundColor: "white", borderRadius: 2,
                            transformOrigin: "center",
                            transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
                            transition: "transform 0.25s ease",
                        }} />
                        <span style={{
                            display: "block", width: 26, height: 2, backgroundColor: "white", borderRadius: 2,
                            opacity: isOpen ? 0 : 1,
                            transition: "opacity 0.25s ease",
                        }} />
                        <span style={{
                            display: "block", width: 26, height: 2, backgroundColor: "white", borderRadius: 2,
                            transformOrigin: "center",
                            transform: isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
                            transition: "transform 0.25s ease",
                        }} />
                    </button>
                </div>

                {/* Full-screen overlay menu */}
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "#0d0d0d",
                    zIndex: 99,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 36,
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? "all" : "none",
                    transition: "opacity 0.3s ease",
                }}>
                    {[
                        { label: t("nav.about"), id: "about" },
                        { label: t("nav.projects"), id: "projects" },
                        { label: t("work.title1"), id: "work" },
                    ].map(({ label, id }) => (
                        <button
                            key={id}
                            onClick={() => handleScroll(id)}
                            style={{
                                background: "transparent", border: "none", cursor: "pointer",
                                color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontWeight: 700, fontSize: 32,
                            }}
                        >
                            {label}
                        </button>
                    ))}
                    <a
                        href="/contact"
                        onClick={() => setIsOpen(false)}
                        style={{
                            color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700, fontSize: 32, textDecoration: "none",
                        }}
                    >
                        {t("nav.contact")}
                    </a>

                    {/* Language toggle */}
                    <button
                        onClick={() => { setLanguage(language === "en" ? "es" : "en"); setIsOpen(false); }}
                        style={{
                            marginTop: 16,
                            display: "flex", alignItems: "center", gap: 12,
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: 50, padding: "10px 24px",
                            cursor: "pointer",
                        }}
                    >
                        <div style={{ position: "relative", width: 28, height: 28 }}>
                            <Image src={imgEarthGlobe} alt="" fill sizes="64px" style={{ objectFit: "contain" }} />
                        </div>
                        <span style={{ color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18 }}>
                            {language === "en" ? "EN" : "ES"}
                        </span>
                    </button>
                </div>
            </>
        );
    }

    // ── DESKTOP NAV ─────────────────────────────────────────────────────────
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
                    <Image
                        src={imgLogo}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ display: "block" }}
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
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                        <Image
                            src={imgEarthGlobe}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: "contain", pointerEvents: "none" }}
                        />
                    </div>
                </button>
            </div>
        </div>
    );
}
