"use client";

import { useState } from "react";
import { useTranslation } from "./I18nProvider";
import { px } from "../utils/px";

const imgExternalLink = "./assets/external-link.png";
const imgImage1 = "./assets/social-top.png"; // reusing github icon
const imgMac = "./assets/mac-mockup.png";
const imgForward = "./assets/forward-arrow.png";
const imgBack = "./assets/back-arrow.png";
const imgLaptopBlue = "./assets/laptop-blue.png";
const imgTransparentIphone = "./assets/transparent-iphone.png";
const imgPagination = "./assets/pagination.svg";

// The project items content component
const ProjectItem = ({ title, description, link, github }: { title: string, description: string, link: string, github: string }) => {
    return (
        <div style={{ height: px(564), position: "relative", width: px(385), flexShrink: 0 }}>
            {/* White Background underneath */}
            <div style={{ backgroundColor: "white", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: px(10) }} />

            {/* Inner content */}
            <div style={{ zIndex: 2, position: "relative", width: "100%", height: "100%" }}>
                <div style={{ position: "absolute", left: px(26), right: px(26), top: px(99), height: px(195) }}>
                    <img src={imgMac} alt="" style={{ width: "120%", height: "135%", position: "absolute", left: "-10%", top: "-15%", objectFit: "contain" }} />
                </div>

                <div style={{ position: "absolute", top: px(318), left: px(26), right: px(26), textAlign: "left", color: "black", fontWeight: 700, fontSize: px(30), fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {title}
                </div>

                <div style={{ position: "absolute", top: px(364), left: px(26), right: px(26), textAlign: "left", color: "black", fontWeight: 500, fontSize: px(24.355), fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "pre-wrap" }}>
                    {description}
                </div>

                {/* Buttons bottom */}
                <div style={{ position: "absolute", top: px(456), left: px(35), display: "flex", gap: px(25) }}>
                    <a href={link} target="_blank" rel="noreferrer" style={{ backgroundColor: "#5990ff", width: px(145), height: px(56), borderRadius: px(10), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <img src={imgExternalLink} alt="" style={{ width: px(48), height: px(48), objectFit: "contain" }} />
                    </a>
                    <a href={github} target="_blank" rel="noreferrer" style={{ backgroundColor: "#1e1e1e", width: px(145), height: px(56), borderRadius: px(10), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <img src={imgImage1} alt="" style={{ width: px(48), height: px(48), objectFit: "cover" }} />
                    </a>
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
            style={{
                width: "100vw",
                height: px(1117), // 64.64vw
                position: "relative",
                backgroundColor: "#0d0d0d",
                overflow: "hidden", // Keep overflow hidden for carousel
            }}
        >
            {/* Title */}
            <div
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
            </div>

            {/* Content wrapper */}
            <div style={{ position: "absolute", top: px(323), left: 0, right: 0, display: "flex", justifyContent: "center" }}>

                {/* Carousel items viewport */}
                <div style={{ overflow: "hidden", width: px(1355) }}>
                    <div style={{
                        display: "flex",
                        gap: px(100),
                        width: "max-content",
                        transform: `translateX(calc(-${currentIndex} * (${px(385)} + ${px(100)})))`,
                        transition: "transform 0.4s ease-in-out"
                    }}>
                        {projectsData.map((project) => (
                            <ProjectItem key={project.id} title={project.title} description={project.desc} link={project.link} github={project.github} />
                        ))}
                    </div>
                </div>

                {/* Back and Forward Arrow Buttons */}
                <div onClick={prevSlide} style={{ position: "absolute", top: px(257), left: px(113), width: px(50), height: px(50), opacity: 0.8, cursor: "pointer", zIndex: 10 }}>
                    <img src={imgBack} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div onClick={nextSlide} style={{ position: "absolute", top: px(257), right: px(113), width: px(50), height: px(50), opacity: 0.8, cursor: "pointer", zIndex: 10 }}>
                    <img src={imgForward} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>

                {/* Pagination indicator */}
                <div style={{ position: "absolute", top: px(587), left: "50%", transform: "translateX(-50%)", width: px(217), height: px(13), zIndex: 1 }}>
                    <img src={imgPagination} alt="" style={{ width: "100%", height: "100%" }} />
                </div>
            </div>

            {/* Floating 3D elements */}
            <div style={{ position: "absolute", left: px(1436), top: px(807), width: px(223), height: px(290) }}>
                <img src={imgLaptopBlue} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
            </div>

            <div style={{ position: "absolute", left: px(104), top: px(253), width: px(158), height: px(148), transform: "rotate(19.69deg)" }}>
                <img src={imgTransparentIphone} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
            </div>

        </div>
    );
}
