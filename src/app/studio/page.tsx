'use client';
import ProductGenerator from '../components/ProductGenerator';

export default function Studio() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      {/* Header Area */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Digital Product Generator</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>Create digital planners, CV templates, and spreadsheet products ready for Etsy.</p>
        </div>
        <button className="btn-primary" onClick={() => alert('Publishing will sync with Etsy via OAuth!')}>Publish to Etsy</button>
      </div>

      {/* Editor area — fills all remaining height */}
      <div style={{ flexGrow: 1, minHeight: 0, overflow: 'hidden', display: 'flex' }}>
        <ProductGenerator />
      </div>
    </div>
  );
}

