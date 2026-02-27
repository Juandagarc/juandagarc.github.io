"use client";

import { useTranslation } from "./I18nProvider";
import { px } from "../utils/px";
import { useIsMobile } from "../utils/useIsMobile";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const imgMegaphone = "/assets/868b5bbaedc840a029791784ced86b2892ddea54.webp";
const imgShapes = "/assets/e52db3117dd722c709f957c8c46d77bc91992ff3.webp";
const imgDoubleDown = "/assets/6b67e94644a008c44eb8be2a796f9a04f64046af.webp";
const imgLines = "/assets/617a64f8be69ee9564acd32aa96143ca34cdfeeb.svg";

export default function HomeSection() {
    const { t, language } = useTranslation();
    const { scrollY } = useScroll();
    const isMobile = useIsMobile();

    // Parallax values
    const yHero = useTransform(scrollY, [0, 1000], [0, 200]);
    const yMegaphone = useTransform(scrollY, [0, 1000], [0, -150]);
    const yShapes = useTransform(scrollY, [0, 1000], [0, 150]);

    const scrollToAbout = () => {
        const el = document.getElementById("about");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    // ── MOBILE LAYOUT ───────────────────────────────────────────────────────
    if (isMobile) {
        return (
            <div
                id="home"
                style={{
                    width: "100%",
                    minHeight: "100svh",
                    position: "relative",
                    backgroundColor: "#0d0d0d",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: 80,
                    paddingBottom: 60,
                    paddingLeft: 24,
                    paddingRight: 24,
                    boxSizing: "border-box",
                    overflow: "hidden",
                }}
            >


                {/* Megaphone */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    style={{ position: "relative", width: 160, height: 100, marginBottom: 32 }}
                >
                    <Image src={imgMegaphone} alt="" fill priority sizes="200px" style={{ objectFit: "contain" }} />
                </motion.div>

                {/* Hero text */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    style={{
                        textAlign: "center",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: 52,
                        lineHeight: "1.15",
                        color: "#ffffff",
                    }}
                >
                    <div style={{ color: "#ffae00" }}>{t("hero.building")}</div>
                    <div style={{ color: "#5990ff" }}>{t("hero.experiences")}</div>
                    <div>
                        <span>{t("hero.that")}</span>
                        <span style={{ color: "#07cf07" }}>{t("hero.last")}</span>
                    </div>
                </motion.div>

                {/* Scroll down indicator */}
                <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    onClick={scrollToAbout}
                    style={{
                        marginTop: 48,
                        position: "relative",
                        width: 36,
                        height: 36,
                        cursor: "pointer",
                    }}
                >
                    <Image src={imgDoubleDown} alt="" fill sizes="48px" style={{ objectFit: "contain" }} />
                </motion.div>
            </div>
        );
    }

    // ── DESKTOP LAYOUT ──────────────────────────────────────────────────────
    return (
        <div
            id="home"
            style={{
                width: "100vw",
                height: px(1117),
                position: "relative",
            }}
        >
            {/* ── HERO TEXT: x:378 y:318 w:971 h:480 ── */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    y: yHero,
                    position: "absolute",
                    left: px(378),
                    top: px(318),
                    width: language === "es" ? px(1100) : px(971),
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: language === "es" ? px(135) : px(150),
                    lineHeight: px(160),
                    color: "#ffffff",
                }}
            >
                <div style={{ color: "#ffae00" }}>{t("hero.building")}</div>
                <div style={{ color: "#5990ff" }}>{t("hero.experiences")}</div>
                <div>
                    <span>{t("hero.that")}</span>
                    <span style={{ color: "#07cf07" }}>{t("hero.last")}</span>
                </div>
            </motion.div>

            {/* ── LINES DECORATION: x:1006 y:425 w:274 h:10 ── */}
            <div
                style={{
                    position: "absolute",
                    left: px(1006),
                    top: px(425),
                    width: px(274),
                    height: px(10),
                    overflow: "visible",
                }}
            >
                <div style={{ position: "absolute", top: px(-5), left: 0, width: "100%", height: px(20) }}>
                    <Image src={imgLines} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ display: "block", objectFit: "contain" }} />
                </div>
            </div>

            {/* ── MEGAPHONE: x:242 y:254 w:246 h:152 ── */}
            <motion.div
                style={{
                    y: yMegaphone,
                    position: "absolute",
                    left: px(242),
                    top: px(254),
                    width: px(246),
                    height: px(152),
                }}
            >
                <Image
                    src={imgMegaphone}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "contain", pointerEvents: "none" }}
                />
            </motion.div>

            {/* ── ABSTRACT SHAPES: x:976 y:627 w:354 h:374 ── */}
            <motion.div
                style={{
                    y: yShapes,
                    position: "absolute",
                    left: px(976),
                    top: px(627),
                    width: px(354),
                    height: px(374),
                }}
            >
                <Image
                    src={imgShapes}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "contain", pointerEvents: "none" }}
                />
            </motion.div>

            {/* ── DOUBLE DOWN: x:847 y:981 w:33 h:32 ── */}
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                onClick={scrollToAbout}
                style={{
                    position: "absolute",
                    left: px(847),
                    top: px(981),
                    width: px(33),
                    height: px(32),
                    cursor: "pointer",
                }}
            >
                <Image
                    src={imgDoubleDown}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "contain", pointerEvents: "none" }}
                />
            </motion.div>
        </div>
    );
}
