import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { NAV_LINKS, SITE } from '@/content/site';

export function Header() {
  return (
    <header className="nav">
      <a className="brand" href="#home" aria-label={`${SITE.name} home`}>
        <Image src="/logo.jpg" alt={`${SITE.name} logo`} width={56} height={56} priority />
      </a>
      <nav className="links" aria-label="Main">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <Button href="#contact" variant="small">
        Start a project
      </Button>
    </header>
  );
}
