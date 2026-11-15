import type { Metadata } from 'next';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import styles from '@/components/layout/simple.module.css';
import { SITE } from '@/content/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE.name} collects, uses and protects information submitted through its website.`,
  alternates: { canonical: '/privacy/' },
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <SimpleHeader />
      <main className={styles.doc}>
        <p className={styles.updated}>Last updated: November 2026</p>
        <h1>Privacy Policy</h1>
        <p>
          {SITE.name} (&quot;we&quot;, &quot;us&quot;) is an architectural design studio in Wylie, Texas. This policy explains what
          information we collect through this website and how we use it.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>Contact form: your name, email, phone number, project type and message, when you choose to send them.</li>
          <li>Email and phone: any details you share when you contact us directly.</li>
          <li>Basic technical data: standard server logs such as IP address, browser type and pages visited, used to keep the site secure and working.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To reply to your enquiry and prepare proposals for your project.</li>
          <li>To deliver design and permit drawing services you request.</li>
          <li>To maintain and improve the website.</li>
        </ul>

        <h2>Sharing</h2>
        <p>
          We do not sell your personal information. We share it only with consultants, engineers or city building departments when
          needed to carry out a project you have asked us to do, or when the law requires it.
        </p>

        <h2>Cookies and third parties</h2>
        <p>This site does not use advertising trackers. Fonts are served from our own domain.</p>

        <h2>Retention and security</h2>
        <p>
          We keep enquiries and project records only as long as needed for the purposes above. We use reasonable measures to
          protect your information, but no method of transmission over the internet is completely secure.
        </p>

        <h2>Your choices</h2>
        <p>
          You may ask us to access, correct or delete the personal information you have sent us by emailing{' '}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>

        <h2>Contact</h2>
        <p>
          {SITE.name}, {SITE.address.locality}, Texas {SITE.address.postalCode}
          <br />
          <a href={SITE.phoneHref}>{SITE.phone}</a>
        </p>
      </main>
    </div>
  );
}
