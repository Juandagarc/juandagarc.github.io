import Navbar from "../components/Navbar";
import HomeSection from "../components/HomeSection";
import AboutSection from "../components/AboutSection";
import WorkExperienceSection from "../components/WorkExperienceSection";
import ProjectsSection from "../components/ProjectsSection";
import { getProjectsFromNotion } from "../utils/notion";

export default async function Home() {
  const notionProjects = await getProjectsFromNotion();

  return (
    <main style={{ backgroundColor: "#0d0d0d", minHeight: "100vh", position: "relative" }}>
      <Navbar />
      <HomeSection />
      <AboutSection />
      <WorkExperienceSection />
      <ProjectsSection initialProjects={notionProjects} />
    </main>
  );
}
