'use client';

import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Type, Square, Circle, Image as ImageIcon, Download } from 'lucide-react';

export default function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    // Initialize Fabric canvas
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: wrapperRef.current.clientWidth,
      height: wrapperRef.current.clientHeight,
      backgroundColor: '#ffffff',
    });

    setCanvas(initCanvas);

    // Handle window resize
    const handleResize = () => {
      if (wrapperRef.current && initCanvas) {
        initCanvas.setDimensions({
          width: wrapperRef.current.clientWidth,
          height: wrapperRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      initCanvas.dispose();
    };
  }, []);

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText('Double click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fill: '#171717',
      fontSize: 24,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addRect = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      fill: '#8b5cf6',
      width: 100,
      height: 100,
      rx: 8,
      ry: 8,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: 200,
      top: 200,
      fill: '#ec4899',
      radius: 50,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const handleExport = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2 // High-res export
    });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'etsy-digital-product.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', gap: '1rem' }}>
      {/* Toolbar */}
      <div className="glass-panel" style={{ width: '80px', padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <button onClick={addText} title="Add Text" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '12px', borderRadius: '8px' }}>
          <Type size={24} />
        </button>
        <button onClick={addRect} title="Add Rectangle" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '12px', borderRadius: '8px' }}>
          <Square size={24} />
        </button>
        <button onClick={addCircle} title="Add Circle" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '12px', borderRadius: '8px' }}>
          <Circle size={24} />
        </button>
        <div style={{ height: '1px', width: '40px', background: 'var(--glass-border)', margin: '10px 0' }} />
        <button onClick={() => alert('Image upload not implemented for MVP')} title="Add Image" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '12px', borderRadius: '8px' }}>
          <ImageIcon size={24} />
        </button>
        <div style={{ flexGrow: 1 }} />
        <button onClick={handleExport} title="Export PNG" style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', border: 'none', color: 'white', cursor: 'pointer', padding: '12px', borderRadius: '8px' }}>
          <Download size={24} />
        </button>
      </div>
      
      {/* Canvas Area */}
      <div ref={wrapperRef} className="glass-panel" style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
