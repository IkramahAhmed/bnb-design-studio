import Link from 'next/link';
import { Card, Eyebrow } from '@/components/ui/Card';
import { SECTION, SITE } from '@/content/site';
import { ContactForm } from './ContactForm';
import { Panel } from './Panel';

export function ContactPanel() {
  return (
    <Panel {...SECTION.contact}>
      <Card wide>
        <Eyebrow>Let&apos;s talk</Eyebrow>
        <h2 className="rv">
          Your dream. <em>Our drawings.</em>
        </h2>
        <ContactForm />
        <div className="contact-line">
          <a href={SITE.phoneHref}>{SITE.phone}</a>
          <span>
            {SITE.address.locality}, Texas {SITE.address.postalCode}
          </span>
        </div>
        <p className="foot">
          © {new Date().getFullYear()} {SITE.name} · <Link href="/privacy/">Privacy</Link> · <Link href="/card/">Digital card</Link>
        </p>
        <p className="foot" style={{marginTop:'6px',opacity:.6}}>
          Designed by <a href="https://sancytech.com" target="_blank" rel="noopener noreferrer">Sancy Tech</a>
        </p>
      </Card>
    </Panel>
  );
}
