export default function Listings() {
  return (
    <div className="glass-panel" style={{ padding: '2rem', height: '100%' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Etsy Listings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your digital products and publish directly to Etsy.</p>
        </div>
        <button className="btn-primary">+ Create Listing</button>
      </div>
      
      <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', marginTop: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
        <h3 style={{ marginBottom: '0.5rem' }}>Not Connected to Etsy</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Link your Etsy developer account to sync listings.</p>
        <button className="btn-primary" style={{ marginTop: '1.5rem' }}>Connect via OAuth 2.0</button>
      </div>
    </div>
  );
}
