/**
 * sheet-parser.ts
 * Parses uploaded .xlsx/.csv files or fetches from Google Sheets URL
 * Returns a summary of the detected sheets and their structure.
 */

export interface SheetSummary {
  name: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  sampleData: (string | number | null)[][];
}

export interface ImportResult {
  source: 'file' | 'google-sheets';
  filename: string;
  sheets: SheetSummary[];
  rawData?: Record<string, (string | number | null)[][]>;
}

/* ─── Excel / CSV file parser ─────────────────────────────────────────── */
export async function parseExcelFile(file: File): Promise<ImportResult> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const sheets: SheetSummary[] = [];
  const rawData: Record<string, (string | number | null)[][]> = {};

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

    if (rows.length === 0) {
      sheets.push({ name: sheetName, rowCount: 0, columnCount: 0, headers: [], sampleData: [] });
      rawData[sheetName] = [];
      continue;
    }

    const headers = (rows[0] || []).map((h: unknown) => (h != null ? String(h) : ''));
    const sampleData = rows.slice(1, 6) as (string | number | null)[][];
    const columnCount = Math.max(...rows.map((r: unknown[]) => r.length), 0);

    sheets.push({
      name: sheetName,
      rowCount: rows.length - 1,
      columnCount,
      headers,
      sampleData,
    });
    rawData[sheetName] = rows;
  }

  return {
    source: 'file',
    filename: file.name,
    sheets,
    rawData,
  };
}

/* ─── Google Sheets URL import ────────────────────────────────────────── */

/**
 * Extracts the Spreadsheet ID from various Google Sheets URL formats:
 *  - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
 *  - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/
 */
export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Fetches all sheets from a PUBLIC Google Sheet using the CSV export endpoint.
 * The spreadsheet must be shared as "Anyone with the link can view" or fully public.
 * We fetch sheet 0 (gid=0) by default, as fetching multiple gids requires the Sheets API.
 */
export async function importGoogleSheet(url: string): Promise<ImportResult> {
  const sheetId = extractSheetId(url);
  if (!sheetId) throw new Error('Invalid Google Sheets URL. Make sure the URL contains /spreadsheets/d/...');

  // Extract gid from URL if present
  const gidMatch = url.match(/[?&#]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : '0';

  // Use the CSV export endpoint — works for public sheets without API key
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  let csvText: string;
  try {
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} — Is the sheet publicly shared?`);
    csvText = await res.text();
  } catch (err) {
    throw new Error(
      `Could not fetch sheet data. Make sure the Google Sheet is shared as "Anyone with the link can view".\n\nError: ${(err as Error).message}`
    );
  }

  // Parse CSV manually
  const rows = parseCSV(csvText);
  const headers = rows[0]?.map(h => String(h ?? '')) ?? [];
  const sampleData = rows.slice(1, 6);

  return {
    source: 'google-sheets',
    filename: `Google Sheet (${sheetId.slice(0, 8)}…)`,
    sheets: [{
      name: 'Sheet1',
      rowCount: rows.length - 1,
      columnCount: headers.length,
      headers,
      sampleData,
    }],
    rawData: { Sheet1: rows },
  };
}

function parseCSV(text: string): (string | null)[][] {
  const lines = text.split('\n');
  return lines.map(line => {
    const cells: (string | null)[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(current === '' ? null : current);
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current === '' ? null : current);
    return cells;
  }).filter(row => row.some(c => c !== null));
}
