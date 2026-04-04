'use client';

import { useState } from 'react';
import {
  Wand2, FileSpreadsheet, FileText,
  CheckCircle2, AlertCircle, ArrowRight,
  Settings2, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { DebtTrackerOptions } from '@/lib/styled-debt-tracker';
import { motion, AnimatePresence } from 'framer-motion';

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

function ToggleRow({ label, value, onChange, activeColor = 'bg-emerald-500', hoverColor = 'hover:bg-emerald-500/20' }: { label: string; value: boolean; onChange: (v: boolean) => void; activeColor?: string; hoverColor?: string }) {
  return (
    <div 
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border select-none ${
        value 
          ? `bg-white/5 border-white/10 text-white ${hoverColor}` 
          : 'bg-transparent border-white/5 text-slate-400 hover:bg-white/5'
      }`}
      onClick={() => onChange(!value)}
    >
      <span className="text-xs font-medium tracking-wide">{label}</span>
      <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${value ? activeColor : 'bg-white/10'}`}>
        <motion.div 
          initial={false}
          animate={{ left: value ? '18px' : '2px' }}
          className="absolute top-[2px] w-3 h-3 bg-white rounded-full shadow-sm"
        />
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
    setStatusMsg('GPT-4o is analyzing requirements...');
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
        setStatusMsg('Compiling Excel Matrix...');
        generatedFile = await buildExcel(data, prompt, debtOpts);
      } else {
        setStatusMsg('Rendering PDF Vectors...');
        generatedFile = await buildPdf(data, prompt);
      }

      setState('idle'); // the parent will take over and show the preview modal
      if (onPreviewReady && generatedFile) onPreviewReady(generatedFile);

    } catch (err) {
      setError((err as Error).message || 'Unknown generation error');
      setState('error');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/30">
            <Wand2 size={18} className="text-pink-400" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">AI Generate from Prompt</span>
        </div>
      )}

      {/* File type toggle */}
      <div className="flex gap-2">
        <button 
          onClick={() => setFileType('excel')} 
          className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 ${
            fileType === 'excel' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] font-bold' 
              : 'bg-transparent border-white/5 text-slate-400 hover:border-white/10 font-medium'
          }`}
        >
          <FileSpreadsheet size={20} />
          <span className="text-xs">Excel .xlsx</span>
        </button>
        <button 
          onClick={() => setFileType('pdf')} 
          className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 ${
            fileType === 'pdf' 
              ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.1)] font-bold' 
              : 'bg-transparent border-white/5 text-slate-400 hover:border-white/10 font-medium'
          }`}
        >
          <FileText size={20} />
          <span className="text-xs">Resume PDF</span>
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {state === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-6"
          >
            {/* Prompt textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Describe your desired product
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={4}
                suppressHydrationWarning
                placeholder={fileType === 'excel'
                  ? 'Example: Create a Debt Snowball tracker with monthly charts...'
                  : 'Example: Build a UX Designer Resume with 10 years experience...'}
                className="w-full bg-slate-950/50 border border-white/10 text-white p-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder-slate-500 resize-y min-h-[100px]"
              />
            </div>

            {/* Quick examples */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">💡 Quick Prompts</div>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.filter(p => fileType === 'excel' ? !p.includes('resume') && !p.includes('CV') && !p.includes('Director') : p.includes('resume') || p.includes('CV') || p.includes('Director')).map(ex => (
                  <button 
                    key={ex} 
                    onClick={() => setPrompt(ex)} 
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 px-3 py-1.5 text-xs cursor-pointer text-left transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Feature options (only for Excel + recognized templates) ── */}
            <AnimatePresence>
              {fileType === 'excel' && detectedTemplate === 'debt-tracker' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/30"
                >
                  {/* Collapsible header */}
                  <button
                    onClick={() => setShowFeatures(f => !f)}
                    className="w-full flex items-center justify-between p-3.5 bg-violet-500/5 hover:bg-violet-500/10 transition-colors border-none text-white text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Settings2 size={16} className="text-violet-400" />
                      Configuration Wizard
                    </span>
                    {showFeatures ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>

                  <AnimatePresence>
                    {showFeatures && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 flex flex-col gap-5 border-t border-white/5"
                      >
                        {/* Payoff Strategy */}
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-400">Payoff Strategy</div>
                          <div className="flex gap-2 flex-wrap">
                            {(['all', 'snowball', 'avalanche', 'custom'] as const).map(st => {
                              const active = debtOpts.strategy === st;
                              return (
                                <button 
                                  key={st} 
                                  onClick={() => setOpt('strategy', st)} 
                                  className={`px-3 py-1.5 rounded-full text-xs transition-all border ${active ? 'bg-violet-500 border-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.3)] text-white font-bold' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'}`}
                                >
                                  {st === 'all' ? 'Include All 3' : st.charAt(0).toUpperCase() + st.slice(1)}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Max Debts */}
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-400">Debt Capacity</div>
                          <div className="flex gap-2">
                            {([10, 25, 50] as const).map(n => {
                              const active = debtOpts.maxDebts === n;
                              return (
                                <button 
                                  key={n} 
                                  onClick={() => setOpt('maxDebts', n)} 
                                  className={`px-3 py-1.5 rounded-full text-xs transition-all border ${active ? 'bg-orange-500 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)] text-white font-bold' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'}`}
                                >
                                  {n} slots
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-400">Currency Symbol</div>
                          <div className="flex gap-2 flex-wrap mb-2">
                            {CURRENCY_PRESETS.map(c => {
                              const active = debtOpts.currency === c.value && !customCurrency;
                              return (
                                <button 
                                  key={c.value} 
                                  onClick={() => { setOpt('currency', c.value); setCustomCurrency(''); }}
                                  className={`px-3 py-1.5 rounded-full text-xs transition-all border ${active ? 'bg-pink-500 border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.3)] text-white font-bold' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'}`}
                                >
                                  {c.label}
                                </button>
                              )
                            })}
                          </div>
                          <input
                            value={customCurrency}
                            onChange={e => { setCustomCurrency(e.target.value); if (e.target.value) setOpt('currency', e.target.value); }}
                            placeholder="Custom Symbol (e.g. ฿, ₹)..."
                            className="w-full bg-black/20 border border-white/10 text-white px-3 py-2 rounded-lg text-xs outline-none focus:border-pink-500/50 transition-colors"
                          />
                        </div>

                        {/* Tab toggles */}
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-400">Included Tabs / Features</div>
                          <div className="flex flex-col gap-2">
                            <ToggleRow label="📊 KPI Dashboard" value={debtOpts.includeDashboard} onChange={v => setOpt('includeDashboard', v)} />
                            <ToggleRow label="📈 Visual Chart Data" value={debtOpts.includeChartData} onChange={v => setOpt('includeChartData', v)} activeColor="bg-blue-500" />
                            <ToggleRow label="📓 Monthly Journal Tracker" value={debtOpts.includeMonthlyJournal} onChange={v => setOpt('includeMonthlyJournal', v)} activeColor="bg-violet-500" />
                            <ToggleRow label="🚀 Quick Start Guide" value={debtOpts.includeQuickStart} onChange={v => setOpt('includeQuickStart', v)} activeColor="bg-orange-500" />
                            <ToggleRow label="📄 Readme Instructions" value={debtOpts.includeInstructions} onChange={v => setOpt('includeInstructions', v)} activeColor="bg-pink-500" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={generate}
              disabled={!prompt.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-30 disabled:hover:from-pink-500 disabled:hover:to-rose-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(244,63,94,0.25)] transition-all active:scale-95 mt-2"
            >
              <Wand2 size={18} /> Format {fileType === 'excel' ? 'Excel' : 'PDF'} Output <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* Generating state */}
        {(state === 'thinking' || state === 'building') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 gap-6"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-pink-500 border-r-violet-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                {fileType === 'excel' ? <FileSpreadsheet size={28} className="text-emerald-400" /> : <FileText size={28} className="text-pink-400" />}
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-lg font-bold text-white tracking-wide">{statusMsg}</div>
              <div className="text-sm text-slate-400">
                {state === 'thinking' ? 'Consulting GPT-4o architecture...' : 'Assembling file arrays...'}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {state === 'error' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 items-start">
              <AlertCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
              <div className="text-sm text-red-200">{error}</div>
            </div>
            <button 
              onClick={() => setState('idle')} 
              className="bg-transparent border border-white/10 hover:bg-white/5 text-white p-3 rounded-xl font-medium transition-colors"
            >
              Retry Configuration
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
