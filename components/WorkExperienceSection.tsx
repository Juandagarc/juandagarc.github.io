"use client";
import { useRef } from "react";
import { useTranslation } from "./I18nProvider";
import { px } from "../utils/px";
import { useIsMobile } from "../utils/useIsMobile";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const imgGlassBulbWithAiStar = "/assets/glass-bulb.webp";
const imgFloatingAbstractObjectsMadeOfGlass = "/assets/floating-objects.webp";
const imgFlow = "/assets/flow-line.svg";
const imgStar = "/assets/iridescent-rhombus.webp";

export default function WorkExperienceSection() {
    const { t, language } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

    const yBulb = useTransform(scrollYProgress, [0, 0.5, 1], [-150, 0, 150]);
    const yStar = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
    const yStones = useTransform(scrollYProgress, [0, 0.5, 1], [150, 0, -150]);

    const jobs: unknown = t("work.jobs");
    const milestones: unknown = t("work.milestones");

    // ── MOBILE LAYOUT ─────────────────────────────────────────────────────────
    if (isMobile) {
        return (
            <div
                id="work"
                style={{
                    width: "100%",
                    backgroundColor: "#0d0d0d",
                    paddingTop: 60,
                    paddingBottom: 60,
                    paddingLeft: 24,
                    paddingRight: 24,
                    boxSizing: "border-box",
                }}
            >
                {/* Single centered inner wrapper */}
                <div style={{ maxWidth: 500, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.7 }}
                        style={{ textAlign: "center" }}
                    >
                        <div style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: 48,
                            lineHeight: 1.1,
                            color: "#ffae00",
                        }}>
                            {t("work.title1")}
                        </div>
                        <div style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: 48,
                            lineHeight: 1.1,
                            color: "white",
                        }}>
                            {t("work.title2")}
                        </div>
                    </motion.div>

                    {/* ── MILESTONES ── */}
                    <div>
                        <h3 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: 20,
                            color: "#888",
                            margin: "0 0 16px 0",
                            textTransform: "uppercase",
                            letterSpacing: 2,
                        }}>
                            Education
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {Array.isArray(milestones) && milestones.map((ms: { title?: string; year?: string }, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 16,
                                        backgroundColor: idx === 1 ? "#aa1e1e" : "#1e1e1e",
                                        borderRadius: 10,
                                        padding: "16px 20px",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    {/* Year badge */}
                                    <div style={{
                                        flexShrink: 0,
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        fontWeight: 700,
                                        fontSize: 13,
                                        color: idx === 2 ? "#8d8d8d" : "white",
                                        textAlign: "center",
                                        minWidth: 44,
                                        lineHeight: 1.2,
                                    }}>
                                        {ms.year}
                                    </div>
                                    {/* Divider */}
                                    <div style={{ width: 2, height: 36, backgroundColor: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                                    {/* Title */}
                                    <div style={{
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        fontWeight: idx === 1 ? 500 : 400,
                                        fontSize: 15,
                                        color: "white",
                                        lineHeight: 1.4,
                                    }}>
                                        {ms.title}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* ── JOBS ── */}
                    <div>
                        <h3 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: 20,
                            color: "#888",
                            margin: "0 0 16px 0",
                            textTransform: "uppercase",
                            letterSpacing: 2,
                        }}>
                            Experience
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {Array.isArray(jobs) && jobs.map((job: { title?: string; duration?: string }, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.5, delay: idx * 0.12 }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        backgroundColor: "#2d2d2d",
                                        borderRadius: 10,
                                        padding: "16px 20px",
                                        boxSizing: "border-box",
                                        gap: 16,
                                    }}
                                >
                                    <div style={{
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        fontWeight: 400,
                                        fontSize: 15,
                                        color: "white",
                                        lineHeight: 1.4,
                                        flex: 1,
                                    }}>
                                        {job.title}
                                    </div>
                                    <div style={{
                                        flexShrink: 0,
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        fontWeight: 600,
                                        fontSize: 13,
                                        color: "#07cf07",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {job.duration}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── DESKTOP LAYOUT ────────────────────────────────────────────────────────
    return (
        <div
            id="work"
            ref={ref}
            style={{
                width: "100vw",
                height: px(1117),
                position: "relative",
                backgroundColor: "#0d0d0d",
                overflow: "hidden",
            }}
        >
            {/* Title */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    position: "absolute",
                    top: px(319),
                    left: language === "es" ? px(900) : px(1039),
                    width: language === "es" ? px(900) : px(459),
                    height: px(480),
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: language === "es" ? "center" : "flex-start",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: language === "es" ? px(105) : px(150),
                    lineHeight: language === "es" ? px(115) : px(160),
                }}
            >
                <div style={{ color: "#ffae00", lineHeight: language === "es" ? px(115) : px(160) }}>{t("work.title1")}</div>
                {language === "es" ? (
                    <div style={{ color: "white", lineHeight: px(115), marginTop: px(-10) }}>{t("work.title2")}</div>
                ) : (
                    <>
                        <div style={{ color: "white", lineHeight: px(160), marginTop: px(-10), wordBreak: "break-all" }}>exper</div>
                        <div style={{ color: "white", lineHeight: px(160), marginTop: px(-10), wordBreak: "break-all" }}>ience</div>
                    </>
                )}
            </motion.div>

            {/* Floating Icons near title */}
            <motion.div style={{ position: "absolute", left: language === "es" ? px(850) : px(998), top: language === "es" ? px(400) : px(393), width: px(63), height: px(77), transform: "rotate(-70.43deg)", zIndex: 10, y: yBulb }}>
                <Image src={imgGlassBulbWithAiStar} alt="" fill sizes="5vw" style={{ objectFit: "contain" }} />
            </motion.div>
            <motion.div style={{ position: "absolute", left: language === "es" ? px(1250) : px(1398), top: language === "es" ? px(650) : px(651), width: px(85), height: px(75), transform: "rotate(21.83deg)", zIndex: 10, y: yStar }}>
                <Image src={imgStar} alt="" fill sizes="5vw" style={{ objectFit: "contain" }} />
            </motion.div>

            {/* Floating abstract objects (stones) */}
            <motion.div style={{ position: "absolute", left: px(1431), top: px(757), width: px(297), height: px(372), y: yStones }}>
                <Image src={imgFloatingAbstractObjectsMadeOfGlass} alt="" fill sizes="20vw" style={{ objectFit: "contain" }} />
            </motion.div>

            {/* Flow SVG line */}
            <div style={{ position: "absolute", left: px(277.5), top: px(154), width: px(421), height: px(810), zIndex: 10, pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: "-0.99%", right: "0%", bottom: "-1.07%", left: "-2.06%" }}>
                    <Image src={imgFlow} alt="" fill sizes="30vw" style={{ objectFit: "contain", display: "block" }} />
                </div>
            </div>

            {/* Milestones (Left side) */}
            <div style={{ position: "absolute", left: px(109), top: px(238), display: "flex", flexDirection: "column", gap: px(108) }}>
                {Array.isArray(milestones) && milestones.map((ms: { title?: string; year?: string }, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: idx * 0.2 }}
                        key={idx}
                        style={{ position: "relative", width: px(309), height: px(142) }}
                    >
                        <div style={{ position: "absolute", left: px(30), width: px(279), height: "100%", backgroundColor: idx === 1 ? "#aa1e1e" : "#1e1e1e", borderRadius: px(10) }} />
                        <div style={{ position: "absolute", left: px(57), width: px(226), height: px(142), display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "white", fontSize: px(24), fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: idx === 1 ? 500 : 400 }}>
                            {ms.title}
                        </div>
                        <div style={{ position: "absolute", left: px(15), top: px(71), transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ transform: "rotate(-90deg)", color: idx === 2 ? "#8d8d8d" : "white", fontSize: px(24), fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: idx === 2 ? 700 : 500, whiteSpace: "nowrap" }}>
                                {ms.year}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Jobs (Right side) */}
            <div style={{ position: "absolute", left: px(525), top: px(289), display: "flex", flexDirection: "column", gap: px(14) }}>
                {Array.isArray(jobs) && jobs.map((job: { title?: string; duration?: string }, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                        key={idx}
                        style={{ position: "relative", width: px(312), height: px(142) }}
                    >
                        <div style={{ position: "absolute", left: 0, top: 0, backgroundColor: "#2d2d2d", width: px(279), height: px(142), borderRadius: px(10) }} />
                        <div style={{ position: "absolute", left: px(26.5), width: px(226), height: px(142), display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "white", fontSize: px(24), fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}>
                            {job.title}
                        </div>
                        <div style={{ position: "absolute", left: px(297), top: px(71), transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ transform: "rotate(90deg)", color: "white", fontSize: px(24), fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>
                                {job.duration}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
