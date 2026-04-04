'use client';

import React, { useState } from 'react';
import AIGeneratePanel from './AIGeneratePanel';
import SpreadsheetImporter from './SpreadsheetImporter';
import ExcelPreview from './ExcelPreview';
import { Package, Wand2, Copy, Download, CheckCircle2, Loader2, Palette } from 'lucide-react';
import type { ImportResult } from '@/lib/sheet-parser';
import { cloneSpreadsheet, THEMES } from '@/lib/clone-spreadsheet';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductGenerator() {
  const [mode, setMode] = useState<'generate' | 'clone'>('generate');
  const [generatedFile, setGeneratedFile] = useState<{ blob: Blob, filename: string } | null>(null);
  
  // Clone Config State
  const [importData, setImportData] = useState<ImportResult | null>(null);
  const [cloneTitle, setCloneTitle] = useState('');
  const [cloneTheme, setCloneTheme] = useState(THEMES[0].name);
  const [isCloning, setIsCloning] = useState(false);

  const handleGenerateClone = async () => {
    if (!importData) return;
    setIsCloning(true);
    try {
      const result = await cloneSpreadsheet(importData, cloneTitle, cloneTheme);
      setGeneratedFile(result);
    } catch (err) {
      console.error(err);
      alert('Failed to generate clone: ' + (err as Error).message);
    } finally {
      setIsCloning(false);
    }
  };

  const resetAll = () => {
    setGeneratedFile(null);
    setImportData(null);
    setCloneTitle('');
    setCloneTheme(THEMES[0].name);
  };

  return (
    <div className="flex w-full h-full gap-6 p-4">
      {/* Left Column - Controls */}
      <div className="w-[420px] shrink-0 flex flex-col gap-0 overflow-y-auto bg-slate-900/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl relative z-10">
        
        {/* Mode switcher */}
        <div className="flex gap-2 p-4 border-b border-white/5">
          <button 
            onClick={() => { setMode('generate'); resetAll(); }} 
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm transition-all duration-200 ${
              mode === 'generate' 
                ? 'bg-pink-500/15 border-pink-500/30 text-pink-400 font-bold tracking-wide' 
                : 'bg-transparent border-white/5 text-slate-400 hover:bg-white/5 font-medium'
            } border`}
          >
            <Wand2 size={16} /> Create Config
          </button>
          
          <button 
            onClick={() => { setMode('clone'); resetAll(); }} 
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm transition-all duration-200 ${
              mode === 'clone' 
                ? 'bg-violet-500/15 border-violet-500/30 text-violet-400 font-bold tracking-wide' 
                : 'bg-transparent border-white/5 text-slate-400 hover:bg-white/5 font-medium'
            } border`}
          >
            <Copy size={16} /> Deep Clone File
          </button>
        </div>

        {/* Control Panel Body */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {!generatedFile ? (
              <motion.div 
                key={mode + (importData ? '-cloning' : '')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                {mode === 'generate' && (
                  <AIGeneratePanel onPreviewReady={(f) => setGeneratedFile(f)} hideTitle={true} />
                )}

                {mode === 'clone' && !importData && (
                  <SpreadsheetImporter onImportDone={(data) => {
                      setImportData(data);
                      setCloneTitle(data.filename.replace(/\.[^.]+$/, '') || 'My Cloned Planner');
                  }} />
                )}

                {mode === 'clone' && importData && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-violet-500/15 flex items-center justify-center border border-violet-500/20">
                        <Palette size={22} className="text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold m-0 text-base">Style & Clone Theme</h3>
                        <p className="text-slate-400 text-xs">Deploy as a custom styled variant</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">New Product Title (File Name)</label>
                      <input 
                        type="text" 
                        value={cloneTitle} 
                        onChange={e => setCloneTitle(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/10 text-white p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder-slate-500"
                        placeholder="e.g. 2024 Advanced Expense Tracker"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-300">Select Universal Color Theme</label>
                      <div className="flex flex-col gap-2">
                        {THEMES.map(theme => {
                          const isActive = cloneTheme === theme.name;
                          return (
                            <button
                              key={theme.name}
                              onClick={() => setCloneTheme(theme.name)}
                              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                isActive 
                                  ? 'bg-violet-500/10 border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                                  : 'bg-transparent border-white/5 hover:border-white/20'
                              }`}
                            >
                              <span className={`text-sm tracking-wide ${isActive ? 'font-bold text-white' : 'font-medium text-slate-400'}`}>
                                {theme.name} Palette
                              </span>
                              <div className="flex gap-1.5 shadow-sm">
                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: `rgb(${theme.accent.join(',')})` }} />
                                <div className="w-4 h-4 rounded-full" style={{ background: `rgb(${theme.header.join(',')})` }} />
                                <div className="w-4 h-4 rounded-full" style={{ background: `rgb(${theme.dark.join(',')})` }} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button 
                      onClick={handleGenerateClone}
                      disabled={isCloning || !cloneTitle.trim()}
                      className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 disabled:opacity-50 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(139,92,246,0.3)] transition-all active:scale-95"
                    >
                      {isCloning ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                      {isCloning ? 'Synthesizing Clone...' : 'Generate New Clone Matrix'}
                    </button>
                    
                    <button 
                      onClick={() => setImportData(null)} 
                      className="w-full bg-transparent text-slate-400 hover:text-white text-sm py-2 transition-colors"
                    >
                      Wait, go back to import
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="generated"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center mt-12 px-2"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  >
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </motion.div>
                </div>
                
                <h3 className="m-0 text-white text-2xl font-bold tracking-tight mb-2">Package Deployed!</h3>
                <p className="text-sm text-slate-400 mb-8 p-3 bg-white/5 rounded-xl break-all border border-white/5">
                  {generatedFile.filename}
                </p>

                <div className="w-full flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      const url = URL.createObjectURL(generatedFile.blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = generatedFile.filename || 'Etsy_Digital_Product.zip';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }} 
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.25)] transition-all active:scale-95"
                  >
                    <Download size={20} /> Download Source Zip
                  </button>
                  
                  <button 
                    onClick={() => setGeneratedFile(null)} 
                    className="w-full bg-slate-800/50 hover:bg-slate-800 border border-white/10 text-slate-300 p-4 rounded-xl font-medium transition-all"
                  >
                    Create Another Module
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Column - Product Preview / Mockup Area */}
      <div className="flex-1 relative overflow-hidden rounded-2xl border border-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/80 to-slate-950/80 flex flex-col items-center justify-center shadow-2xl">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          {generatedFile ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative z-10 p-6 flex flex-col"
            >
              <ExcelPreview blob={generatedFile.blob} filename={generatedFile.filename} />
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center opacity-70 max-w-[480px] flex flex-col items-center relative z-10 mix-blend-plus-lighter"
            >
              <div className="w-28 h-28 rounded-[2rem] bg-white/[0.02] border border-white/10 flex items-center justify-center mb-10 shadow-2xl backdrop-blur-sm relative">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-violet-500/10 to-pink-500/10 animate-pulse" />
                <Package size={56} className="text-slate-400 opacity-80" />
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                Digital Factory Output
              </h3>
              <p className="text-base text-slate-400 font-medium leading-relaxed max-w-md">
                Deploy advanced product architectures or clone existing ones on the left panel. AI will orchestrate a production-ready package here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
