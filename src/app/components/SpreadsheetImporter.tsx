'use client';

import { useState, useRef } from 'react';
import {
  UploadCloud, Link2, FileSpreadsheet, Table2,
  CheckCircle2, AlertCircle, Loader2, X, ChevronDown, ChevronRight,
} from 'lucide-react';
import { parseExcelFile, importGoogleSheet, ImportResult, SheetSummary } from '@/lib/sheet-parser';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onImportDone: (result: ImportResult) => void;
}

function SheetCard({ sheet, expanded, onToggle }: { sheet: SheetSummary; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="border border-white/5 bg-slate-900/50 rounded-xl overflow-hidden mb-2 transition-all hover:border-violet-500/30">
      <button 
        onClick={onToggle} 
        className="w-full bg-transparent hover:bg-white/5 border-none text-white p-3 flex items-center justify-between cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30">
            <Table2 size={16} className="text-violet-400" />
          </div>
          <span className="text-sm font-semibold tracking-wide">{sheet.name}</span>
          <span className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 ml-2">
            {sheet.rowCount} rows · {sheet.columnCount} cols
          </span>
        </div>
        {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>

      <AnimatePresence>
        {expanded && sheet.headers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3 overflow-x-auto custom-scrollbar border-t border-white/5"
          >
            {/* Headers */}
            <div className="flex gap-1.5 mb-2 flex-nowrap mt-3">
              {sheet.headers.slice(0, 8).map((h, i) => (
                <span 
                  key={i} 
                  className="bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold whitespace-nowrap"
                >
                  {h || `Col ${i + 1}`}
                </span>
              ))}
              {sheet.headers.length > 8 && (
                <span className="text-slate-500 text-[10px] px-1 py-1 italic">
                  +{sheet.headers.length - 8} more
                </span>
              )}
            </div>

            {/* Sample rows */}
            <div className="space-y-1.5 pl-1">
              {sheet.sampleData.slice(0, 3).map((row, ri) => (
                <div key={ri} className="flex gap-1.5">
                  {sheet.headers.slice(0, 4).map((_, ci) => (
                    <span 
                      key={ci} 
                      className="bg-slate-950/50 border border-white/5 text-slate-400 text-[11px] px-2 py-1 rounded truncate min-w-[60px] max-w-[100px]"
                    >
                      {row[ci] != null ? String(row[ci]) : '—'}
                    </span>
                  ))}
                  {sheet.headers.length > 4 && (
                    <span className="text-slate-500 text-[11px] py-1 px-2">…</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="flex flex-col gap-5 w-full">
      {/* Tab switcher */}
      <div className="flex gap-2">
        {([['upload', 'Local File', <FileSpreadsheet key="f" size={16} />], ['gsheets', 'Google Sheets', <Link2 key="l" size={16} />]] as const).map(([key, label, icon]) => (
          <button 
            key={key} 
            onClick={() => { setMode(key); setStatus('idle'); setError(''); setResult(null); }} 
            className={`flex-1 p-2.5 rounded-xl border flex justify-center items-center gap-2 transition-all duration-200 ${
              mode === key 
                ? 'bg-violet-500/15 border-violet-500/40 text-violet-400 font-bold shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                : 'bg-transparent border-white/5 text-slate-400 hover:border-white/20 font-medium'
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {/* Upload area */}
        {mode === 'upload' && status !== 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <label
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              className={`flex flex-col items-center justify-center rounded-2xl p-10 cursor-pointer overflow-hidden transition-all duration-300 relative border-2 border-dashed ${
                isDragOver ? 'bg-violet-500/10 border-violet-500 scale-[1.02]' : 'bg-slate-900/30 border-white/10 hover:border-white/30 hover:bg-white/5'
              }`}
            >
              <div className={`p-4 rounded-full mb-4 transition-all duration-500 ${isDragOver ? 'bg-violet-500/20 rotate-12 scale-110' : 'bg-white/5'}`}>
                {status === 'loading'
                  ? <Loader2 size={32} className="text-violet-400 animate-spin" />
                  : <UploadCloud size={32} className={`${isDragOver ? 'text-violet-400' : 'text-slate-400'}`} />
                }
              </div>
              <span className="text-sm font-semibold text-center text-white">
                {status === 'loading' ? 'Analyzing spreadsheet matrix...' : (
                  <>
                    Drop .xlsx or .csv structure here<br />
                    <span className="text-slate-500 text-xs font-normal mt-1 block">or click to browse local files</span>
                  </>
                )}
              </span>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }} />
            </label>
          </motion.div>
        )}

        {/* Google Sheets input */}
        {mode === 'gsheets' && status !== 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-4 p-4 border border-white/5 bg-slate-900/30 rounded-2xl"
          >
            <div className="text-xs text-blue-200/70 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 leading-relaxed">
              📋 Sheet must be shared as <strong className="text-blue-400">"Anyone with the link can view"</strong><br />
              <span className="text-[10px] opacity-70">File → Share → Change to "Anyone with the link"</span>
            </div>
            
            <div className="relative">
              <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                value={gsUrl}
                onChange={e => setGsUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full bg-black/40 border border-white/10 text-white py-3 pr-3 pl-10 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all placeholder-slate-600 shadow-inner"
              />
            </div>
            
            <button 
              onClick={handleGsImport} 
              disabled={!gsUrl.trim() || status === 'loading'} 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 disabled:opacity-50 text-white rounded-xl py-3 px-4 font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
            >
              {status === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Tunneling data...</> : <><Link2 size={16} /> Import Configuration</>}
            </button>
          </motion.div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex gap-3 items-start relative select-none"
          >
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div className="pr-6">
              <div className="text-sm text-red-400 font-bold mb-1">Import Interface Failed</div>
              <div className="text-xs text-red-200/70 leading-relaxed">{error}</div>
            </div>
            <button onClick={() => setStatus('idle')} className="absolute top-3.5 right-3 text-red-400/70 hover:text-red-400 transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* Results */}
        {status === 'done' && result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            {/* Summary */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex gap-3 items-start relative">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="pr-6">
                <div className="text-sm text-emerald-400 font-bold mb-0.5">{result.filename}</div>
                <div className="text-[11px] text-emerald-200/60 font-medium tracking-wide">
                  {result.sheets.length} valid sheet{result.sheets.length > 1 ? 's' : ''} parsed · {result.sheets.reduce((s, sh) => s + sh.rowCount, 0)} total nodes mapped
                </div>
              </div>
              <button onClick={() => { setStatus('idle'); setResult(null); }} title="Discard" className="absolute top-3.5 right-3 text-emerald-400/50 hover:text-emerald-400 transition-colors bg-black/20 p-1.5 rounded-lg">
                <X size={14} />
              </button>
            </div>

            {/* Sheet cards */}
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-2">
              {result.sheets.map((sheet, index) => (
                <motion.div 
                  key={sheet.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SheetCard sheet={sheet} expanded={expandedSheets.has(sheet.name)} onToggle={() => toggleSheet(sheet.name)} />
                </motion.div>
              ))}
            </div>

            {/* Use this template button */}
            <button 
              onClick={() => onImportDone(result)} 
              className="mt-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl p-4 font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.25)] transition-all active:scale-95 translate-y-0 hover:-translate-y-0.5"
            >
              <CheckCircle2 size={18} /> Initialize Clone Architecture
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
