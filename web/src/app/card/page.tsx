import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import styles from '@/components/layout/simple.module.css';
import { SITE } from '@/content/site';

export const metadata: Metadata = {
  title: `${SITE.ownerName} · Digital Card`,
  description: `Digital business card for ${SITE.name}. Tap to call, email or save to contacts.`,
  alternates: { canonical: '/card/' },
  robots: { index: false, follow: false },
};

export default async function CardPage() {
  // Generated once at build time, so the page ships no QR library to the browser.
  const qr = await QRCode.toString(`${SITE.url}/card/`, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' });

  return (
    <div className={styles.page}>
      <SimpleHeader />
      <main className={styles.ecard}>
        <div className={styles.banner}>{SITE.tagline}</div>
        <Image className={styles.logo} src="/logo.jpg" alt={`${SITE.name} logo`} width={128} height={128} />
        <div className={styles.body}>
          <h1>{SITE.ownerName}</h1>
          <p className={styles.role}>Owner · Architectural Design</p>
          <p className={styles.sub}>
            {SITE.name}
            <br />
            {SITE.address.locality}, Texas {SITE.address.postalCode} · Serving DFW since {SITE.foundedYear}
          </p>

          <div className={styles.actions}>
            <a className={styles.primary} href={SITE.phoneHref}>
              Call {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <Link href="/">{SITE.url.replace('https://', '')}</Link>
            <a href="/babar-bnb-design-studio.vcf" download>
              Save to contacts
            </a>
          </div>

          <div className={styles.qr}>
            <div className={styles.qrBox} role="img" aria-label="QR code that opens this card" dangerouslySetInnerHTML={{ __html: qr }} />
            <small>Scan to share this card</small>
          </div>
        </div>
      </main>
    </div>
  );
}
