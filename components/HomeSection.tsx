"use client";

import { useTranslation } from "./I18nProvider";
import { px } from "../utils/px";

const imgMegaphone = "/assets/868b5bbaedc840a029791784ced86b2892ddea54.png";
const imgShapes = "/assets/e52db3117dd722c709f957c8c46d77bc91992ff3.png";
const imgDoubleDown = "/assets/6b67e94644a008c44eb8be2a796f9a04f64046af.png";
const imgLines = "/assets/617a64f8be69ee9564acd32aa96143ca34cdfeeb.svg";

export default function HomeSection() {
    const { t, language } = useTranslation();

    return (
        <div
            id="home"
            style={{
                width: "100vw",
                height: px(1117), // 64.64vw
                position: "relative",
            }}
        >
            {/* ── HERO TEXT: x:378 y:318 w:971 h:480 ── */}
            <div
                style={{
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
            </div>

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
                    <img src={imgLines} alt="" style={{ display: "block", width: "100%", height: "100%" }} />
                </div>
            </div>

            {/* ── MEGAPHONE: x:242 y:254 w:246 h:152 ── */}
            <div
                style={{
                    position: "absolute",
                    left: px(242),
                    top: px(254),
                    width: px(246),
                    height: px(152),
                }}
            >
                <img
                    src={imgMegaphone}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
                />
            </div>

            {/* ── ABSTRACT SHAPES: x:976 y:627 w:354 h:374 ── */}
            <div
                style={{
                    position: "absolute",
                    left: px(976),
                    top: px(627),
                    width: px(354),
                    height: px(374),
                }}
            >
                <img
                    src={imgShapes}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
                />
            </div>

            {/* ── DOUBLE DOWN: x:847 y:981 w:33 h:32 ── */}
            <div
                onClick={() => {
                    const el = document.getElementById("about");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                    position: "absolute",
                    left: px(847),
                    top: px(981),
                    width: px(33),
                    height: px(32),
                    cursor: "pointer",
                }}
            >
                <img
                    src={imgDoubleDown}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
                />
            </div>
        </div>
    );
}
