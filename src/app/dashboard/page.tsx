import styles from './Dashboard.module.css';

export default function Dashboard() {
  return (
    <div className="glass-panel" style={{ padding: '2rem', height: '100%' }}>
      <h1 className="text-gradient" style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Dashboard Overview</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Track your SEO performance and store metrics.
      </p>
      
      <div className={styles.grid}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>Total Views</h3>
          <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>1,234</p>
          <span style={{ color: '#10b981', fontSize: '0.875rem' }}>+12% this week</span>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>Active Listings</h3>
          <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>42</p>
          <span style={{ color: '#10b981', fontSize: '0.875rem' }}>+3 new</span>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>Keyword Ranking (Avg)</h3>
          <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>Top 10</p>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Stable</span>
        </div>
      </div>
    </div>
  );
}
