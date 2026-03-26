'use client';

import { useState } from 'react';
import {
  Key, Store, Palette, Bell, Save, CheckCircle2,
  Eye, EyeOff, ExternalLink, Zap, Globe, Package,
} from 'lucide-react';

type Tab = 'api' | 'shop' | 'generation' | 'notifications';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '0.5px' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>{label}</label>
      {hint && <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>{hint}</p>}
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid var(--glass-border)',
  color: 'white',
  padding: '10px 14px',
  borderRadius: '8px',
  fontSize: '0.84rem',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('api');
  const [saved, setSaved] = useState(false);

  // API Keys
  const [openaiKey, setOpenaiKey] = useState('');
  const [showOpenai, setShowOpenai] = useState(false);
  const [etsyKey, setEtsyKey] = useState('');
  const [showEtsy, setShowEtsy] = useState(false);

  // Shop Info
  const [shopName, setShopName] = useState('');
  const [shopUrl, setShopUrl] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');

  // Generation defaults
  const [defaultNiche, setDefaultNiche] = useState('Creative Director');
  const [defaultBundle, setDefaultBundle] = useState(true);
  const [addWatermark, setAddWatermark] = useState(false);
  const [defaultFont, setDefaultFont] = useState('Montserrat + Lato');

  // Notifications
  const [emailNotify, setEmailNotify] = useState(true);
  const [email, setEmail] = useState('');

  const handleSave = () => {
    // In a real app, save to localStorage or API
    localStorage.setItem('settings_openai_key', openaiKey);
    localStorage.setItem('settings_shop_name', shopName);
    localStorage.setItem('settings_default_niche', defaultNiche);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'api', label: 'API Keys', icon: <Key size={14} /> },
    { key: 'shop', label: 'Shop Info', icon: <Store size={14} /> },
    { key: 'generation', label: 'Generation', icon: <Palette size={14} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
  ];

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Configure API keys, shop details, and generation preferences.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${tab === t.key ? 'var(--accent-1)' : 'var(--glass-border)'}`,
              background: tab === t.key ? 'rgba(139,92,246,0.15)' : 'rgba(0,0,0,0.15)',
              color: tab === t.key ? 'var(--accent-1)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: tab === t.key ? 700 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s',
            }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── API Keys ── */}
      {tab === 'api' && (
        <>
          <Section title="🤖 OpenAI">
            <Field label="API Key" hint="Used for GPT-4o content generation and DALL-E 3 image creation.">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showOpenai ? 'text' : 'password'}
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <button onClick={() => setShowOpenai(v => !v)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {showOpenai ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: openaiKey ? '#10b981' : '#6b7280' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {openaiKey ? 'Key configured — AI generation enabled' : 'No key — using mock content fallback'}
              </span>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--accent-1)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                Get key <ExternalLink size={11} />
              </a>
            </div>
          </Section>

          <Section title="🛒 Etsy API">
            <Field label="API Key" hint="Required to publish listings directly to your Etsy shop via OAuth.">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showEtsy ? 'text' : 'password'}
                  value={etsyKey}
                  onChange={e => setEtsyKey(e.target.value)}
                  placeholder="keystring_..."
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <button onClick={() => setShowEtsy(v => !v)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {showEtsy ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.75rem', color: '#fbbf24', lineHeight: 1.6 }}>
              ⚠️ Etsy OAuth publishing is coming soon. Download ZIP bundles now to upload manually.
            </div>
          </Section>
        </>
      )}

      {/* ── Shop Info ── */}
      {tab === 'shop' && (
        <Section title="🏪 Your Etsy Shop">
          <Field label="Shop Name">
            <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="e.g. DigitalBlueCreatives" style={inputStyle} />
          </Field>
          <Field label="Shop URL">
            <input type="url" value={shopUrl} onChange={e => setShopUrl(e.target.value)} placeholder="https://www.etsy.com/shop/yourshop" style={inputStyle} />
          </Field>
          <Field label="Owner Name">
            <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Your name" style={inputStyle} />
          </Field>
          <Field label="Default Currency">
            <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
              {['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'VND', 'SGD', 'JPY'].map(c => (
                <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>
              ))}
            </select>
          </Field>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
              <Globe size={20} style={{ color: 'var(--accent-1)', marginBottom: '6px' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Shop Status</div>
              <div style={{ fontSize: '0.7rem', color: '#10b981' }}>Active</div>
            </div>
            <div className="glass-panel" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
              <Package size={20} style={{ color: 'var(--accent-2)', marginBottom: '6px' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Total Listings</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>—</div>
            </div>
          </div>
        </Section>
      )}

      {/* ── Generation ── */}
      {tab === 'generation' && (
        <>
          <Section title="⚡ Product Generation Defaults">
            <Field label="Default Niche" hint="Pre-fills the Target Niche field in Design Studio.">
              <input type="text" value={defaultNiche} onChange={e => setDefaultNiche(e.target.value)} placeholder="e.g. UX Designer" style={inputStyle} />
            </Field>
            <Field label="Default Font Pairing">
              <select value={defaultFont} onChange={e => setDefaultFont(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                {['Montserrat + Lato', 'Playfair + Raleway', 'Oswald + Open Sans', 'Roboto Slab + Roboto', 'Space Grotesk + DM Sans', 'Merriweather + Source Sans'].map(f => (
                  <option key={f} style={{ background: '#1e293b' }}>{f}</option>
                ))}
              </select>
            </Field>
            <Field label="Output Mode">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[['bundle', '📦 Bundle (5 files + ZIP)'], ['single', '📄 Single PDF']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setDefaultBundle(val === 'bundle')}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${(defaultBundle ? 'bundle' : 'single') === val ? 'var(--accent-1)' : 'var(--glass-border)'}`, background: (defaultBundle ? 'bundle' : 'single') === val ? 'rgba(139,92,246,0.15)' : 'transparent', color: (defaultBundle ? 'bundle' : 'single') === val ? 'var(--accent-1)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500 }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="🖼️ Image Options">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>Add Watermark to Previews</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Adds a subtle watermark to mock-up images (not to final PDFs)</div>
              </div>
              <button
                onClick={() => setAddWatermark(v => !v)}
                style={{ width: '44px', height: '24px', borderRadius: '12px', background: addWatermark ? 'var(--accent-1)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
              >
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: addWatermark ? '23px' : '3px', transition: 'left 0.2s' }} />
              </button>
            </div>
          </Section>
        </>
      )}

      {/* ── Notifications ── */}
      {tab === 'notifications' && (
        <Section title="🔔 Email Notifications">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>Email Alerts</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Get notified when bundles are ready or listings are published</div>
            </div>
            <button
              onClick={() => setEmailNotify(v => !v)}
              style={{ width: '44px', height: '24px', borderRadius: '12px', background: emailNotify ? 'var(--accent-1)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
            >
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: emailNotify ? '23px' : '3px', transition: 'left 0.2s' }} />
            </button>
          </div>
          {emailNotify && (
            <Field label="Email Address">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
            </Field>
          )}
          <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.75rem', color: 'var(--accent-1)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Zap size={13} />Email notifications will be available when server-side integration is configured.
          </div>
        </Section>
      )}

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 28px' }}>
          {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
