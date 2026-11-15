import { SERVICES, SITE } from '@/content/site';

/** Structured data so search engines understand this is a local architecture business. */
export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    logo: `${SITE.url}/logo.jpg`,
    image: `${SITE.url}/logo.jpg`,
    telephone: SITE.phone,
    email: SITE.email,
    slogan: SITE.tagline,
    foundingDate: String(SITE.foundedYear),
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    areaServed: { '@type': 'AdministrativeArea', name: 'Dallas-Fort Worth Metroplex, Texas' },
    makesOffer: SERVICES.map((service) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: service.title, description: service.summary },
    })),
  };

  // Escape "<" so the JSON can never close the script tag early.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
