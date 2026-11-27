import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keyword Research',
  description: 'Explore sample Etsy keyword metrics for digital products.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
