'use client';
import CanvasEditor from '../components/CanvasEditor';

export default function Studio() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Design Studio</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>Create digital planners, CV templates, and spreadsheet products.</p>
        </div>
        <button className="btn-primary" onClick={() => alert('Publishing will sync with Etsy via OAuth!')}>Publish to Etsy</button>
      </div>

      {/* Editor area — fills all remaining height */}
      <div style={{ flexGrow: 1, minHeight: 0, overflow: 'hidden', display: 'flex' }}>
        <CanvasEditor />
      </div>
    </div>
  );
}

