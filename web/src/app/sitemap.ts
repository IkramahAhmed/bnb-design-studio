import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE.url}/about/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE.url}/services/`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE.url}/approach/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE.url}/portfolio/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE.url}/contact/`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE.url}/privacy/`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
