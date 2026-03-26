'use client';
import CanvasEditor from '../components/CanvasEditor';

export default function Studio() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Design Studio</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create digital planners, CV templates, and PNG assets.</p>
        </div>
        <button className="btn-primary" onClick={() => alert('Publishing will sync with Etsy via OAuth!')}>Publish to Etsy</button>
      </div>
      
      <div style={{ flexGrow: 1, minHeight: 0 }}>
        <CanvasEditor />
      </div>
    </div>
  );
}
