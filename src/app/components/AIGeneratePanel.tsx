'use client';

import { useState } from 'react';
import {
  Wand2, FileSpreadsheet, FileText, Loader2,
  Download, CheckCircle2, AlertCircle, ArrowRight,
} from 'lucide-react';

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

export default function AIGeneratePanel() {
  const [prompt, setPrompt] = useState('');
  const [fileType, setFileType] = useState<FileType>('excel');
  const [state, setState] = useState<GenState>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

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

      if (fileType === 'excel') {
        setStatusMsg('Đang tạo file Excel…');
        await buildExcel(data, prompt);
      } else {
        setStatusMsg('Đang render PDF…');
        await buildPdf(data, prompt);
      }

      setState('done');
    } catch (err) {
      setError((err as Error).message || 'Lỗi không xác định');
      setState('error');
    }
  };

  const reset = () => { setState('idle'); setPrompt(''); setStatusMsg(''); setError(''); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Wand2 size={16} style={{ color: 'var(--accent-2)' }} />
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI Generate từ Prompt</span>
      </div>

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
              placeholder={fileType === 'excel'
                ? 'Ví dụ: Tạo bảng theo dõi chi phí hàng tháng với cột thu nhập, chi tiêu, và tiết kiệm...'
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

      {/* Done */}
      {state === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '12px', display: 'flex', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>File đã tải về!</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Kiểm tra thư mục Downloads của bạn.</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
            &ldquo;{prompt.slice(0, 80)}{prompt.length > 80 ? '…' : ''}&rdquo;
          </div>
          <button onClick={reset} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
            Tạo file khác
          </button>
        </div>
      )}

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

/**
 * Detect if the prompt matches a specialized template we already have
 */
function detectTemplate(prompt: string): string | null {
  const p = prompt.toLowerCase();
  if (/debt|loan|snowball|avalanche|payoff|repay/.test(p)) return 'debt-tracker';
  if (/budget|expense|spending|chi.ti.u|chi ph/.test(p)) return 'budget-tracker';
  if (/saving|savings goal|tiet kiem|ti.t ki.m/.test(p)) return 'savings-tracker';
  if (/invoice|freelance|client|billing|payment.track/.test(p)) return 'invoice-tracker';
  return null;
}

async function buildExcel(data: Record<string, unknown>, prompt: string) {
  // Route to specialized generators for known templates
  const template = detectTemplate(prompt);
  if (template === 'debt-tracker') {
    const { generateStyledDebtTracker } = await import('@/lib/styled-debt-tracker');
    await generateStyledDebtTracker(undefined, 'Debt_Dashboard');
    return;
  }

  if (template === 'budget-tracker') {
    const { generateBudgetTrackerBundle } = await import('@/lib/spreadsheet-generator');
    await generateBudgetTrackerBundle('Monthly_Budget_Tracker');
    return;
  }
  if (template === 'savings-tracker') {
    const { generateSavingsTrackerBundle } = await import('@/lib/spreadsheet-generator');
    await generateSavingsTrackerBundle('Savings_Goal_Tracker');
    return;
  }
  if (template === 'invoice-tracker') {
    const { generateInvoiceTrackerBundle } = await import('@/lib/spreadsheet-generator');
    await generateInvoiceTrackerBundle('Invoice_Tracker');
    return;
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

  /* ── Build SAMPLE workbook (data included) ── */
  const sampleWb = XLSX.utils.book_new();
  for (const sh of sheets) {
    // Ensure sampleRows is always an array
    const dataRows = Array.isArray(sh.sampleRows) ? sh.sampleRows : [];
    const allRows = [sh.headers, ...dataRows];

    // Use aoa_to_sheet — no styling (standard SheetJS doesn't support .s)
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Set column widths
    ws['!cols'] = sh.headers.map((h: string) => ({
      wch: Math.max(typeof h === 'string' ? h.length + 4 : 12, 14),
    }));

    // Freeze top row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(sampleWb, ws, sh.name.slice(0, 31));
  }
  const sampleBuf: ArrayBuffer = XLSX.write(sampleWb, {
    type: 'array',
    bookType: 'xlsx',
    bookSST: false,
  });

  /* ── Build BLANK workbook (headers only) ── */
  const blankWb = XLSX.utils.book_new();
  for (const sh of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sh.headers]);
    ws['!cols'] = sh.headers.map((h: string) => ({
      wch: Math.max(typeof h === 'string' ? h.length + 4 : 12, 14),
    }));
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(blankWb, ws, sh.name.slice(0, 31));
  }
  const blankBuf: ArrayBuffer = XLSX.write(blankWb, {
    type: 'array',
    bookType: 'xlsx',
    bookSST: false,
  });

  /* ── Package as ZIP ── */
  const zip = new JSZip();
  const folder = zip.folder(slug)!;
  folder.file(`Sample_${slug}.xlsx`, sampleBuf);
  folder.file(`Blank_${slug}.xlsx`, blankBuf);
  folder.file(
    'README.txt',
    [
      title,
      '='.repeat(40),
      '',
      `Created from: "${prompt.slice(0, 120)}"`,
      '',
      'FILES:',
      `  Sample_${slug}.xlsx  — pre-filled with example data`,
      `  Blank_${slug}.xlsx   — headers only, ready to fill`,
      '',
      'Open with Microsoft Excel or upload to Google Drive → Open with Google Sheets.',
    ].join('\n'),
  );

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function buildPdf(data: Record<string, unknown>, prompt: string) {
  const { generateResumePDF } = await import('@/lib/pdf-generator');
  const FONT_PAIRS = [
    { label: 'Montserrat + Lato', heading: 'Montserrat', body: 'Lato' },
    { label: 'Space Grotesk + DM Sans', heading: 'Space Grotesk', body: 'DM Sans' },
  ];
  await generateResumePDF({
    niche: (data.niche as string) || prompt.slice(0, 40),
    title: (data.title as string) || prompt.slice(0, 50),
    summary:
      (data.summary as string) ||
      `${prompt.slice(0, 60)} professional with a track record of excellence.`,
    imageUrl: null,
    fontPair: FONT_PAIRS[Math.floor(Math.random() * FONT_PAIRS.length)],
    pageCount: 1,
  });
}

