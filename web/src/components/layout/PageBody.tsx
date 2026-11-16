import { ExperienceLoader } from '@/components/experience/ExperienceLoader';
import { Header } from '@/components/layout/Header';
import { RevealObserver } from '@/components/RevealObserver';
import { About } from '@/components/sections/About';
import { Approach } from '@/components/sections/Approach';
import { ContactPanel } from '@/components/sections/ContactPanel';
import { Hero } from '@/components/sections/Hero';
import { Portfolio } from '@/components/sections/Portfolio';
import { ServicePanel } from '@/components/sections/ServicePanel';
import { SERVICES } from '@/content/site';

export function PageBody() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        {SERVICES.map((service) => (
          <ServicePanel key={service.id} service={service} />
        ))}
        <Approach />
        <Portfolio />
        <ContactPanel />
      </main>
      <RevealObserver />
      <ExperienceLoader />
    </>
  );
}
