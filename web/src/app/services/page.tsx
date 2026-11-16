import type { Metadata } from 'next';
import { PageBody } from '@/components/layout/PageBody';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Architectural design, structural engineering, MEP systems, and permit drawing sets across the Dallas-Fort Worth Metroplex.',
  alternates: { canonical: '/services/' },
};

export default function ServicesPage() {
  return <PageBody />;
}
