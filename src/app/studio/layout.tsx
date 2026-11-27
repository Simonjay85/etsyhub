import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design Studio',
  description: 'Create Etsy thumbnails and mockups and generate SEO listing copy.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
