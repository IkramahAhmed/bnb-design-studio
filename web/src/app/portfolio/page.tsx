import type { Metadata } from 'next';
import { PageBody } from '@/components/layout/PageBody';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Browse BnB Design Studio\'s portfolio of residential and commercial architectural projects across North Texas.',
  alternates: { canonical: '/portfolio/' },
};

export default function PortfolioPage() {
  return <PageBody />;
}
