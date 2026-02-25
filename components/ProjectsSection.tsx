"use client";

import { useState, useRef } from "react";
import { useTranslation } from "./I18nProvider";
import { px } from "../utils/px";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const imgExternalLink = "/assets/external-link.webp";
const imgImage1 = "/assets/social-top.webp"; // reusing github icon
const imgMac = "/assets/mac-mockup.webp";
const imgForward = "/assets/forward-arrow.webp";
const imgBack = "/assets/back-arrow.webp";
const imgLaptopBlue = "/assets/laptop-blue.webp";
const imgTransparentIphone = "/assets/transparent-iphone.webp";
const imgPagination = "/assets/pagination.svg";

// The project items content component
const ProjectItem = ({ title, description, link, github }: { title: string, description: string, link: string, github: string }) => {
    return (
        <div style={{ height: px(564), position: "relative", width: px(385), flexShrink: 0 }}>
            {/* White Background underneath */}
            <div style={{ backgroundColor: "white", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: px(10) }} />

            {/* Inner content */}
            <div style={{ zIndex: 2, position: "relative", width: "100%", height: "100%" }}>
                <div style={{ position: "absolute", left: px(26), right: px(26), top: px(99), height: px(195) }}>
                    <div style={{ position: "absolute", width: "120%", height: "135%", left: "-10%", top: "-15%" }}>
                        <Image src={imgMac} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "contain" }} />
                    </div>
                </div>

                <div style={{
                    position: "absolute",
                    top: px(290),
                    left: px(26),
                    right: px(26),
                    display: "flex",
                    flexDirection: "column",
                    gap: px(12)
                }}>
                    <div style={{ textAlign: "left", color: "black", fontWeight: 700, fontSize: px(30), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {title}
                    </div>

                    <div style={{ textAlign: "left", color: "black", fontWeight: 500, fontSize: px(24.355), fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "pre-wrap" }}>
                        {description}
                    </div>

                    {/* Buttons bottom */}
                    <div style={{ display: "flex", gap: px(25), marginTop: px(8) }}>
                        <a href={link} target="_blank" rel="noreferrer" aria-label="View Project" style={{ backgroundColor: "#5990ff", width: px(145), height: px(56), borderRadius: px(10), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <div style={{ position: "relative", width: px(48), height: px(48) }}>
                                <Image src={imgExternalLink} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "contain" }} />
                            </div>
                        </a>
                        <a href={github} target="_blank" rel="noreferrer" aria-label="View Source Code" style={{ backgroundColor: "#1e1e1e", width: px(145), height: px(56), borderRadius: px(10), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <div style={{ position: "relative", width: px(48), height: px(48) }}>
                                <Image src={imgImage1} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "cover" }} />
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* Top rounded decoration window bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: px(65), zIndex: 1 }}>
                <div style={{ backgroundColor: "#d9d9d9", width: "100%", height: "100%", borderRadius: `${px(10)} ${px(10)} 0 0` }} />
                <div style={{ position: "absolute", top: px(21), left: px(26), display: "flex", gap: px(18) }}>
                    <div style={{ backgroundColor: "#ff4f4f", width: px(30), height: px(30), borderRadius: "50%" }} />
                    <div style={{ backgroundColor: "#ffbf00", width: px(30), height: px(30), borderRadius: "50%" }} />
                    <div style={{ backgroundColor: "#39e239", width: px(30), height: px(30), borderRadius: "50%" }} />
                </div>
            </div>
        </div>
    );
};

export default function ProjectsSection() {
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Parallax mapped to hit 0 exactly when section is centered
    const yLaptop = useTransform(scrollYProgress, [0, 0.5, 1], [150, 0, -150]);
    const yIphone = useTransform(scrollYProgress, [0, 0.5, 1], [-100, 0, 100]);

    // Create dummy projects array just to show sliding functionality.
    // In a real app, this would be fueled by locales or props.
    const projectsData = [
        { id: 1, title: t("projects.item_title") + " 1", desc: t("projects.item_desc"), link: "#", github: "#" },
        { id: 2, title: t("projects.item_title") + " 2", desc: t("projects.item_desc"), link: "#", github: "#" },
        { id: 3, title: t("projects.item_title") + " 3", desc: t("projects.item_desc"), link: "#", github: "#" },
        { id: 4, title: t("projects.item_title") + " 4", desc: t("projects.item_desc"), link: "#", github: "#" },
        { id: 5, title: t("projects.item_title") + " 5", desc: t("projects.item_desc"), link: "#", github: "#" }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= projectsData.length - 3 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? projectsData.length - 3 : prev - 1));
    };

    return (
        <div
            id="projects"
            ref={ref}
            style={{
                width: "100vw",
                height: px(1250), // Increased height for spacing
                position: "relative",
                backgroundColor: "#0d0d0d",
                overflow: "hidden", // Keep overflow hidden for carousel
            }}
        >
            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    position: "absolute",
                    top: px(160),
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: px(150),
                    lineHeight: px(160),
                    whiteSpace: "pre-wrap",
                    textAlign: "center"
                }}
            >
                <span style={{ color: "white" }}>{t("projects.title").split(" ")[0]} </span>
                {t("projects.title").split(" ").length > 1 && (
                    <span style={{ color: "#07cf07" }}>{t("projects.title").split(" ").slice(1).join(" ")}</span>
                )}
            </motion.div>

            {/* Content wrapper */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                style={{ position: "absolute", top: px(450), left: 0, right: 0, display: "flex", justifyContent: "center" }}
            >

                {/* Carousel items viewport */}
                <div style={{ overflow: "hidden", width: px(1365) }}>
                    <div style={{
                        display: "flex",
                        gap: px(105),
                        width: "max-content",
                        transform: `translateX(calc(-${currentIndex} * (${px(385)} + ${px(105)})))`,
                        transition: "transform 0.4s ease-in-out"
                    }}>
                        {projectsData.map((project) => (
                            <ProjectItem key={project.id} title={project.title} description={project.desc} link={project.link} github={project.github} />
                        ))}
                    </div>
                </div>

                {/* Back and Forward Arrow Buttons */}
                <div onClick={prevSlide} style={{ position: "absolute", top: px(257), left: px(113), width: px(50), height: px(50), opacity: 0.8, cursor: "pointer", zIndex: 10 }}>
                    <Image src={imgBack} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "contain" }} />
                </div>
                <div onClick={nextSlide} style={{ position: "absolute", top: px(257), right: px(113), width: px(50), height: px(50), opacity: 0.8, cursor: "pointer", zIndex: 10 }}>
                    <Image src={imgForward} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "contain" }} />
                </div>

                {/* Pagination indicators */}
                <div style={{ position: "absolute", top: px(600), left: "50%", transform: "translateX(-50%)", display: "flex", gap: px(12), zIndex: 1 }}>
                    {projectsData.slice(0, projectsData.length - 2).map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                                width: currentIndex === idx ? px(40) : px(13),
                                height: px(13),
                                borderRadius: px(13),
                                backgroundColor: currentIndex === idx ? "#07cf07" : "#333",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Floating 3D elements */}
            <motion.div style={{ y: yLaptop, position: "absolute", left: px(1436), top: px(940), width: px(223), height: px(290) }}>
                <Image src={imgLaptopBlue} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "contain", pointerEvents: "none" }} />
            </motion.div>

            <motion.div style={{ y: yIphone, position: "absolute", left: px(104), top: px(380), width: px(158), height: px(148), transform: "rotate(19.69deg)" }}>
                <Image src={imgTransparentIphone} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "contain", pointerEvents: "none" }} />
            </motion.div>

        </div>
    );
}
