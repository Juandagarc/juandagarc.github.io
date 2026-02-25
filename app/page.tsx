"use client";

import Navbar from "../components/Navbar";
import HomeSection from "../components/HomeSection";
import AboutSection from "../components/AboutSection";
import WorkExperienceSection from "../components/WorkExperienceSection";
import ProjectsSection from "../components/ProjectsSection";

export default function Home() {
  return (
    <main style={{ backgroundColor: "#0d0d0d", minHeight: "100vh" }}>
      <Navbar />
      <HomeSection />
      <AboutSection />
      <WorkExperienceSection />
      <ProjectsSection />
    </main>
  );
}
