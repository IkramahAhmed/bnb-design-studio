import type { Metadata } from 'next';
import { PageBody } from '@/components/layout/PageBody';

export const metadata: Metadata = {
  title: 'Our Approach',
  description: 'How BnB Design Studio brings your project from concept to permit-ready drawings efficiently and accurately.',
  alternates: { canonical: '/approach/' },
};

export default function ApproachPage() {
  return <PageBody />;
}
