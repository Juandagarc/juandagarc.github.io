"use client";

import { useTranslation } from "./I18nProvider";
import { px } from "../utils/px";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const imgDevImage = "/assets/dev_image.webp";
const imgBusinessStrategy = "/assets/business-strategy.webp";
const imgAbstractGlass = "/assets/abstract-glass.webp";
const imgImage1 = "/assets/social-top.webp";
const imgImage2 = "/assets/social-bottom.webp";
const imgImage3 = "/assets/social-right.webp";
const imgAbstractHuman = "/assets/abstract-human.webp";

export default function AboutSection() {
    const { t, language } = useTranslation();
    const { scrollYProgress } = useScroll();

    // Slight parallax based on overall scroll
    const yDevImage = useTransform(scrollYProgress, [0, 1], [-100, 100]);
    const yAbstractHuman = useTransform(scrollYProgress, [0, 1], [150, -50]);

    return (
        <div
            id="about"
            style={{
                width: "100vw",
                height: px(1117), // 64.64vw
                position: "relative",
                backgroundColor: "#0d0d0d",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    height: px(759),
                    left: px(45),
                    top: px(103),
                    width: px(1635),
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ display: "flex", gap: px(53), alignItems: "flex-start", width: "100%" }}
                >
                    {/* Dev Image */}
                    <motion.div
                        style={{
                            y: yDevImage,
                            height: px(759),
                            position: "relative",
                            width: px(569),
                            flexShrink: 0,
                            boxShadow: "0px 4px 4px 1px #2d2d2d",
                            borderRadius: px(10),
                            overflow: "hidden"
                        }}
                    >
                        <Image
                            alt=""
                            src={imgDevImage}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{
                                objectFit: "cover",
                            }}
                        />
                    </motion.div>

                    {/* Content Box */}
                    {/* Width adjusted to match Figma About-content width 1013 */}
                    <div style={{ position: "relative", flexShrink: 0, width: px(1013) }}>

                        {/* Title - Figma coords: x=675, y=41. Relative to About-content(x=622): left=53, top=41 */}
                        <div
                            style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontWeight: 800,
                                color: "#5990ff",
                                fontSize: language === "es" ? px(120) : px(150),
                                lineHeight: language === "es" ? px(130) : px(160),
                                position: "absolute",
                                left: px(53),
                                top: px(41),
                                width: language === "es" ? px(700) : px(473),
                                zIndex: 1,
                                whiteSpace: language === "es" ? "nowrap" : "normal",
                            }}
                        >
                            {t("about.title")}
                        </div>

                        {/* Chess Piece (Business Strategy) - Figma coords: x=622, y=97. Relative: left=0, top=97 */}
                        <div style={{ position: "absolute", left: px(0), top: px(97), width: px(105), height: px(104), zIndex: 10 }}>
                            <Image alt="" src={imgBusinessStrategy} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "contain" }} />
                        </div>

                        {/* DNA Glass - Figma coords: x=1403, y=0. Relative: left=781, top=0 */}
                        <div style={{ position: "absolute", left: px(781), top: px(0), width: px(232), height: px(254), zIndex: -1 }}>
                            <Image src={imgAbstractGlass} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "contain", pointerEvents: "none" }} />
                        </div>

                        {/* Description Card and Social Links */}
                        <div style={{ position: "absolute", left: px(18), top: px(225), display: "flex", flexDirection: "column", gap: px(40), zIndex: 10 }}>
                            <div
                                style={{
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    fontWeight: 400,
                                    fontSize: px(24),
                                    color: "white",
                                    textShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                                    width: px(958),
                                    padding: px(36),
                                    border: "2px solid white",
                                    borderRadius: px(10),
                                    position: "relative",
                                    zIndex: 2,
                                    whiteSpace: "pre-wrap",
                                    boxSizing: "border-box", // Ensure padding is contained in width
                                }}
                            >
                                {t("about.description")}
                            </div>

                            {/* Social Links */}
                            <div style={{ display: "flex", gap: px(26) }}>
                                {/* GitHub */}
                                <a href="https://github.com/Juandagarc" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ color: "white", transition: "color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", width: px(48), height: px(48) }} onMouseOver={(e) => e.currentTarget.style.color = "#07cf07"} onMouseOut={(e) => e.currentTarget.style.color = "white"}>
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                </a>
                                {/* LinkedIn */}
                                <a href="https://linkedin.com/in/juandagarc" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: "white", transition: "color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", width: px(48), height: px(48) }} onMouseOver={(e) => e.currentTarget.style.color = "#07cf07"} onMouseOut={(e) => e.currentTarget.style.color = "white"}>
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                                {/* Instagram */}
                                <a href="https://instagram.com/juandagarc" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: "white", transition: "color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", width: px(48), height: px(48) }} onMouseOver={(e) => e.currentTarget.style.color = "#07cf07"} onMouseOut={(e) => e.currentTarget.style.color = "white"}>
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Abstract human correctly positioned avoiding image overlap */}
                <motion.div
                    style={{
                        y: yAbstractHuman,
                        position: "absolute",
                        height: px(358),
                        left: px(302),
                        top: px(670),
                        width: px(320)
                    }}
                >
                    <Image src={imgAbstractHuman} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "contain", pointerEvents: "none" }} />
                </motion.div>
            </div>
        </div>
    );
}
