"use client";

import { useTranslation } from "../components/I18nProvider";

/**
 * All measurements converted from Figma's 1728px-wide canvas to vw units.
 * Formula: value_in_vw = (figma_px / 1728) * 100
 *
 * Canvas: 1728 × 1117  →  page height = (1117/1728)*100 = 64.64vw
 */

// Asset URLs
const imgEarthGlobe = "/assets/92b9b428999016f1c32488d030aef3a460492980.png";
const imgMegaphone = "/assets/868b5bbaedc840a029791784ced86b2892ddea54.png";
const imgShapes = "/assets/e52db3117dd722c709f957c8c46d77bc91992ff3.png";
const imgDoubleDown = "/assets/6b67e94644a008c44eb8be2a796f9a04f64046af.png";
const imgLogo = "/assets/105a200fc672a2ad41d145328a723eeb0564bbc1.svg";
const imgLines = "/assets/617a64f8be69ee9564acd32aa96143ca34cdfeeb.svg";

/** Convert a Figma px value to a vw string  e.g. px(378) → "21.875vw" */
const px = (n: number) => `${((n / 1728) * 100).toFixed(4)}vw`;

export default function Home() {
  const { t, language, setLanguage } = useTranslation();

  return (
    /**
     * Outer container:
     *   - width: 100vw  (fills viewport, no overflow)
     *   - height: (1117/1728)*100vw = 64.64vw  (maintains Figma aspect ratio)
     *   - position: relative  (anchor for all absolutely-positioned children)
     */
    <div
      style={{
        backgroundColor: "#0d0d0d",
        width: "100vw",
        height: px(1117),        // 64.64vw
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── NAV BACKGROUND: x:0 y:0 w:1728 h:81 ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: px(81),         // 4.69vw
          backgroundColor: "#0d0d0d",
        }}
      />

      {/* ── NAV CONTENT: x:113 y:25.5 w:1502 h:30 ── */}
      {/* Logo + title on the left */}
      <div
        style={{
          position: "absolute",
          top: px(25.5),          // 1.48vw
          left: px(113),          // 6.54vw
          display: "inline-grid",
          gridTemplateColumns: `${px(40)} auto`,
          alignItems: "center",
          gap: 0,
          height: px(30),         // 1.74vw
        }}
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
            fontSize: px(24),     // 1.39vw
            lineHeight: "normal",
            color: "#ffffff",
            whiteSpace: "nowrap",
          }}
        >
          Juandagarc
        </p>
      </div>

      {/* ── NAV LINKS: right-anchored so Spanish words don't overflow ── */}
      {/* Right edge: 1728 - (1728-1208-407) = 1728 - 113 = 1615 → right: px(113) */}
      <div
        style={{
          position: "absolute",
          top: px(-5),
          right: px(113),          // mirror of left padding (113px)
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          columnGap: px(30),       // 1.74vw gap between items
          height: px(91),
        }}
      >
        {/* About */}
        <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: px(24), lineHeight: "normal", color: "#fff", whiteSpace: "nowrap", cursor: "pointer" }}>
          {t("nav.about")}
        </p>

        {/* Projects */}
        <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: px(24), lineHeight: "normal", color: "#fff", whiteSpace: "nowrap", cursor: "pointer" }}>
          {t("nav.projects")}
        </p>

        {/* Contact */}
        <p style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: px(24), lineHeight: "normal", color: "#fff", whiteSpace: "nowrap", cursor: "pointer" }}>
          {t("nav.contact")}
        </p>

        {/* Earth Globe — language toggle */}
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

      {/* ── HERO TEXT: x:378 y:318 w:971 h:480 ── */}
      {/* Each word is a block line — never wraps together regardless of language */}
      <div
        style={{
          position: "absolute",
          left: px(378),
          top: px(318),
          // Spanish words are wider, so expand the container a bit
          width: language === "es" ? px(1100) : px(971),
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          // Spanish text is slightly smaller to avoid overlapping the 3D shapes
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
          left: px(1006),         // 58.22vw
          top: px(425),           // 24.59vw
          width: px(274),         // 15.86vw
          height: px(10),         // 0.58vw
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
          left: px(242),          // 14.0vw
          top: px(254),           // 14.7vw
          width: px(246),         // 14.24vw
          height: px(152),        // 8.8vw
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
          left: px(976),          // 56.48vw
          top: px(627),           // 36.28vw
          width: px(354),         // 20.49vw
          height: px(374),        // 21.64vw
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
        style={{
          position: "absolute",
          left: px(847),          // 49.0vw
          top: px(981),           // 56.77vw
          width: px(33),          // 1.91vw
          height: px(32),         // 1.85vw
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
