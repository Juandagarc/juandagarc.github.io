"use client";

import { useTranslation } from "./I18nProvider";
import { px } from "../utils/px";

const imgDevImage = "./assets/dev_image.webp";
const imgBusinessStrategy = "./assets/business-strategy.png";
const imgAbstractGlass = "./assets/abstract-glass.png";
const imgImage1 = "./assets/social-top.png";
const imgImage2 = "./assets/social-bottom.png";
const imgImage3 = "./assets/social-right.png";
const imgAbstractHuman = "./assets/abstract-human.png";

export default function AboutSection() {
    const { t } = useTranslation();

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
                <div style={{ display: "flex", gap: px(53), alignItems: "flex-start", width: "100%" }}>
                    {/* Dev Image */}
                    <div
                        style={{
                            height: px(759),
                            position: "relative",
                            width: px(569),
                            flexShrink: 0,
                            boxShadow: "0px 4px 4px 1px #2d2d2d",
                            borderRadius: px(10),
                            overflow: "hidden"
                        }}
                    >
                        <img
                            alt=""
                            src={imgDevImage}
                            style={{
                                position: "absolute",
                                height: "100%",
                                left: "-0.02%",
                                top: 0,
                                width: "100.04%",
                                objectFit: "cover",
                            }}
                        />
                    </div>

                    {/* Content Box */}
                    {/* Width adjusted to match Figma About-content width 1013 */}
                    <div style={{ position: "relative", flexShrink: 0, width: px(1013) }}>

                        {/* Title - Figma coords: x=675, y=41. Relative to About-content(x=622): left=53, top=41 */}
                        <div
                            style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontWeight: 800,
                                color: "#5990ff",
                                fontSize: px(150),
                                lineHeight: px(160),
                                position: "absolute",
                                left: px(53),
                                top: px(41),
                                width: px(473),
                                zIndex: 1
                            }}
                        >
                            {t("about.title")}
                        </div>

                        {/* Chess Piece (Business Strategy) - Figma coords: x=622, y=97. Relative: left=0, top=97 */}
                        <div style={{ position: "absolute", left: px(0), top: px(97), width: px(105), height: px(104), zIndex: 10 }}>
                            <img alt="" src={imgBusinessStrategy} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>

                        {/* DNA Glass - Figma coords: x=1403, y=0. Relative: left=781, top=0 */}
                        <div style={{ position: "absolute", left: px(781), top: px(0), width: px(232), height: px(254), zIndex: 10 }}>
                            <img src={imgAbstractGlass} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
                        </div>

                        {/* Description Card - Figma relative coords: x=640 (left=18), y=225 (top=225). Width 958 */}
                        <div style={{ position: "absolute", left: px(18), top: px(225) }}>
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
                        </div>

                        {/* Social Links - placed below description naturally, but loosely pinned near bottom */}
                        {/* Figma relative coords for social links: x=640 (left=18), y=670 (top=670) */}
                        <div style={{ position: "absolute", display: "flex", gap: px(26), left: px(18), top: px(750) }}>
                            <div style={{ width: px(48), height: px(48), position: "relative", cursor: "pointer" }}>
                                <img src={imgImage2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ width: px(48), height: px(48), position: "relative", cursor: "pointer" }}>
                                <img src={imgImage1} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ width: px(48), height: px(48), position: "relative", cursor: "pointer" }}>
                                <img src={imgImage3} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Abstract human correctly positioned avoiding image overlap */}
                <div style={{ position: "absolute", height: px(358), left: px(302), top: px(670), width: px(320) }}>
                    <img src={imgAbstractHuman} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
                </div>
            </div>
        </div>
    );
}
