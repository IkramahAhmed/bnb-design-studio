import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/content/site';
import styles from './simple.module.css';

/** Compact header for the quiet pages: logo and a link back to the main site. */
export function SimpleHeader() {
  return (
    <header className={styles.top}>
      <Link href="/" aria-label={`${SITE.name} home`}>
        <Image src="/logo.jpg" alt={`${SITE.name} logo`} width={52} height={52} priority />
      </Link>
      <Link className={styles.back} href="/">
        ← Back to website
      </Link>
    </header>
  );
}
