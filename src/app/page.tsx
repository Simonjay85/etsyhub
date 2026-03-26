import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '4rem', maxWidth: '800px' }}>
        <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          Create & Sell <br/>Digital Products
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          The all-in-one studio to design planners, templates, and PNG assets, and publish them directly to your Etsy shop with SEO tracking.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/studio" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem', padding: '12px 32px' }}>
            Open Design Studio <ArrowRight size={20} />
          </Link>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.125rem', padding: '12px 32px', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
