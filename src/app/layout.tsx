import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Etsy Creator Studio",
  description: "Create and publish digital products to Etsy",
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
