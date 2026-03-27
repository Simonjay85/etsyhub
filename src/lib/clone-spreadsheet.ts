/**
 * clone-spreadsheet.ts
 *
 * Takes a parsed ImportResult (from Excel upload or Google Sheets import)
 * and generates a NEW styled Excel workbook as a downloadable ZIP.
 * Produces:
 *   • Sample_<name>.xlsx  — cloned data with new theme applied
 *   • Blank_<name>.xlsx   — same headers/structure, rows cleared
 *   • Instructions.pdf    — setup guide
 */

import type { ImportResult } from './sheet-parser';

export const THEMES = [
  { name: 'Indigo', header: [79, 70, 229], accent: [238, 242, 255], dark: [49, 46, 129] },
  { name: 'Teal', header: [13, 148, 136], accent: [240, 253, 250], dark: [19, 78, 74] },
  { name: 'Rose', header: [225, 29, 72], accent: [255, 241, 242], dark: [136, 19, 55] },
  { name: 'Amber', header: [217, 119, 6], accent: [255, 251, 235], dark: [120, 53, 15] },
  { name: 'Violet', header: [124, 58, 237], accent: [245, 243, 255], dark: [76, 29, 149] },
];

function pickTheme(name: string, overrideName?: string) {
  if (overrideName) {
    const match = THEMES.find(t => t.name.toLowerCase() === overrideName.toLowerCase());
    if (match) return match;
  }
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return THEMES[hash % THEMES.length];
}

function toHex(rgb: number[]): string {
  return rgb.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildClonedSheet(XLSX: any, rows: (string | number | null)[][], theme: ReturnType<typeof pickTheme>, includeData: boolean) {
  if (!rows || rows.length === 0) return XLSX.utils.aoa_to_sheet([[]]);

  const headers = rows[0] ?? [];
  const dataRows = includeData ? rows.slice(1) : [];

  // Add header with empty data rows if blank
  const out = [headers, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(out);

  // Column widths — auto-size based on header length
  ws['!cols'] = headers.map((h: unknown) => ({ wch: Math.max(String(h ?? '').length + 4, 12) }));

  // Apply header row styling (row index 0)
  headers.forEach((_: unknown, ci: number) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c: ci });
    if (!ws[addr]) return;
    ws[addr].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill: { fgColor: { rgb: toHex(theme.header) }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        bottom: { style: 'medium', color: { rgb: toHex(theme.dark) } },
      },
    };
  });

  // Apply alternating row styling for data rows
  for (let ri = 1; ri <= dataRows.length; ri++) {
    const bg = ri % 2 === 0 ? toHex(theme.accent) : 'FFFFFF';
    headers.forEach((_: unknown, ci: number) => {
      const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
      if (!ws[addr]) return;
      ws[addr].s = {
        font: { sz: 10 },
        fill: { fgColor: { rgb: bg }, patternType: 'solid' },
        border: {
          top: { style: 'thin', color: { rgb: 'E5E7EB' } },
          bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
          left: { style: 'thin', color: { rgb: 'E5E7EB' } },
          right: { style: 'thin', color: { rgb: 'E5E7EB' } },
        },
        alignment: { vertical: 'center' },
      };
    });
  }

  // Freeze top row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  return ws;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildInstructionsPdf(jsPDF: any, filename: string, sheets: ImportResult['sheets'], theme: ReturnType<typeof pickTheme>): ArrayBuffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Header band
  doc.setFillColor(...theme.header);
  doc.rect(0, 0, W, 42, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(filename, W / 2, 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(200, 210, 255);
  doc.text(`${sheets.length} sheet${sheets.length > 1 ? 's' : ''} · Styled with ${theme.name} theme`, W / 2, 34, { align: 'center' });

  let y = 54;

  // Sheets overview
  doc.setFillColor(...theme.accent);
  doc.rect(14, y - 4, W - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...theme.header);
  doc.text('SHEETS INCLUDED', 18, y + 1);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  for (const sh of sheets) {
    doc.text(`• ${sh.name}  —  ${sh.rowCount} rows, ${sh.columnCount} columns`, 18, y);
    y += 7;
  }

  y += 6;

  // How to use
  doc.setFillColor(...theme.accent);
  doc.rect(14, y - 4, W - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...theme.header);
  doc.text('HOW TO USE', 18, y + 1);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  const steps = [
    '1. Open the Sample .xlsx to see pre-filled example data.',
    '2. Open the Blank .xlsx to enter your own data.',
    '3. To use with Google Sheets: upload to Google Drive → Open with Google Sheets.',
    '4. The header row is frozen — scroll down to add more data rows freely.',
    '5. Each tab uses alternating row colors for easy reading.',
  ];
  for (const step of steps) {
    doc.text(step, 18, y);
    y += 7;
  }

  // Footer
  doc.setFillColor(...theme.header);
  doc.rect(0, H - 10, W, 10, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Created with Etsy Creator Studio · Thank you for your purchase!', W / 2, H - 4, { align: 'center' });

  return doc.output('arraybuffer');
}

export async function cloneSpreadsheet(imported: ImportResult, productName?: string, themeName?: string): Promise<{ blob: Blob, filename: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX: any = await import('xlsx');
  const JSZip = (await import('jszip')).default;
  const { jsPDF } = await import('jspdf');

  const name = productName || imported.filename.replace(/\.[^.]+$/, '') || 'Spreadsheet';
  const slug = name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
  const theme = pickTheme(name, themeName);

  // Build SAMPLE workbook (data included)
  const sampleWb = XLSX.utils.book_new();
  for (const sheet of imported.sheets) {
    const rows = imported.rawData?.[sheet.name] ?? [sheet.headers, ...sheet.sampleData];
    const ws = buildClonedSheet(XLSX, rows, theme, true);
    XLSX.utils.book_append_sheet(sampleWb, ws, sheet.name.slice(0, 31)); // Excel tab name limit
  }
  const sampleBuf: ArrayBuffer = XLSX.write(sampleWb, { type: 'array', bookType: 'xlsx' });

  // Build BLANK workbook (headers only, no data rows)
  const blankWb = XLSX.utils.book_new();
  for (const sheet of imported.sheets) {
    const headerRow = [sheet.headers];
    const ws = buildClonedSheet(XLSX, headerRow, theme, false);
    XLSX.utils.book_append_sheet(blankWb, ws, sheet.name.slice(0, 31));
  }
  const blankBuf: ArrayBuffer = XLSX.write(blankWb, { type: 'array', bookType: 'xlsx' });

  // Build PDF guide
  const pdfBuf = buildInstructionsPdf(jsPDF, name, imported.sheets, theme);

  // Build ZIP
  const zip = new JSZip();
  const folder = zip.folder(slug)!;
  folder.file(`Sample_${slug}.xlsx`, sampleBuf);
  folder.file(`Blank_${slug}.xlsx`, blankBuf);
  folder.file('Instructions.pdf', pdfBuf);
  folder.file('README.txt', [
    `${name} — Digital Download`,
    '='.repeat(40),
    '',
    'FILES:',
    `  Sample_${slug}.xlsx  — pre-filled with original data`,
    `  Blank_${slug}.xlsx   — clean template (headers only)`,
    '  Instructions.pdf    — setup guide',
    '',
    'GOOGLE SHEETS: Upload .xlsx to Google Drive → right-click → Open with Google Sheets',
    '',
    'This is a digital download. No physical item will be shipped.',
  ].join('\n'));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  return { blob, filename: `${slug}_Bundle.zip` };
}
