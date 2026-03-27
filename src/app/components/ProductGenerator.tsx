'use client';

import React, { useState } from 'react';
import AIGeneratePanel from './AIGeneratePanel';
import SpreadsheetImporter from './SpreadsheetImporter';
import ExcelPreview from './ExcelPreview';
import { Package, Wand2, Copy, Download, CheckCircle2, Loader2, Palette } from 'lucide-react';
import type { ImportResult } from '@/lib/sheet-parser';
import { cloneSpreadsheet, THEMES } from '@/lib/clone-spreadsheet';

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
    <div style={{ display: 'flex', width: '100%', height: '100%', gap: '24px' }}>
      {/* Left Column - Controls */}
      <div style={{
        width: '400px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0', overflowY: 'auto',
        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px',
      }}>
        {/* Mode switcher */}
        <div style={{ display: 'flex', gap: '8px', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => { setMode('generate'); resetAll(); }} style={{
            flex: 1, padding: '12px 8px', borderRadius: '10px',
            border: `1px solid ${mode === 'generate' ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.06)'}`,
            background: mode === 'generate' ? 'rgba(236,72,153,0.1)' : 'transparent',
            color: mode === 'generate' ? 'var(--accent-2)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: mode === 'generate' ? 700 : 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.15s',
          }}>
            <Wand2 size={16} /> Create from Config
          </button>
          <button onClick={() => { setMode('clone'); resetAll(); }} style={{
            flex: 1, padding: '12px 8px', borderRadius: '10px',
            border: `1px solid ${mode === 'clone' ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.06)'}`,
            background: mode === 'clone' ? 'rgba(139,92,246,0.1)' : 'transparent',
            color: mode === 'clone' ? 'var(--accent-1)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: mode === 'clone' ? 700 : 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.15s',
          }}>
            <Copy size={16} /> Generate from File
          </button>
        </div>

        {/* Control Panel Body */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {mode === 'generate' && !generatedFile && (
            <AIGeneratePanel onPreviewReady={(f) => setGeneratedFile(f)} hideTitle={true} />
          )}

          {mode === 'clone' && !generatedFile && !importData && (
             <SpreadsheetImporter onImportDone={(data) => {
                 setImportData(data);
                 setCloneTitle(data.filename.replace(/\.[^.]+$/, '') || 'My Cloned Planner');
             }} />
          )}

          {mode === 'clone' && !generatedFile && importData && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Palette size={20} style={{ color: 'var(--accent-1)' }} />
                 </div>
                 <div>
                   <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>Style & Clone</h3>
                   <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Customize your base template</span>
                 </div>
               </div>

               <div>
                 <label style={{ fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                   New Product Title (File Name)
                 </label>
                 <input 
                   type="text" 
                   value={cloneTitle} 
                   onChange={e => setCloneTitle(e.target.value)}
                   style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                 />
               </div>

               <div>
                 <label style={{ fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                   Select Color Theme
                 </label>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   {THEMES.map(theme => (
                     <button
                       key={theme.name}
                       onClick={() => setCloneTheme(theme.name)}
                       style={{
                         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                         padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                         border: cloneTheme === theme.name ? `1px solid rgb(${theme.header.join(',')})` : '1px solid var(--glass-border)',
                         background: cloneTheme === theme.name ? `rgba(${theme.header.join(',')}, 0.1)` : 'transparent',
                         transition: 'all 0.15s'
                       }}
                     >
                       <span style={{ fontSize: '0.85rem', fontWeight: cloneTheme === theme.name ? 600 : 400, color: cloneTheme === theme.name ? 'white' : 'var(--text-secondary)' }}>
                         {theme.name} Theme
                       </span>
                       <div style={{ display: 'flex', gap: '4px' }}>
                         <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: `rgb(${theme.accent.join(',')})`, border: '1px solid rgba(255,255,255,0.2)' }} />
                         <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: `rgb(${theme.header.join(',')})` }} />
                         <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: `rgb(${theme.dark.join(',')})` }} />
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               <button 
                 onClick={handleGenerateClone}
                 disabled={isCloning || !cloneTitle.trim()}
                 style={{ width: '100%', background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))', border: 'none', color: 'white', padding: '14px', borderRadius: '10px', cursor: isCloning ? 'not-allowed' : 'pointer', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(139,92,246,0.3)', marginTop: '10px', opacity: (isCloning || !cloneTitle.trim()) ? 0.7 : 1 }}
               >
                 {isCloning ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Wand2 size={18} />}
                 {isCloning ? 'Generating Template...' : 'Generate New Clone'}
               </button>
               
               <button 
                 onClick={() => setImportData(null)} 
                 style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
               >
                 Go back to upload
               </button>
             </div>
          )}

          {generatedFile && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '40px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle2 size={32} style={{ color: '#10b981' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.4rem' }}>Product Ready!</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', wordBreak: 'break-all' }}>
                {generatedFile.filename}
              </p>

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
                style={{ width: '100%', background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))', border: 'none', color: 'white', padding: '16px', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(139,92,246,0.3)', marginBottom: '12px' }}
              >
                <Download size={20} /> Download Package
              </button>
              
              <button 
                onClick={() => setGeneratedFile(null)} 
                style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
              >
                Create Another Product
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Product Preview / Mockup Area */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)',
        background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px'
      }}>
        {generatedFile ? (
          <div style={{ width: '100%', height: '100%', animation: 'fadeIn 0.5s ease-out' }}>
             <ExcelPreview blob={generatedFile.blob} filename={generatedFile.filename} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.6, maxWidth: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
               <Package size={48} style={{ color: 'var(--text-secondary)', opacity: 0.8 }} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Digital Product Factory</h3>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Select a template type on the left, configure your features, and the AI will assemble a professional bundle ready for sale.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
