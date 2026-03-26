'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Listing, mockListings, listingStats } from '@/lib/listings-data';
import {
  Store, TrendingUp, Eye, ShoppingBag, Plus, Edit3,
  Trash2, ExternalLink, Search, Filter,
} from 'lucide-react';

const STATUS_STYLES: Record<Listing['status'], { bg: string; color: string; label: string }> = {
  published: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Published' },
  draft: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', label: 'Draft' },
  processing: { bg: 'rgba(236,72,153,0.12)', color: '#ec4899', label: 'Processing…' },
};

function SEOBar({ score }: { score: number }) {
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: '0.7rem', color, fontWeight: 700, minWidth: '28px' }}>{score}</span>
    </div>
  );
}

function ListingCard({ listing, onDelete }: { listing: Listing; onDelete: (id: string) => void }) {
  const st = STATUS_STYLES[listing.status];
  return (
    <div
      className="glass-panel"
      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', transition: 'transform 0.2s', cursor: 'default' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Thumbnail */}
      <div style={{ height: '120px', borderRadius: '10px', background: listing.thumbnail, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Store size={36} style={{ color: 'rgba(255,255,255,0.35)' }} />
        </div>
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: st.bg, border: `1px solid ${st.color}`, color: st.color, fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', backdropFilter: 'blur(8px)' }}>
          {st.label}
        </div>
      </div>

      {/* Title & Niche */}
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.3 }}>{listing.title}</h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.3)' }}>{listing.niche}</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { icon: <Eye size={12} />, value: listing.views.toLocaleString(), label: 'views' },
          { icon: <ShoppingBag size={12} />, value: listing.sales, label: 'sales' },
          { icon: <TrendingUp size={12} />, value: `$${(listing.sales * listing.price).toFixed(2)}`, label: 'revenue' },
          { icon: <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>$</span>, value: listing.price.toFixed(2), label: 'price' },
        ].map(({ icon, value, label }) => (
          <div key={label} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '6px', padding: '6px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{icon}<span style={{ fontSize: '0.65rem' }}>{label}</span></div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* SEO Score */}
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>SEO Score</div>
        <SEOBar score={listing.seoScore} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
        <Link href="/studio" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', padding: '8px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--accent-1)', textDecoration: 'none' }}>
          <Edit3 size={13} /> Edit
        </Link>
        {listing.status !== 'published' && (
          <button style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} className="btn-primary">
            <ExternalLink size={13} /> Publish
          </button>
        )}
        {listing.status === 'published' && (
          <button style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', padding: '8px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', cursor: 'pointer' }}>
            <ExternalLink size={13} /> View on Etsy
          </button>
        )}
        <button onClick={() => onDelete(listing.id)} title="Delete" style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer' }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function Listings() {
  const [listings, setListings] = useState(mockListings);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Listing['status'] | 'all'>('all');

  const filtered = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.niche.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'all' || l.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this listing?')) setListings(prev => prev.filter(l => l.id !== id));
  };

  const stats = [
    { icon: <Store size={20} />, label: 'Total Listings', value: listings.length, color: 'var(--accent-1)' },
    { icon: <ExternalLink size={20} />, label: 'Published', value: listings.filter(l => l.status === 'published').length, color: '#10b981' },
    { icon: <TrendingUp size={20} />, label: 'Total Revenue', value: `$${listings.reduce((s, l) => s + l.sales * l.price, 0).toFixed(2)}`, color: '#f59e0b' },
    { icon: <Eye size={20} />, label: 'Total Views', value: listings.reduce((s, l) => s + l.views, 0).toLocaleString(), color: 'var(--accent-2)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Etsy Listings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Manage and publish your digital products.</p>
        </div>
        <Link href="/studio" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <Plus size={16} /> Create Listing
        </Link>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map(({ icon, label, value, color }) => (
          <div key={label} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2 }}>{value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search listings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '9px 12px 9px 36px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
          {(['all', 'published', 'draft', 'processing'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${filterStatus === s ? 'var(--accent-1)' : 'var(--glass-border)'}`, background: filterStatus === s ? 'rgba(139,92,246,0.2)' : 'transparent', color: filterStatus === s ? 'var(--accent-1)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: filterStatus === s ? 700 : 400, textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Store size={40} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No listings found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Try adjusting your filters or create a new listing.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(listing => (
            <ListingCard key={listing.id} listing={listing} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
