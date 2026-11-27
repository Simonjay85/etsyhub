import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Design Etsy digital product mockups and generate listing copy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
        <div className="layout-wrapper">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
