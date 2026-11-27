import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Listings',
  description: 'Manage your sample Etsy listings and drafts.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
