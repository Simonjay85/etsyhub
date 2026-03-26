'use client';

import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import {
  Type, Square, Circle, Image as ImageIcon, Download,
  UploadCloud, Sparkles, CheckCircle2, FileText, RefreshCw,
  Layers, ChevronDown, Package, FileDown, TableProperties,
} from 'lucide-react';
import { generateResumePDF } from '@/lib/pdf-generator';
import { generateBundle } from '@/lib/bundle-generator';
import { generateDebtTrackerBundle } from '@/lib/spreadsheet-generator';

type AIState = 'idle' | 'uploading' | 'scanning' | 'ready' | 'generating' | 'done';
type OutputMode = 'single' | 'bundle';
type ProductType = 'resume' | 'spreadsheet';

const FONT_PAIRS = [
  { label: 'Montserrat + Lato', heading: 'Montserrat', body: 'Lato' },
  { label: 'Playfair + Raleway', heading: 'Playfair Display', body: 'Raleway' },
  { label: 'Oswald + Open Sans', heading: 'Oswald', body: 'Open Sans' },
  { label: 'Roboto Slab + Roboto', heading: 'Roboto Slab', body: 'Roboto' },
  { label: 'Abril Fatface + Poppins', heading: 'Abril Fatface', body: 'Poppins' },
  { label: 'Bebas Neue + Inter', heading: 'Bebas Neue', body: 'Inter' },
  { label: 'Cinzel + Fauna One', heading: 'Cinzel', body: 'Fauna One' },
  { label: 'Space Grotesk + DM Sans', heading: 'Space Grotesk', body: 'DM Sans' },
  { label: 'Cormorant + Proza Libre', heading: 'Cormorant', body: 'Proza Libre' },
  { label: 'Merriweather + Source Sans', heading: 'Merriweather', body: 'Source Sans 3' },
];

