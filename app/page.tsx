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
      {/* Empty Contact Section Placeholder to allow scrolling */}
      <div id="contact" style={{ width: "100vw", height: "100vh", backgroundColor: "#0d0d0d" }}></div>
    </main>
  );
}
