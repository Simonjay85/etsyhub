'use client';

import { useState } from 'react';
import {
  Wand2, FileSpreadsheet, FileText,
  CheckCircle2, AlertCircle, ArrowRight,
  Settings2, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { DebtTrackerOptions } from '@/lib/styled-debt-tracker';

type FileType = 'excel' | 'pdf';
type GenState = 'idle' | 'thinking' | 'building' | 'done' | 'error';

const EXAMPLE_PROMPTS = [
  'Monthly budget tracker with income, expenses, and savings goal',
  'Employee attendance sheet with dates and status columns',
  'Project task tracker with priority, deadline, and owner',
  'Invoice tracker for freelancers with client and payment status',
  'Habit tracker — 30-day streak for daily goals',
  'Creative Director professional resume PDF',
  'UX Designer CV with portfolio section',
];

// ── Feature option defaults ──────────────────────────────────────────
const DEFAULT_DEBT_OPTIONS: DebtTrackerOptions = {
  strategy: 'all',
  maxDebts: 25,
  currency: '$',
  includeDashboard: true,
  includeChartData: true,
  includeMonthlyJournal: true,
  includeQuickStart: true,
  includeInstructions: true,
};

const CURRENCY_PRESETS = [
  { label: 'USD $', value: '$' },
  { label: 'EUR €', value: '€' },
  { label: 'GBP £', value: '£' },
  { label: 'AUD A$', value: 'A$' },
  { label: 'VND ₫', value: '₫' },
];

// ── Styles ────────────────────────────────────────────────────────────
const toggle = (active: boolean, color = '#10b981') => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
  background: active ? `${color}14` : 'rgba(255,255,255,0.03)',
  border: `1px solid ${active ? color + '44' : 'var(--glass-border)'}`,
  color: active ? color : 'var(--text-secondary)',
  fontSize: '0.75rem', fontWeight: active ? 600 : 400,
  transition: 'all 0.15s',
  userSelect: 'none' as const,
});

const chip = (active: boolean, color = '#8b5cf6') => ({
  padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
  background: active ? color : 'rgba(255,255,255,0.04)',
  border: `1px solid ${active ? color : 'var(--glass-border)'}`,
  color: active ? '#fff' : 'var(--text-secondary)',
  fontSize: '0.7rem', fontWeight: active ? 700 : 400,
  transition: 'all 0.15s',
});

const labelStyle = { fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '5px' };

function ToggleRow({ label, value, onChange, color }: { label: string; value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <div style={toggle(value, color)} onClick={() => onChange(!value)}>
      <span>{label}</span>
      <div style={{
        width: '28px', height: '15px', borderRadius: '8px',
        background: value ? (color || '#10b981') : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: '2px',
          left: value ? '15px' : '2px',
          width: '11px', height: '11px', borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
        }} />
      </div>
    </div>
  );
}

