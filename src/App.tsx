import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WorkSection } from './components/WorkSection';
import { SkillsEducationSection } from './components/SkillsEducationSection';
import { ContactSection } from './components/ContactSection';
import { PortfolioFooter } from './components/PortfolioFooter';
import { NAV_ITEMS } from './data/portfolioData';
import { useActiveSection } from './hooks/useActiveSection';

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export default function App() {
  const { activeSection, navigateToSection } = useActiveSection(SECTION_IDS);

  return (
    <div className="min-h-screen paper-texture text-[var(--color-espresso-deep)] flex flex-col">
      <Navbar activeSection={activeSection} onNavigate={navigateToSection} />

      <main className="flex-1">
        <HeroSection />

        <WorkSection />

        <SkillsEducationSection />

        <ContactSection />
      </main>

      <PortfolioFooter />
    </div>
  );
}
