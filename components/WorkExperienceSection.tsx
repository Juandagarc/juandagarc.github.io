"use client";

import { useTranslation } from "./I18nProvider";
import { px } from "../utils/px";

const imgGlassBulbWithAiStar = "./assets/glass-bulb.png"; // bulb icon
const imgFloatingAbstractObjectsMadeOfGlass = "./assets/floating-objects.png"; // stones
const imgFlow = "./assets/flow-line.svg"; // the big svg line
const imgStar = "./assets/iridescent-rhombus.png"; // it turns out the "rhombus" asset was actually the star based on coordinates

export default function WorkExperienceSection() {
    const { t } = useTranslation();

    const jobs: any[] = t("work.jobs") as any;
    const milestones: any[] = t("work.milestones") as any;

    return (
        <div
            id="work"
            style={{
                width: "100vw",
                height: px(1117), // 64.64vw
                position: "relative",
                backgroundColor: "#0d0d0d",
                overflow: "hidden", // clip the bottom right stones
            }}
        >
            {/* Title */}
            <div
                style={{
                    position: "absolute",
                    top: px(319),
                    left: px(1039),
                    width: px(459),
                    height: px(480),
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: px(150),
                    lineHeight: px(160),
                }}
            >
                <div style={{ color: "#ffae00", lineHeight: px(160) }}>{t("work.title1")}</div>
                {/* The "experience" text breaks onto two lines because of the width, mimicking the exact design */}
                <div style={{ color: "white", lineHeight: px(160), marginTop: px(-10), wordBreak: "break-all" }}>exper</div>
                <div style={{ color: "white", lineHeight: px(160), marginTop: px(-10), wordBreak: "break-all" }}>ience</div>
            </div>

            {/* Floating Icons near title */}
            {/* Figma absolute coords relative to section: Bulb(998, 393), Star(1389, 651) */}
            <div style={{ position: "absolute", left: px(998), top: px(393), width: px(63), height: px(77), transform: "rotate(-70.43deg)", zIndex: 10 }}>
                <img src={imgGlassBulbWithAiStar} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            <div style={{ position: "absolute", left: px(1398), top: px(651), width: px(85), height: px(75), transform: "rotate(21.83deg)", zIndex: 10 }}>
                <img src={imgStar} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            {/* Floating abstract objects (stones) */}
            <div style={{ position: "absolute", left: px(1431), top: px(757), width: px(297), height: px(372) }}>
                <img src={imgFloatingAbstractObjectsMadeOfGlass} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            {/* Flow SVG line connecting everything */}
            <div style={{ position: "absolute", left: px(277.5), top: px(154), width: px(421), height: px(810), zIndex: 10, pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: "-0.99%", right: "0%", bottom: "-1.07%", left: "-2.06%" }}>
                    <img src={imgFlow} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                </div>
            </div>

            {/* Milestones (Left side) */}
            <div style={{ position: "absolute", left: px(109), top: px(238), display: "flex", flexDirection: "column", gap: px(108) }}>
                {Array.isArray(milestones) && milestones.map((ms, idx) => (
                    <div key={idx} style={{ position: "relative", width: px(309), height: px(142) }}>
                        <div style={{
                            position: "absolute",
                            left: px(30),
                            width: px(279),
                            height: "100%",
                            backgroundColor: idx === 1 ? "#aa1e1e" : "#1e1e1e",
                            borderRadius: px(10)
                        }} />
                        <div style={{
                            position: "absolute",
                            left: px(57),
                            width: px(226),
                            height: px(142),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            color: "white",
                            fontSize: px(24),
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: idx === 1 ? 500 : 400
                        }}>
                            {ms.title}
                        </div>
                        <div style={{
                            position: "absolute",
                            left: px(15),
                            top: px(71),
                            transform: "translate(-50%, -50%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <div style={{
                                transform: "rotate(-90deg)",
                                color: idx === 2 ? "#8d8d8d" : "white",
                                fontSize: px(24),
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontWeight: idx === 2 ? 700 : 500,
                                whiteSpace: "nowrap"
                            }}>
                                {ms.year}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Jobs (Right side) */}
            <div style={{ position: "absolute", left: px(525), top: px(289), display: "flex", flexDirection: "column", gap: px(14) }}>
                {Array.isArray(jobs) && jobs.map((job, idx) => (
                    <div key={idx} style={{ position: "relative", width: px(312), height: px(142) }}>
                        <div style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            backgroundColor: "#2d2d2d",
                            width: px(279),
                            height: px(142),
                            borderRadius: px(10)
                        }} />
                        <div style={{
                            position: "absolute",
                            left: px(26.5),
                            width: px(226),
                            height: px(142),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            color: "white",
                            fontSize: px(24),
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 400
                        }}>
                            {job.title}
                        </div>
                        <div style={{
                            position: "absolute",
                            left: px(297),
                            top: px(71),
                            transform: "translate(-50%, -50%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <div style={{
                                transform: "rotate(90deg)",
                                color: "white",
                                fontSize: px(24),
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontWeight: 500,
                                whiteSpace: "nowrap"
                            }}>
                                {job.duration}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