export default function AIGeneratePanel({ 
  onPreviewReady,
  hideTitle 
}: { 
  onPreviewReady?: (file: { blob: Blob, filename: string }) => void;
  hideTitle?: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  const [fileType, setFileType] = useState<FileType>('excel');
  const [state, setState] = useState<GenState>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);
  const [debtOpts, setDebtOpts] = useState<DebtTrackerOptions>(DEFAULT_DEBT_OPTIONS);
  const [customCurrency, setCustomCurrency] = useState('');

  const detectedTemplate = detectTemplate(prompt);

  const setOpt = <K extends keyof DebtTrackerOptions>(k: K, v: DebtTrackerOptions[K]) =>
    setDebtOpts(prev => ({ ...prev, [k]: v }));

  const generate = async () => {
    if (!prompt.trim()) return;
    setState('thinking');
    setStatusMsg('GPT-4o đang phân tích yêu cầu…');
    setError('');

    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), fileType }),
      });
      const data = await res.json();

      setState('building');

      let generatedFile: { blob: Blob, filename: string } | null = null;
      if (fileType === 'excel') {
        setStatusMsg('Đang tạo file Excel…');
        generatedFile = await buildExcel(data, prompt, debtOpts);
      } else {
        setStatusMsg('Đang render PDF…');
        generatedFile = await buildPdf(data, prompt);
      }

      setState('idle'); // the parent will take over and show the preview modal
      if (onPreviewReady && generatedFile) onPreviewReady(generatedFile);

    } catch (err) {
      setError((err as Error).message || 'Lỗi không xác định');
      setState('error');
    }
  };

  const reset = () => { setState('idle'); setPrompt(''); setStatusMsg(''); setError(''); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      {!hideTitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wand2 size={16} style={{ color: 'var(--accent-2)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI Generate từ Prompt</span>
        </div>
      )}

      {/* File type toggle */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => setFileType('excel')} style={{ flex: 1, padding: '9px 6px', borderRadius: '8px', border: `1px solid ${fileType === 'excel' ? '#10b981' : 'var(--glass-border)'}`, background: fileType === 'excel' ? 'rgba(16,185,129,0.12)' : 'transparent', color: fileType === 'excel' ? '#10b981' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.74rem', fontWeight: fileType === 'excel' ? 700 : 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <FileSpreadsheet size={16} />Excel .xlsx
        </button>
        <button onClick={() => setFileType('pdf')} style={{ flex: 1, padding: '9px 6px', borderRadius: '8px', border: `1px solid ${fileType === 'pdf' ? 'var(--accent-2)' : 'var(--glass-border)'}`, background: fileType === 'pdf' ? 'rgba(236,72,153,0.12)' : 'transparent', color: fileType === 'pdf' ? 'var(--accent-2)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.74rem', fontWeight: fileType === 'pdf' ? 700 : 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <FileText size={16} />Resume PDF
        </button>
      </div>

      {/* Prompt textarea */}
      {state === 'idle' && (
        <>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              Mô tả file bạn muốn tạo
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={4}
              suppressHydrationWarning
              placeholder={fileType === 'excel'
                ? 'Ví dụ: Tạo bảng theo dõi nợ theo phương pháp Snowball...'
                : 'Ví dụ: Tạo CV cho vị trí UX Designer với 10 năm kinh nghiệm...'}
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, fontFamily: 'inherit' }}
            />
          </div>

          {/* Quick examples */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>💡 Ví dụ nhanh:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {EXAMPLE_PROMPTS.filter(p => fileType === 'excel' ? !p.includes('resume') && !p.includes('CV') && !p.includes('Director') : p.includes('resume') || p.includes('CV') || p.includes('Director')).map(ex => (
                <button key={ex} onClick={() => setPrompt(ex)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-secondary)', padding: '3px 8px', fontSize: '0.66rem', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4 }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* ── Feature options (only for Excel + recognized templates) ── */}
          {fileType === 'excel' && detectedTemplate === 'debt-tracker' && (
            <div style={{ border: '1px solid var(--glass-border)', borderRadius: '10px', overflow: 'hidden' }}>
              {/* Collapsible header */}
              <button
                onClick={() => setShowFeatures(f => !f)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'rgba(139,92,246,0.08)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Settings2 size={13} style={{ color: '#8b5cf6' }} />
                  ⚙ Tùy chọn tính năng
                </span>
                {showFeatures ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {showFeatures && (
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.15)' }}>

                  {/* Payoff Strategy */}
                  <div>
                    <div style={labelStyle}>Chiến lược trả nợ</div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {(['all', 'snowball', 'avalanche', 'custom'] as const).map(st => (
                        <button key={st} onClick={() => setOpt('strategy', st)} style={chip(debtOpts.strategy === st)}>
                          {st === 'all' ? 'Tất cả 3' : st.charAt(0).toUpperCase() + st.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                      {debtOpts.strategy === 'snowball' && '❄️ Trả nợ nhỏ nhất trước — chiến thắng tâm lý nhanh'}
                      {debtOpts.strategy === 'avalanche' && '🏔 Trả lãi suất cao nhất trước — tiết kiệm tiền nhất'}
                      {debtOpts.strategy === 'custom' && '✏️ Sắp xếp thứ tự theo ý muốn của bạn'}
                      {debtOpts.strategy === 'all' && '📊 Bao gồm cả 3 tab Snowball, Avalanche, Custom'}
                    </div>
                  </div>

                  {/* Max Debts */}
                  <div>
                    <div style={labelStyle}>Số nợ tối đa</div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {([10, 25, 50] as const).map(n => (
                        <button key={n} onClick={() => setOpt('maxDebts', n)} style={chip(debtOpts.maxDebts === n, '#f97316')}>
                          {n} nợ
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <div style={labelStyle}>Ký hiệu tiền tệ</div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '5px' }}>
                      {CURRENCY_PRESETS.map(c => (
                        <button key={c.value} onClick={() => { setOpt('currency', c.value); setCustomCurrency(''); }} style={chip(debtOpts.currency === c.value && !customCurrency, '#ec4899')}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                    <input
                      value={customCurrency}
                      onChange={e => { setCustomCurrency(e.target.value); if (e.target.value) setOpt('currency', e.target.value); }}
                      placeholder="Ký hiệu khác... (vd: ฿, ₹)"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: `1px solid ${customCurrency ? '#ec4899' : 'var(--glass-border)'}`, color: 'white', padding: '5px 9px', borderRadius: '6px', fontSize: '0.72rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Tab toggles */}
                  <div>
                    <div style={labelStyle}>Bao gồm các tab</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <ToggleRow label="📊 Dashboard (KPI cards)" value={debtOpts.includeDashboard} onChange={v => setOpt('includeDashboard', v)} />
                      <ToggleRow label="📈 Chart Data (dữ liệu biểu đồ)" value={debtOpts.includeChartData} onChange={v => setOpt('includeChartData', v)} color="#3b82f6" />
                      <ToggleRow label="📓 Monthly Journal (nhật ký tháng)" value={debtOpts.includeMonthlyJournal} onChange={v => setOpt('includeMonthlyJournal', v)} color="#8b5cf6" />
                      <ToggleRow label="🚀 Quick Start Guide" value={debtOpts.includeQuickStart} onChange={v => setOpt('includeQuickStart', v)} color="#f97316" />
                      <ToggleRow label="📄 Instructions PDF" value={debtOpts.includeInstructions} onChange={v => setOpt('includeInstructions', v)} color="#ec4899" />
                    </div>
                  </div>

                  {/* Summary preview */}
                  <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '7px', padding: '8px 10px', fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Template sẽ bao gồm: </span>
                    {[
                      debtOpts.includeQuickStart && 'Quick Start',
                      debtOpts.includeDashboard && 'Dashboard',
                      'Debt Setup',
                      debtOpts.strategy === 'all' ? 'Snowball + Avalanche + Custom' : debtOpts.strategy.charAt(0).toUpperCase() + debtOpts.strategy.slice(1),
                      debtOpts.includeChartData && 'Chart Data',
                      debtOpts.includeMonthlyJournal && 'Monthly Journal',
                    ].filter(Boolean).join(' → ')}
                    <br />
                    <span style={{ color: '#f97316' }}>Max {debtOpts.maxDebts} nợ</span> · <span style={{ color: '#ec4899' }}>Tiền tệ: {debtOpts.currency}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={generate}
            disabled={!prompt.trim()}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', opacity: prompt.trim() ? 1 : 0.5 }}
          >
            <Wand2 size={15} /> Tạo {fileType === 'excel' ? 'file Excel' : 'file PDF'} <ArrowRight size={14} />
          </button>
        </>
      )}

      {/* Generating state */}
      {(state === 'thinking' || state === 'building') && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0', gap: '1rem' }}>
          <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
          <div style={{ position: 'relative', width: '52px', height: '52px' }}>
            <div style={{ width: '100%', height: '100%', border: '3px solid transparent', borderTopColor: 'var(--accent-1)', borderRightColor: 'var(--accent-2)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            {fileType === 'excel' ? <FileSpreadsheet size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#10b981' }} /> : <FileText size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--accent-2)' }} />}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>{statusMsg}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {state === 'thinking' ? 'Đang gọi GPT-4o…' : 'Đang tạo file…'}
            </div>
          </div>
        </div>
      )}

      {/* Done state removed — handled by parent Preview Modal */}

      {/* Error */}
      {state === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '12px', display: 'flex', gap: '8px' }}>
            <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '0.78rem', color: '#ef4444' }}>{error}</div>
          </div>
          <button onClick={() => setState('idle')} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '9px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Thử lại</button>
        </div>
      )}
    </div>
  );
}

/* ── Generator helpers ────────────────────────────────────────────────────── */

function detectTemplate(prompt: string): string | null {
  const p = prompt.toLowerCase();
  if (/debt|loan|snowball|avalanche|payoff|repay/.test(p)) return 'debt-tracker';
  if (/budget|expense|spending|chi.ti.u|chi ph/.test(p)) return 'budget-tracker';
  if (/saving|savings goal|tiet kiem|ti.t ki.m/.test(p)) return 'savings-tracker';
  if (/invoice|freelance|client|billing|payment.track/.test(p)) return 'invoice-tracker';
  return null;
}

async function buildExcel(data: Record<string, unknown>, prompt: string, debtOpts: DebtTrackerOptions): Promise<{ blob: Blob, filename: string }> {
  const template = detectTemplate(prompt);
  if (template === 'debt-tracker') {
    const { generateStyledDebtTracker } = await import('@/lib/styled-debt-tracker');
    return await generateStyledDebtTracker(undefined, 'Debt_Dashboard', debtOpts);
  }

  if (template === 'budget-tracker') {
    const { generateBudgetTrackerBundle } = await import('@/lib/spreadsheet-generator');
    return await generateBudgetTrackerBundle('Monthly_Budget_Tracker');
  }
  if (template === 'savings-tracker') {
    const { generateSavingsTrackerBundle } = await import('@/lib/spreadsheet-generator');
    return await generateSavingsTrackerBundle('Savings_Goal_Tracker');
  }
  if (template === 'invoice-tracker') {
    const { generateInvoiceTrackerBundle } = await import('@/lib/spreadsheet-generator');
    return await generateInvoiceTrackerBundle('Invoice_Tracker');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX: any = await import('xlsx');
  const JSZip = (await import('jszip')).default;

  const title = (data.title as string) || prompt.slice(0, 40) || 'Spreadsheet';
  const slug = title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
  const sheets = (data.sheets as Array<{
    name: string;
    headers: string[];
    sampleRows: (string | number | null)[][];
  }>) || [];

  if (sheets.length === 0) throw new Error('No sheet data returned from AI. Please try again.');

  const sampleWb = XLSX.utils.book_new();
  for (const sh of sheets) {
    const dataRows = Array.isArray(sh.sampleRows) ? sh.sampleRows : [];
    const allRows = [sh.headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    ws['!cols'] = sh.headers.map((h: string) => ({ wch: Math.max(typeof h === 'string' ? h.length + 4 : 12, 14) }));
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(sampleWb, ws, sh.name.slice(0, 31));
  }
  const sampleBuf: ArrayBuffer = XLSX.write(sampleWb, { type: 'array', bookType: 'xlsx', bookSST: false });

  const blankWb = XLSX.utils.book_new();
  for (const sh of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sh.headers]);
    ws['!cols'] = sh.headers.map((h: string) => ({ wch: Math.max(typeof h === 'string' ? h.length + 4 : 12, 14) }));
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(blankWb, ws, sh.name.slice(0, 31));
  }
  const blankBuf: ArrayBuffer = XLSX.write(blankWb, { type: 'array', bookType: 'xlsx', bookSST: false });

  const zip = new JSZip();
  const folder = zip.folder(slug)!;
  folder.file(`Sample_${slug}.xlsx`, sampleBuf);
  folder.file(`Blank_${slug}.xlsx`, blankBuf);
  folder.file('README.txt', [title, '='.repeat(40), '', `Created from: "${prompt.slice(0, 120)}"`, '', 'FILES:', `  Sample_${slug}.xlsx  — pre-filled with example data`, `  Blank_${slug}.xlsx   — headers only, ready to fill`, '', 'Open with Microsoft Excel or upload to Google Drive → Open with Google Sheets.'].join('\n'));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  return { blob, filename: `${slug}.zip` };
}

async function buildPdf(data: Record<string, unknown>, prompt: string): Promise<{ blob: Blob, filename: string }> {
  const { generateResumePDF } = await import('@/lib/pdf-generator');
  const FONT_PAIRS = [
    { label: 'Montserrat + Lato', heading: 'Montserrat', body: 'Lato' },
    { label: 'Space Grotesk + DM Sans', heading: 'Space Grotesk', body: 'DM Sans' },
  ];
  return await generateResumePDF({
    niche: (data.niche as string) || prompt.slice(0, 40),
    title: (data.title as string) || prompt.slice(0, 50),
    summary: (data.summary as string) || `${prompt.slice(0, 60)} professional with a track record of excellence.`,
    imageUrl: null,
    fontPair: FONT_PAIRS[Math.floor(Math.random() * FONT_PAIRS.length)],
    pageCount: 1,
  });
}
