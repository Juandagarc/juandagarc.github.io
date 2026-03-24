"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useTranslation } from "../../components/I18nProvider";
import { useIsMobile } from "../../utils/useIsMobile";
import { motion } from "framer-motion";
import { px } from "../../utils/px";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function Contact() {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
    const [init, setInit] = useState(false);

    useEffect(() => {
        if (isMobile) return; // skip heavy particle engine on mobile
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, [isMobile]);

    const particlesOptions = {
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        interactivity: {
            events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: true, mode: "repulse" },
            },
            modes: {
                push: { quantity: 4 },
                repulse: { distance: 100, duration: 0.4 },
            },
        },
        particles: {
            color: { value: ["#07cf07", "#5990ff"] },
            links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.1, width: 1 },
            move: { direction: "none" as const, enable: true, outModes: { default: "bounce" as const }, random: false, speed: 1, straight: false },
            number: { density: { enable: true }, value: 80 },
            opacity: { value: 0.3 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setStatus("submitting");

        const formData = new FormData(form);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            subject: formData.get("subject"),
            message: formData.get("message"),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to send message");

            setStatus("success");
            form.reset();
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error) {
            console.error(error);
            setStatus("idle");
            alert(t("contact.error") || "Something went wrong. Please try again.");
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: isMobile ? "12px 16px" : px(16),
        borderRadius: isMobile ? 10 : px(12),
        backgroundColor: "rgba(10, 10, 10, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "white",
        fontSize: isMobile ? 16 : px(16),
        outline: "none",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "border-color 0.2s",
        boxSizing: "border-box" as const,
    };

    const labelStyle: React.CSSProperties = {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: isMobile ? 14 : px(16),
        fontWeight: 600,
        color: "#e0e0e0",
    };

    const GitHubIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
    );
    const LinkedInIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
    );
    const InstagramIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );

    return (
        <main style={{ backgroundColor: "#0d0d0d", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
            <Navbar />

            {init && (
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
                    <Particles id="tsparticles" options={particlesOptions} />
                </div>
            )}

            <div style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                paddingTop: isMobile ? 80 : px(81),
                paddingBottom: isMobile ? 40 : px(40),
                paddingLeft: isMobile ? 16 : 0,
                paddingRight: isMobile ? 16 : 0,
                boxSizing: "border-box",
            }}>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                        position: "relative",
                        zIndex: 10,
                        backgroundColor: "rgba(30, 30, 30, 0.4)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: isMobile ? 16 : px(24),
                        padding: isMobile ? "28px 24px" : px(60),
                        width: isMobile ? "100%" : px(700),
                        maxWidth: isMobile ? "100%" : "90vw",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                        boxSizing: "border-box",
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : px(40) }}>
                        <h1 style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: isMobile ? 32 : px(56),
                            fontWeight: 800,
                            color: "white",
                            margin: 0,
                            lineHeight: 1.1,
                        }}>
                            {t("contact.title1") || "Let's"}{" "}
                            <span style={{ color: "#07cf07" }}>{t("contact.title2") || "Connect"}</span>
                        </h1>
                        <p style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: isMobile ? 14 : px(20),
                            color: "#a0a0a0",
                            marginTop: isMobile ? 12 : px(16),
                            marginBottom: 0,
                            lineHeight: 1.5,
                        }}>
                            {t("contact.subtitle") || "I'm always open to discussing product design work or partnership opportunities."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : px(24) }}>
                        {/* Name + Email row — column on mobile */}
                        <div style={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            gap: isMobile ? 16 : px(24),
                        }}>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                                <label style={labelStyle}>{t("contact.name") || "Your Name"}</label>
                                <input name="name" required type="text" placeholder={t("contact.placeholderName") || "John Doe"} style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = "#07cf07"}
                                    onBlur={e => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"} />
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                                <label style={labelStyle}>{t("contact.email") || "Your Email"}</label>
                                <input name="email" required type="email" placeholder={t("contact.placeholderEmail") || "john@example.com"} style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = "#07cf07"}
                                    onBlur={e => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"} />
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <label style={labelStyle}>{t("contact.subject") || "Subject"}</label>
                            <input name="subject" required type="text" placeholder={t("contact.placeholderSubject") || "How can I help you?"} style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "#07cf07"}
                                onBlur={e => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <label style={labelStyle}>{t("contact.message") || "Message"}</label>
                            <textarea name="message" required rows={isMobile ? 4 : 5}
                                placeholder={t("contact.placeholderMessage") || "Tell me about your project..."}
                                style={{ ...inputStyle, resize: "vertical" }}
                                onFocus={e => e.target.style.borderColor = "#07cf07"}
                                onBlur={e => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"} />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "#06b806" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            style={{
                                marginTop: isMobile ? 4 : px(8),
                                width: "100%",
                                padding: isMobile ? "14px" : px(18),
                                borderRadius: isMobile ? 10 : px(12),
                                backgroundColor: status === "success" ? "#5990ff" : "#07cf07",
                                color: "white",
                                border: "none",
                                fontSize: isMobile ? 16 : px(18),
                                fontWeight: 700,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                cursor: status === "submitting" ? "wait" : "pointer",
                                transition: "background-color 0.3s",
                            }}
                            disabled={status === "submitting"}
                        >
                            {status === "idle" && (t("contact.submit") || "Send Message")}
                            {status === "submitting" && (t("contact.submitting") || "Sending...")}
                            {status === "success" && (t("contact.success") || "Message Sent!")}
                        </motion.button>

                        {/* Social section */}
                        <div style={{
                            marginTop: isMobile ? 16 : px(24),
                            paddingTop: isMobile ? 16 : px(24),
                            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                            textAlign: "center",
                        }}>
                            <p style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: isMobile ? 13 : px(16),
                                color: "#a0a0a0",
                                marginBottom: isMobile ? 16 : px(20),
                                marginTop: 0,
                            }}>
                                {t("contact.socialText") || "You can also find me on my social networks:"}
                            </p>
                            <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 24 : px(24) }}>
                                {[
                                    { href: "https://github.com/Juandagarc", label: "GitHub", Icon: GitHubIcon },
                                    { href: "https://www.linkedin.com/in/juandagarc", label: "LinkedIn", Icon: LinkedInIcon },
                                    { href: "https://www.instagram.com/juanda_garc/", label: "Instagram", Icon: InstagramIcon },
                                ].map(({ href, label, Icon }) => (
                                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                                        style={{ color: "white", transition: "color 0.2s" }}
                                        onMouseOver={e => (e.currentTarget.style.color = "#07cf07")}
                                        onMouseOut={e => (e.currentTarget.style.color = "white")}
                                    >
                                        <Icon />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </main>
    );
}
