import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WorkSection } from './components/WorkSection';
import { SkillsEducationSection } from './components/SkillsEducationSection';
import { ContactSection } from './components/ContactSection';
import { PortfolioFooter } from './components/PortfolioFooter';

export default function App() {
  return (
    <div className="min-h-screen paper-texture text-[var(--color-espresso-deep)] flex flex-col">
      <Navbar />

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
