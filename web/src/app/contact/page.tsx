import type { Metadata } from 'next';
import { PageBody } from '@/components/layout/PageBody';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with BnB Design Studio to start your architectural design or structural engineering project.',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return <PageBody />;
}
