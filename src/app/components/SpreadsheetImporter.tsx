'use client';

import { useState, useRef } from 'react';
import {
  UploadCloud, Link2, FileSpreadsheet, Table2,
  CheckCircle2, AlertCircle, Loader2, X, ChevronDown, ChevronRight,
} from 'lucide-react';
import { parseExcelFile, importGoogleSheet, ImportResult, SheetSummary } from '@/lib/sheet-parser';

interface Props {
  onImportDone: (result: ImportResult) => void;
}

function SheetCard({ sheet, expanded, onToggle }: { sheet: SheetSummary; expanded: boolean; onToggle: () => void }) {
  return (
    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
      <button onClick={onToggle} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Table2 size={14} style={{ color: 'var(--accent-1)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{sheet.name}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '10px' }}>
            {sheet.rowCount} rows · {sheet.columnCount} cols
          </span>
        </div>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {expanded && sheet.headers.length > 0 && (
        <div style={{ padding: '10px', overflowX: 'auto' }}>
          {/* Headers */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
            {sheet.headers.slice(0, 8).map((h, i) => (
              <span key={i} style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: 'var(--accent-1)', fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                {h || `Col ${i + 1}`}
              </span>
            ))}
            {sheet.headers.length > 8 && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', padding: '2px 4px' }}>+{sheet.headers.length - 8} more</span>
            )}
          </div>

          {/* Sample rows */}
          {sheet.sampleData.slice(0, 3).map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {sheet.headers.slice(0, 4).map((_, ci) => (
                <span key={ci} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', minWidth: '40px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row[ci] != null ? String(row[ci]) : '—'}
                </span>
              ))}
              {sheet.headers.length > 4 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>…</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SpreadsheetImporter({ onImportDone }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'gsheets'>('upload');
  const [gsUrl, setGsUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [expandedSheets, setExpandedSheets] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);

  const toggleSheet = (name: string) => {
    setExpandedSheets(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const process = async (fn: () => Promise<ImportResult>) => {
    setStatus('loading');
    setError('');
    setResult(null);
    try {
      const res = await fn();
      setResult(res);
      setExpandedSheets(new Set([res.sheets[0]?.name])); // expand first sheet by default
      setStatus('done');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  };

  const handleFileChange = (file: File) => {
    process(() => parseExcelFile(file));
  };

  const handleGsImport = () => {
    if (!gsUrl.trim()) return;
    process(() => importGoogleSheet(gsUrl.trim()));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {([['upload', 'Upload File', <FileSpreadsheet key="f" size={14} />], ['gsheets', 'Google Sheets', <Link2 key="l" size={14} />]] as const).map(([key, label, icon]) => (
          <button key={key} onClick={() => { setMode(key); setStatus('idle'); setError(''); setResult(null); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${mode === key ? 'var(--accent-1)' : 'var(--glass-border)'}`, background: mode === key ? 'rgba(139,92,246,0.15)' : 'transparent', color: mode === key ? 'var(--accent-1)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: mode === key ? 600 : 400 }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Upload area */}
      {mode === 'upload' && status !== 'done' && (
        <label
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${isDragOver ? 'var(--accent-1)' : 'var(--glass-border)'}`, borderRadius: '12px', padding: '1.75rem 1rem', cursor: 'pointer', background: isDragOver ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.01)', transition: 'all 0.2s' }}>
          {status === 'loading'
            ? <Loader2 size={28} style={{ color: 'var(--accent-1)', animation: 'spin 1s linear infinite' }} />
            : <UploadCloud size={28} style={{ color: 'var(--accent-1)', marginBottom: '10px' }} />}
          <span style={{ fontSize: '0.8rem', fontWeight: 500, textAlign: 'center' }}>
            {status === 'loading' ? 'Reading file…' : <>Drop .xlsx or .csv here<br /><span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>or click to browse</span></>}
          </span>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }} />
          <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
        </label>
      )}

      {/* Google Sheets input */}
      {mode === 'gsheets' && status !== 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '8px 10px', lineHeight: 1.6 }}>
            📋 Sheet must be shared as <strong style={{ color: '#93c5fd' }}>"Anyone with the link can view"</strong><br />
            <span style={{ fontSize: '0.68rem' }}>File → Share → Change to "Anyone with the link"</span>
          </div>
          <input
            type="url"
            value={gsUrl}
            onChange={e => setGsUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '9px 12px', borderRadius: '8px', fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box' }}
          />
          <button onClick={handleGsImport} disabled={!gsUrl.trim() || status === 'loading'} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', opacity: !gsUrl.trim() ? 0.5 : 1 }}>
            {status === 'loading' ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Importing…</> : <><Link2 size={15} /> Import Sheet</>}
          </button>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600, marginBottom: '4px' }}>Import failed</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{error}</div>
          </div>
          <button onClick={() => setStatus('idle')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}><X size={14} /></button>
        </div>
      )}

      {/* Results */}
      {status === 'done' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Summary */}
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>{result.filename}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {result.sheets.length} sheet{result.sheets.length > 1 ? 's' : ''} detected · {result.sheets.reduce((s, sh) => s + sh.rowCount, 0)} total rows
              </div>
            </div>
            <button onClick={() => { setStatus('idle'); setResult(null); }} title="Remove" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}><X size={14} /></button>
          </div>

          {/* Sheet cards */}
          {result.sheets.map(sheet => (
            <SheetCard key={sheet.name} sheet={sheet} expanded={expandedSheets.has(sheet.name)} onToggle={() => toggleSheet(sheet.name)} />
          ))}

          {/* Use this template button */}
          <button onClick={() => onImportDone(result)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px' }}>
            <CheckCircle2 size={16} /> Use This Template
          </button>
        </div>
      )}
    </div>
  );
}
