'use client';

import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { FileSpreadsheet, AlertCircle } from 'lucide-react';

interface ExcelPreviewProps {
  blob: Blob;
  filename: string;
}

export default function ExcelPreview({ blob, filename }: ExcelPreviewProps) {
  const [sheets, setSheets] = useState<{name: string, html: string}[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPreview() {
      try {
        setLoading(true);
        setError('');
        let targetBuffer: ArrayBuffer;

        if (filename.endsWith('.zip')) {
          // Unzip and find the sample Excel file
          const zip = await JSZip.loadAsync(blob);
          const xlsxFiles = Object.keys(zip.files).filter(name => name.endsWith('.xlsx'));
          
          if (xlsxFiles.length === 0) {
            throw new Error('No Excel file found in the generated bundle.');
          }
          
          // Prefer 'Sample_' file for preview, otherwise take the first one
          const targetFile = xlsxFiles.find(name => name.includes('Sample_')) || xlsxFiles[0];
          targetBuffer = await zip.files[targetFile].async('arraybuffer');
        } else if (filename.endsWith('.xlsx')) {
          targetBuffer = await blob.arrayBuffer();
        } else {
          throw new Error('Preview not supported for this format.');
        }

        // Parse with XLSX
        const wb = XLSX.read(targetBuffer, { type: 'buffer' });
        
        const extractedSheets = wb.SheetNames.map(name => {
          const ws = wb.Sheets[name];
          // Use sheet_to_html to generate a clean table
          const html = XLSX.utils.sheet_to_html(ws, { editable: false });
          return { name, html };
        });

        setSheets(extractedSheets);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadPreview();
  }, [blob, filename]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Parsing Excel preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#f43f5e', background: 'rgba(244,63,94,0.1)', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.2)' }}>
        <AlertCircle size={24} style={{ marginBottom: '8px' }} />
        <p style={{ margin: 0 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* Tabs */}
      <div style={{ display: 'flex', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', overflowX: 'auto' }}>
        {sheets.map((sheet, idx) => (
          <button
            key={sheet.name}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '10px 16px',
              background: activeTab === idx ? 'white' : 'transparent',
              border: 'none', borderRight: '1px solid #cbd5e1',
              borderBottom: activeTab === idx ? '2px solid #10b981' : '2px solid transparent',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === idx ? 600 : 500,
              color: activeTab === idx ? '#0f172a' : '#64748b',
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
            }}
          >
            <FileSpreadsheet size={14} />
            {sheet.name}
          </button>
        ))}
      </div>

      {/* HTML Table Container */}
      <div style={{ flex: 1, overflow: 'auto', background: 'white', padding: '16px' }} className="excel-preview-container">
        {sheets.length > 0 && (
          <div 
            dangerouslySetInnerHTML={{ __html: sheets[activeTab].html }} 
            style={{ fontFamily: 'sans-serif', fontSize: '13px' }}
          />
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .excel-preview-container table {
          border-collapse: collapse;
          width: 100%;
        }
        .excel-preview-container td, .excel-preview-container th {
          border: 1px solid #e2e8f0;
          padding: 6px 10px;
          color: #334155;
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .excel-preview-container td:first-child[data-v=""] {
           display: none;
        }
        /* Make first row header-like if possible */
        .excel-preview-container tr:first-child td {
           background-color: #f8fafc;
           font-weight: 600;
           text-align: center;
        }
      `}} />
    </div>
  );
}