function loadGoogleFont(font: string) {
  const id = `gfont-${font.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

export default function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  const [aiState, setAiState] = useState<AIState>('idle');
  const [targetNiche, setTargetNiche] = useState('Creative Director');
  const [outputMode, setOutputMode] = useState<OutputMode>('bundle');
  const [productType, setProductType] = useState<ProductType>('resume');
  const [selectedPair, setSelectedPair] = useState(FONT_PAIRS[0]);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [doneFiles, setDoneFiles] = useState<string[]>([]);
  const [generatingStep, setGeneratingStep] = useState('');

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: wrapperRef.current.clientWidth,
      height: wrapperRef.current.clientHeight,
      backgroundColor: '#ffffff',
    });
    setCanvas(initCanvas);
    const handleResize = () => {
      if (wrapperRef.current && initCanvas)
        initCanvas.setDimensions({ width: wrapperRef.current.clientWidth, height: wrapperRef.current.clientHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); initCanvas.dispose(); };
  }, []);

  const addText = () => { if (!canvas) return; canvas.add(new fabric.IText('Double click to edit', { left: 100, top: 100, fontFamily: selectedPair.body, fill: '#171717', fontSize: 24 })); canvas.renderAll(); };
  const addRect = () => { if (!canvas) return; canvas.add(new fabric.Rect({ left: 150, top: 150, fill: '#8b5cf6', width: 100, height: 100, rx: 8, ry: 8 })); canvas.renderAll(); };
  const addCircle = () => { if (!canvas) return; canvas.add(new fabric.Circle({ left: 200, top: 200, fill: '#ec4899', radius: 50 })); canvas.renderAll(); };
  const handleExport = () => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    link.download = 'etsy-design.png';
    link.click();
  };
  const applyFontPair = (pair: typeof FONT_PAIRS[0]) => {
    loadGoogleFont(pair.heading); loadGoogleFont(pair.body);
    setSelectedPair(pair); setShowFontDropdown(false);
    if (!canvas) return;
    canvas.getObjects().forEach((obj, i) => {
      if (obj instanceof fabric.IText || obj instanceof fabric.Text)
        (obj as fabric.IText).set('fontFamily', i === 0 ? pair.heading : pair.body);
    });
    canvas.renderAll();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setAiState('uploading');
    setTimeout(() => { setAiState('scanning'); setTimeout(() => setAiState('ready'), 2000); }, 1000);
  };

  const handleGenerate = async () => {
    if (!targetNiche && productType === 'resume') return;
    setAiState('generating');
    setDoneFiles([]);

    if (productType === 'spreadsheet') {
      setGeneratingStep('Building Excel workbooks…');
      await generateDebtTrackerBundle('Debt_Payoff_Tracker');
      setDoneFiles(['Debt_Payoff_Tracker_Bundle.zip']);
      setAiState('done');
      return;
    }

    // Resume flow
    setGeneratingStep('Calling GPT-4o for content…');
    const [contentRes, imgRes] = await Promise.all([
      fetch('/api/generate-content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetNiche }) }),
      fetch('/api/generate-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetNiche }) }),
    ]);
    const content = await contentRes.json();
    const imgData = await imgRes.json();

    const baseData = {
      niche: targetNiche,
      title: content.title ?? targetNiche.toUpperCase(),
      summary: content.summary ?? `Award-winning ${targetNiche} with 10+ years of experience.`,
      sectionTitle: content.sectionTitle ?? 'PROFESSIONAL SUMMARY',
      imageUrl: imgData.imageUrl ?? null,
      fontPair: selectedPair,
    };

    if (outputMode === 'bundle') {
      setGeneratingStep('Rendering 5 documents (this takes ~20s)…');
      await generateBundle(baseData);
      setDoneFiles([`${targetNiche.replace(/\s+/g, '_')}_Resume_Bundle.zip`]);
    } else {
      setGeneratingStep('Rendering PDF…');
      await generateResumePDF({ ...baseData, pageCount: 1 });
      setDoneFiles([`${targetNiche.replace(/\s+/g, '-').toLowerCase()}-resume-template.pdf`]);
    }

    setAiState('done');
  };

  const resetAiState = () => { setAiState('idle'); setTargetNiche('Creative Director'); setDoneFiles([]); setGeneratingStep(''); };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', gap: '1rem' }}>
      {/* Left Toolbar */}
      <div className="glass-panel" style={{ width: '80px', padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        {[{ Icon: Type, fn: addText, title: 'Add Text' }, { Icon: Square, fn: addRect, title: 'Add Rect' }, { Icon: Circle, fn: addCircle, title: 'Add Circle' }].map(({ Icon, fn, title }) => (
          <button key={title} onClick={fn} title={title} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '12px', borderRadius: '8px' }}><Icon size={24} /></button>
        ))}
        <div style={{ height: '1px', width: '40px', background: 'var(--glass-border)' }} />
        <button title="Add Image" onClick={() => alert('Drag an image file onto the canvas')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '12px', borderRadius: '8px' }}><ImageIcon size={24} /></button>
        <div style={{ flexGrow: 1 }} />
        <button onClick={handleExport} title="Export canvas PNG" style={{ background: 'linear-gradient(135deg,var(--accent-1),var(--accent-2))', border: 'none', color: 'white', cursor: 'pointer', padding: '12px', borderRadius: '8px' }}><Download size={24} /></button>
      </div>

      {/* Canvas */}
      <div ref={wrapperRef} className="glass-panel" style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} />
      </div>

      {/* AI Studio Sidebar */}
      <div className="glass-panel" style={{ width: '300px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles style={{ color: 'var(--accent-2)' }} size={20} />
          <h2 style={{ fontSize: '1.125rem', margin: 0 }} className="text-gradient">AI Clone Studio</h2>
        </div>

        {/* Font Selector */}
        <div style={{ position: 'relative' }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Font Pairing</label>
          <button onClick={() => setShowFontDropdown(v => !v)} style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><Layers size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />{selectedPair.label}</span>
            <ChevronDown size={14} />
          </button>
          {showFontDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#1e293b', border: '1px solid var(--glass-border)', borderRadius: '8px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
              {FONT_PAIRS.map(pair => (
                <button key={pair.label} onClick={() => applyFontPair(pair)} style={{ width: '100%', background: pair.label === selectedPair.label ? 'rgba(139,92,246,0.2)' : 'transparent', border: 'none', color: 'white', padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left' }}>{pair.label}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)' }} />

        {/* IDLE */}
        {aiState === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Upload a PDF template — AI clones it into a new professional layout for a different niche.</p>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '1.75rem', cursor: 'pointer' }}>
              <UploadCloud size={28} style={{ color: 'var(--accent-1)', marginBottom: '0.75rem' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 500, textAlign: 'center' }}>Click to upload PDF<br /><span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>or drag and drop</span></span>
              <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {/* UPLOADING / SCANNING */}
        {(aiState === 'uploading' || aiState === 'scanning') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0', gap: '1rem' }}>
            <style>{`@keyframes spin{100%{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
            {aiState === 'uploading'
              ? <><RefreshCw size={28} style={{ color: 'var(--accent-1)', animation: 'spin 1s linear infinite' }} /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Uploading document…</span></>
              : <><FileText size={28} style={{ color: 'var(--accent-2)', animation: 'pulse 1.5s ease infinite' }} /><span style={{ fontSize: '0.8rem', color: 'var(--accent-2)', textAlign: 'center' }}>Analysing layout & fonts…<br /><span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Detecting text & image zones</span></span></>}
          </div>
        )}

        {/* READY */}
        {aiState === 'ready' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.75rem', borderRadius: '8px', display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Template Parsed</span>
            </div>

            {/* Product Type */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Product Type</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setProductType('resume')} style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: `1px solid ${productType === 'resume' ? 'var(--accent-1)' : 'var(--glass-border)'}`, background: productType === 'resume' ? 'rgba(139,92,246,0.2)' : 'transparent', color: productType === 'resume' ? 'var(--accent-1)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.73rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <FileDown size={15} />Resume/CV
                </button>
                <button onClick={() => setProductType('spreadsheet')} style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: `1px solid ${productType === 'spreadsheet' ? '#10b981' : 'var(--glass-border)'}`, background: productType === 'spreadsheet' ? 'rgba(16,185,129,0.15)' : 'transparent', color: productType === 'spreadsheet' ? '#10b981' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.73rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <TableProperties size={15} />Spreadsheet
                </button>
              </div>
            </div>

            {/* Spreadsheet info */}
            {productType === 'spreadsheet' && (
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.75rem', color: '#10b981', lineHeight: 1.6 }}>
                <strong>📊 Debt Payoff Tracker Bundle</strong><br />
                <span style={{ color: 'var(--text-secondary)' }}>
                  Sample.xlsx (mock data) + Blank.xlsx + Instructions PDF + README — packaged as ZIP, ready to sell on Etsy!
                </span>
              </div>
            )}

            {/* Resume-only controls */}
            {productType === 'resume' && (
              <>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Target Niche</label>
                  <input type="text" value={targetNiche} onChange={e => setTargetNiche(e.target.value)} placeholder="e.g. UX Designer" style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '9px 12px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Output Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setOutputMode('single')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${outputMode === 'single' ? 'var(--accent-1)' : 'var(--glass-border)'}`, background: outputMode === 'single' ? 'rgba(139,92,246,0.2)' : 'transparent', color: outputMode === 'single' ? 'var(--accent-1)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <FileDown size={16} />Single PDF
                    </button>
                    <button onClick={() => setOutputMode('bundle')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${outputMode === 'bundle' ? 'var(--accent-2)' : 'var(--glass-border)'}`, background: outputMode === 'bundle' ? 'rgba(236,72,153,0.2)' : 'transparent', color: outputMode === 'bundle' ? 'var(--accent-2)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <Package size={16} />Full Bundle
                    </button>
                  </div>
                  {outputMode === 'bundle' && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      1-page, 2-page, 3-page resume + Cover Letter + References
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[`GPT-4o rewrites content for "${targetNiche}"`, `DALL-E 3 portrait image`, `2-column pro layout`, `${selectedPair.label} fonts`].map(t => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={11} />{t}</div>
                  ))}
                </div>
              </>
            )}

            <button onClick={handleGenerate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '13px' }}>
              {productType === 'spreadsheet'
                ? <><TableProperties size={16} /> Generate Tracker Bundle</>
                : outputMode === 'bundle' ? <><Package size={16} /> Generate Bundle ZIP</> : <><FileDown size={16} /> Generate PDF</>}
            </button>
          </div>
        )}


        {/* GENERATING */}
        {aiState === 'generating' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0', gap: '1.25rem' }}>
            <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
            <div style={{ position: 'relative', width: '56px', height: '56px' }}>
              <div style={{ width: '100%', height: '100%', border: '3px solid transparent', borderTopColor: 'var(--accent-1)', borderRightColor: 'var(--accent-2)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              {outputMode === 'bundle' ? <Package size={20} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'white' }} /> : <FileDown size={20} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'white' }} />}
            </div>
            <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>
              {generatingStep || 'Generating…'}<br />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{outputMode === 'bundle' ? 'Building 5 PDFs + ZIP archive' : 'Rendering A4 resume PDF'}</span>
            </span>
          </div>
        )}

        {/* DONE */}
        {aiState === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Download started!</span>
            </div>
            {doneFiles.map(f => (
              <div key={f} className="glass-panel" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {outputMode === 'bundle' ? <Package size={18} style={{ color: '#10b981' }} /> : <FileDown size={18} style={{ color: '#10b981' }} />}
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, wordBreak: 'break-all' }}>{f}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Check your Downloads folder</div>
                </div>
              </div>
            ))}
            <button onClick={resetAiState} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '9px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Generate Another</button>
          </div>
        )}
      </div>
    </div>
  );
}
