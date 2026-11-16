import type { Metadata } from 'next';
import { PageBody } from '@/components/layout/PageBody';

export const metadata: Metadata = {
  title: 'About',
  description: 'Meet BnB Design Studio — an architectural design firm serving the Dallas-Fort Worth Metroplex since 2019.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  return <PageBody />;
}
