import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Etsy Market Trends',
  description: 'Sample trending Etsy digital products and high-volume keywords.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
