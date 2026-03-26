/**
 * styled-debt-tracker.ts
 *
 * Generates a PROFESSIONAL Debt Dashboard Excel file using xlsx-js-style.
 * Pink/rose theme matching the Spreadsheets Hub reference product.
 * Features: KPI summary cards, colored table, Snowball/Avalanche/Custom tabs.
 */

/* ── Color Palette (Rose/Pink theme like reference image) ─────────── */
const COLORS = {
  accent1:    'C9A8A8', // dusty rose – headers
  accent2:    'E8D5D5', // light rose – KPI background
  accent3:    'F5EEEE', // blush – alternating rows
  dark:       '4A3030', // deep brown – header text
  white:      'FFFFFF',
  black:      '1A1A1A',
  gray:       '9E9E9E',
  lightGray:  'F2F2F2',
  green:      '4CAF50', // paid/good
  red:        'E57373', // overdue/bad
  yellow:     'F9A825', // warning/pending
  blue:       '5C8BB0', // accent for charts reference
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XStyle = Record<string, any>;

function headerStyle(bg = COLORS.accent1, fgColor = COLORS.white, bold = true, sz = 11, center = true): XStyle {
  return {
    font: { bold, color: { rgb: fgColor }, sz, name: 'Calibri' },
    fill: { fgColor: { rgb: bg }, patternType: 'solid' },
    alignment: { horizontal: center ? 'center' : 'left', vertical: 'center', wrapText: true },
    border: {
      top:    { style: 'thin', color: { rgb: COLORS.accent1 } },
      bottom: { style: 'thin', color: { rgb: COLORS.accent1 } },
      left:   { style: 'thin', color: { rgb: COLORS.accent1 } },
      right:  { style: 'thin', color: { rgb: COLORS.accent1 } },
    },
  };
}

function kpiStyle(bg = COLORS.accent2): XStyle {
  return {
    font: { bold: true, color: { rgb: COLORS.dark }, sz: 14, name: 'Calibri' },
    fill: { fgColor: { rgb: bg }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { top: { style: 'medium', color: { rgb: COLORS.accent1 } }, bottom: { style: 'medium', color: { rgb: COLORS.accent1 } }, left: { style: 'medium', color: { rgb: COLORS.accent1 } }, right: { style: 'medium', color: { rgb: COLORS.accent1 } } },
  };
}

function kpiLabelStyle(): XStyle {
  return {
    font: { italic: true, color: { rgb: COLORS.gray }, sz: 9, name: 'Calibri' },
    fill: { fgColor: { rgb: COLORS.accent2 }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { bottom: { style: 'medium', color: { rgb: COLORS.accent1 } }, left: { style: 'medium', color: { rgb: COLORS.accent1 } }, right: { style: 'medium', color: { rgb: COLORS.accent1 } } },
  };
}

function rowStyle(even: boolean): XStyle {
  const bg = even ? COLORS.accent3 : COLORS.white;
  return {
    font: { sz: 10, name: 'Calibri', color: { rgb: COLORS.black } },
    fill: { fgColor: { rgb: bg }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { top: { style: 'thin', color: { rgb: 'E0D0D0' } }, bottom: { style: 'thin', color: { rgb: 'E0D0D0' } }, left: { style: 'thin', color: { rgb: 'E0D0D0' } }, right: { style: 'thin', color: { rgb: 'E0D0D0' } } },
  };
}

function titleStyle(): XStyle {
  return {
    font: { bold: true, sz: 18, name: 'Calibri', color: { rgb: COLORS.dark } },
    fill: { fgColor: { rgb: COLORS.white }, patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center' },
  };
}

function subTitleStyle(): XStyle {
  return {
    font: { italic: true, sz: 10, name: 'Calibri', color: { rgb: COLORS.gray } },
    fill: { fgColor: { rgb: COLORS.white }, patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center' },
  };
}

function sectionHeaderStyle(): XStyle {
  return {
    font: { bold: true, sz: 10, name: 'Calibri', color: { rgb: COLORS.white } },
    fill: { fgColor: { rgb: 'B08080' }, patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center' },
  };
}

/* ── Cell setter helper ───────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setCell(ws: any, addr: string, value: string | number | null, style: XStyle, fmt?: string) {
  ws[addr] = { v: value ?? '', t: typeof value === 'number' ? 'n' : 's', s: style };
  if (fmt && ws[addr]) ws[addr].z = fmt;
}

interface Debt {
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
  category: string;
}

const SAMPLE_DEBTS: Debt[] = [
  { name: 'Credit Card A',  balance: 4800,  rate: 22.99, minPayment: 120, category: 'Credit Card' },
  { name: 'Credit Card B',  balance: 2200,  rate: 18.99, minPayment: 55,  category: 'Credit Card' },
  { name: 'Car Loan',       balance: 11500, rate: 6.9,   minPayment: 240, category: 'Auto' },
  { name: 'Student Loan',   balance: 18000, rate: 5.5,   minPayment: 180, category: 'Student' },
  { name: 'Medical Bill',   balance: 950,   rate: 0,     minPayment: 50,  category: 'Medical' },
  { name: 'Personal Loan',  balance: 3500,  rate: 12.5,  minPayment: 85,  category: 'Personal' },
];

/* ── Dashboard sheet ─────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildStyledDashboard(XLSX: any, debts: Debt[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin     = debts.reduce((s, d) => s + d.minPayment, 0);
  const totalInterest = debts.reduce((s, d) => s + (d.balance * (d.rate / 100)), 0);

  // Title row
  setCell(ws, 'A1', 'Debt Dashboard', titleStyle());
  setCell(ws, 'A2', 'TRACK UP TO 50 DEBTS OVER 50 YEARS', subTitleStyle());

  // KPI row labels (row 4)
  setCell(ws, 'A4', 'TOTAL MINIMUM PAYMENTS', kpiLabelStyle());
  setCell(ws, 'C4', 'TOTAL REMAINING', kpiLabelStyle());
  setCell(ws, 'E4', 'TOTAL INTEREST', kpiLabelStyle());

  // KPI values (row 5)
  setCell(ws, 'A5', debts.length ? totalMin : 0, kpiStyle(), '"$"#,##0.00');
  setCell(ws, 'C5', debts.length ? totalBalance : 0, kpiStyle(), '"$"#,##0.00');
  setCell(ws, 'E5', debts.length ? totalInterest : 0, kpiStyle(), '"$"#,##0.00');

  // Separator
  setCell(ws, 'A7', 'OVERALL DEBT BREAKDOWN', sectionHeaderStyle());
  setCell(ws, 'D7', 'DEBT MANAGEMENT NOTES', sectionHeaderStyle());

  // Chart note (charts must be added in Excel)
  const noteStyle: XStyle = {
    font: { italic: true, sz: 9, color: { rgb: COLORS.gray }, name: 'Calibri' },
    fill: { fgColor: { rgb: COLORS.lightGray }, patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  };
  setCell(ws, 'A8',  '[ Donut Chart: Select columns A–B in the Debt List below → Insert → Doughnut Chart ]', noteStyle);
  setCell(ws, 'D8',  'Extra Monthly Payment Goal: $', noteStyle);
  setCell(ws, 'D9',  'Target Debt-Free Year: ', noteStyle);
  setCell(ws, 'D10', 'Priority Strategy: Snowball / Avalanche / Custom', noteStyle);

  // Debt list header (row 13)
  const headers = ['#', 'Debt Name', 'Balance ($)', 'Interest Rate', 'Min. Payment ($)', 'Category', '% of Total', 'Est. Annual Interest'];
  headers.forEach((h, i) => {
    const col = String.fromCharCode(65 + i);
    setCell(ws, `${col}13`, h, headerStyle());
  });

  // Debt list rows
  debts.forEach((d, i) => {
    const r = i + 14;
    const even = i % 2 === 0;
    const pct = totalBalance ? d.balance / totalBalance : 0;
    const estInt = d.balance * (d.rate / 100);
    [i + 1, d.name, d.balance, d.rate / 100, d.minPayment, d.category, pct, estInt].forEach((v, ci) => {
      const col = String.fromCharCode(65 + ci);
      const fmt = ci === 2 || ci === 4 || ci === 7 ? '"$"#,##0.00' :
                  ci === 3 || ci === 6 ? '0.00%' : undefined;
      setCell(ws, `${col}${r}`, v as string | number, rowStyle(even), fmt);
    });
  });

  // Empty rows up to 50 debts
  for (let i = debts.length; i < 50; i++) {
    const r = i + 14;
    const even = i % 2 === 0;
    [i + 1, '', '', '', '', '', '', ''].forEach((v, ci) => {
      const col = String.fromCharCode(65 + ci);
      setCell(ws, `${col}${r}`, v as string | number, rowStyle(even));
    });
  }

  // Totals row
  const totalRow = 64;
  const totStyle = headerStyle(COLORS.accent1, COLORS.white);
  setCell(ws, `A${totalRow}`, 'TOTALS', totStyle);
  setCell(ws, `B${totalRow}`, '', totStyle);
  setCell(ws, `C${totalRow}`, totalBalance, totStyle, '"$"#,##0.00');
  setCell(ws, `D${totalRow}`, '', totStyle);
  setCell(ws, `E${totalRow}`, totalMin, totStyle, '"$"#,##0.00');
  setCell(ws, `F${totalRow}`, '', totStyle);
  setCell(ws, `G${totalRow}`, 1, totStyle, '0.00%');
  setCell(ws, `H${totalRow}`, totalInterest, totStyle, '"$"#,##0.00');

  ws['!ref'] = `A1:H${totalRow}`;
  ws['!cols'] = [
    { wch: 4 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 18 },
  ];
  ws['!rows'] = [{ hpt: 28 }, { hpt: 14 }, {}, {}, { hpt: 32 }, {}, { hpt: 18 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // subtitle
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }, // KPI label 1
    { s: { r: 3, c: 2 }, e: { r: 3, c: 3 } }, // KPI label 2
    { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } }, // KPI label 3
    { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, // KPI value 1
    { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } }, // KPI value 2
    { s: { r: 4, c: 4 }, e: { r: 4, c: 5 } }, // KPI value 3
    { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } }, // section header left
    { s: { r: 6, c: 3 }, e: { r: 6, c: 7 } }, // section header right
    { s: { r: 7, c: 0 }, e: { r: 7, c: 2 } }, // chart note left
    { s: { r: 7, c: 3 }, e: { r: 7, c: 7 } }, // notes right
    { s: { r: 8, c: 3 }, e: { r: 8, c: 7 } },
    { s: { r: 9, c: 3 }, e: { r: 9, c: 7 } },
  ];

  return ws;
}

/* ── Debt Setup sheet ────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildStyledDebtSetup(XLSX: any, debts: Debt[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  setCell(ws, 'A1', 'DEBT SETUP', titleStyle());
  setCell(ws, 'A2', 'Enter up to 50 debts — name, balance, interest rate, minimum payment', subTitleStyle());

  const headers = ['#', 'Debt Name', 'Balance ($)', 'Annual Rate (%)', 'Min. Payment ($)', 'Category', 'Notes'];
  headers.forEach((h, i) => setCell(ws, `${String.fromCharCode(65 + i)}4`, h, headerStyle()));

  const total = debts.length > 0 ? debts : [];
  for (let i = 0; i < 50; i++) {
    const d = total[i];
    const r = i + 5;
    const even = i % 2 === 0;
    const st = rowStyle(even);
    setCell(ws, `A${r}`, i + 1, st);
    setCell(ws, `B${r}`, d?.name ?? '', st);
    setCell(ws, `C${r}`, d?.balance ?? '', st, d ? '"$"#,##0.00' : undefined);
    setCell(ws, `D${r}`, d ? d.rate / 100 : '', st, d ? '0.00%' : undefined);
    setCell(ws, `E${r}`, d?.minPayment ?? '', st, d ? '"$"#,##0.00' : undefined);
    setCell(ws, `F${r}`, d?.category ?? '', st);
    setCell(ws, `G${r}`, '', st);
  }

  ws['!ref'] = 'A1:G55';
  ws['!cols'] = [{ wch: 4 }, { wch: 24 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 32 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ];
  return ws;
}

/* ── Payoff Schedule ─────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildStyledSchedule(XLSX: any, debts: Debt[], method: 'snowball' | 'avalanche' | 'custom', extraPayment = 200) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  const sorted = [...debts].sort((a, b) =>
    method === 'snowball' ? a.balance - b.balance :
    method === 'avalanche' ? b.rate - a.rate :
    0
  );
  const methodNames: Record<string, string> = {
    snowball: 'SNOWBALL METHOD — Smallest Balance First',
    avalanche: 'AVALANCHE METHOD — Highest Interest First',
    custom: 'CUSTOM ORDER — Your Personal Strategy',
  };

  setCell(ws, 'A1', methodNames[method], titleStyle());
  setCell(ws, 'A2', method === 'snowball'
    ? 'Pay minimums on all debts, then apply all extra money to the SMALLEST balance first.'
    : method === 'avalanche'
    ? 'Pay minimums on all debts, then apply all extra money to the HIGHEST interest rate first.'
    : 'Arrange debts in any order — maximum flexibility for your repayment plan.', subTitleStyle());

  // KPI
  setCell(ws, 'A4', 'EXTRA MONTHLY PAYMENT', kpiLabelStyle());
  setCell(ws, 'C4', 'TOTAL DEBT', kpiLabelStyle());
  setCell(ws, 'E4', 'EST. PAYOFF MONTHS', kpiLabelStyle());
  setCell(ws, 'A5', extraPayment, kpiStyle(), '"$"#,##0.00');
  setCell(ws, 'C5', debts.reduce((s, d) => s + d.balance, 0), kpiStyle(), '"$"#,##0.00');

  // Simulate payoff
  const balances = sorted.map(d => d.balance);
  const schedule: (string | number)[][] = [];
  let month = 0;
  while (balances.some(b => b > 0.01) && month < 600) {
    month++;
    let extra = extraPayment;
    const row: (string | number)[] = [month];
    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] <= 0) { row.push(0, 0); continue; }
      const interest = (balances[i] * (sorted[i].rate / 100)) / 12;
      const pay = Math.min(sorted[i].minPayment, balances[i] + interest);
      balances[i] = Math.max(0, balances[i] + interest - pay);
      row.push(Number(pay.toFixed(2)), Number(balances[i].toFixed(2)));
    }
    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] > 0 && extra > 0) {
        const applied = Math.min(extra, balances[i]);
        balances[i] = Math.max(0, balances[i] - applied);
        extra -= applied;
        row[i * 2 + 2] = Number(((row[i * 2 + 2] as number) + applied).toFixed(2));
        row[i * 2 + 3] = Number(balances[i].toFixed(2));
        break;
      }
    }
    schedule.push(row);
  }

  setCell(ws, 'E5', month, kpiStyle());

  // Headers
  const schedHeaders = ['Month', ...sorted.flatMap(d => [`Pay: ${d.name}`, `Bal: ${d.name}`])];
  schedHeaders.forEach((h, i) => setCell(ws, `${String.fromCharCode(65 + i)}7`, h, headerStyle()));

  // Schedule rows
  schedule.slice(0, 120).forEach((row, ri) => {
    const r = ri + 8;
    const even = ri % 2 === 0;
    row.forEach((v, ci) => {
      const fmt = ci > 0 ? '"$"#,##0.00' : undefined;
      setCell(ws, `${String.fromCharCode(65 + ci)}${r}`, v, rowStyle(even), fmt);
    });
  });

  ws['!ref'] = `A1:${String.fromCharCode(65 + schedHeaders.length - 1)}${schedule.length + 8}`;
  ws['!cols'] = [{ wch: 8 }, ...sorted.flatMap(() => [{ wch: 16 }, { wch: 16 }])];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: schedHeaders.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: schedHeaders.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 3 } },
    { s: { r: 3, c: 4 }, e: { r: 3, c: schedHeaders.length - 1 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
    { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } },
    { s: { r: 4, c: 4 }, e: { r: 4, c: schedHeaders.length - 1 } },
  ];
  return ws;
}

/* ── Quick Start ─────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildQuickStart(XLSX: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  setCell(ws, 'A1', 'QUICK START GUIDE', titleStyle());
  setCell(ws, 'A2', 'You are 4 steps away from your debt-free plan', subTitleStyle());

  const steps = [
    ['STEP 1', 'Go to the "Debt Setup" tab', 'Enter each debt: name, balance, interest rate, and minimum payment. You can track up to 50 debts.'],
    ['STEP 2', 'Choose your strategy', 'Pick one of 3 tabs:\n• Snowball — smallest balance first (psychological wins)\n• Avalanche — highest interest first (saves the most money)\n• Custom — arrange debts in your own preferred order'],
    ['STEP 3', 'Set your extra payment', 'On the Dashboard, set how much extra you can pay each month. Watch your payoff date shrink!'],
    ['STEP 4', 'Track monthly progress', 'Log payments and reflections in the Monthly Journal tab. Celebrate every milestone!'],
  ];

  let r = 4;
  for (const [num, title, desc] of steps) {
    setCell(ws, `A${r}`, num, headerStyle(COLORS.accent1, COLORS.white, true, 13));
    setCell(ws, `B${r}`, title, headerStyle('F0E8E8', COLORS.dark, true, 11, false));
    r++;
    setCell(ws, `A${r}`, '', rowStyle(false));
    setCell(ws, `B${r}`, desc, {
      font: { sz: 10, name: 'Calibri', color: { rgb: COLORS.black } },
      fill: { fgColor: { rgb: COLORS.white }, patternType: 'solid' },
      alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    });
    r += 2;
  }

  setCell(ws, 'A20', 'WORKS WITH ANY CURRENCY', sectionHeaderStyle());
  setCell(ws, 'A21', 'USD, EUR, GBP, CAD, AUD, VND and more — no conversion needed!', subTitleStyle());
  setCell(ws, 'A23', 'Compatible with Google Sheets & Microsoft Excel on Mac, PC, iPhone, Android.', subTitleStyle());

  ws['!ref'] = 'A1:B23';
  ws['!cols'] = [{ wch: 10 }, { wch: 60 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
  ];
  return ws;
}

/* ── Monthly Journal ─────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildStyledJournal(XLSX: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  setCell(ws, 'A1', 'MONTHLY PROGRESS JOURNAL', titleStyle());
  setCell(ws, 'A2', 'Record your payments, milestones, and reflections each month', subTitleStyle());

  const cols = ['Month', 'Year', 'Total Paid ($)', 'Remaining ($)', 'Extra Paid ($)', 'Debts Cleared', 'Notes & Reflections', 'Mood', 'On Track?'];
  cols.forEach((h, i) => setCell(ws, `${String.fromCharCode(65 + i)}4`, h, headerStyle()));

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let ri = 0;
  for (const year of [2026, 2027, 2028]) {
    for (const m of months) {
      const r = ri + 5;
      const even = ri % 2 === 0;
      const sample = ri < 2 && year === 2026;
      setCell(ws, `A${r}`, m, rowStyle(even));
      setCell(ws, `B${r}`, year, rowStyle(even));
      setCell(ws, `C${r}`, sample ? [2100, 2150][ri] : '', rowStyle(even), sample ? '"$"#,##0.00' : undefined);
      setCell(ws, `D${r}`, sample ? [38400, 36400][ri] : '', rowStyle(even), sample ? '"$"#,##0.00' : undefined);
      setCell(ws, `E${r}`, sample ? 200 : '', rowStyle(even), sample ? '"$"#,##0.00' : undefined);
      setCell(ws, `F${r}`, 0, rowStyle(even));
      setCell(ws, `G${r}`, sample ? ['Great start!', 'Staying on track'][ri] : '', rowStyle(even));
      setCell(ws, `H${r}`, '😊', rowStyle(even));
      setCell(ws, `I${r}`, '✅', rowStyle(even));
      ri++;
    }
  }

  ws['!ref'] = `A1:I${ri + 5}`;
  ws['!cols'] = [{ wch: 12 }, { wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 40 }, { wch: 8 }, { wch: 10 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
  ];
  return ws;
}

/* ── Main export ─────────────────────────────────────────────────── */
export async function generateStyledDebtTracker(debts: Debt[] = SAMPLE_DEBTS, productName = 'Debt_Dashboard'): Promise<void> {
  // Use xlsx-js-style instead of xlsx for full cell styling support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSXStyle: any = await import('xlsx-js-style');
  const JSZip = (await import('jszip')).default;
  const { jsPDF } = await import('jspdf');

  const slug = productName.replace(/\s+/g, '_');

  const buildWb = (isBlank: boolean) => {
    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, buildQuickStart(XLSXStyle), 'Quick Start');
    XLSXStyle.utils.book_append_sheet(wb, buildStyledDashboard(XLSXStyle, isBlank ? [] : debts), 'Dashboard');
    XLSXStyle.utils.book_append_sheet(wb, buildStyledDebtSetup(XLSXStyle, isBlank ? [] : debts), 'Debt Setup');
    XLSXStyle.utils.book_append_sheet(wb, buildStyledSchedule(XLSXStyle, isBlank ? [] : debts, 'snowball'), 'Snowball');
    XLSXStyle.utils.book_append_sheet(wb, buildStyledSchedule(XLSXStyle, isBlank ? [] : debts, 'avalanche'), 'Avalanche');
    XLSXStyle.utils.book_append_sheet(wb, buildStyledSchedule(XLSXStyle, isBlank ? [] : debts, 'custom'), 'Custom');
    XLSXStyle.utils.book_append_sheet(wb, buildStyledJournal(XLSXStyle), 'Monthly Journal');
    return XLSXStyle.write(wb, { type: 'array', bookType: 'xlsx' });
  };

  const sampleBuf = buildWb(false);
  const blankBuf  = buildWb(true);

  // Instructions PDF
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFillColor(201, 168, 168); doc.rect(0, 0, W, 48, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setTextColor(255, 255, 255);
  doc.text('Debt Dashboard', W / 2, 24, { align: 'center' });
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(245, 238, 238);
  doc.text('TRACK UP TO 50 DEBTS OVER 50 YEARS  |  GOOGLE SHEETS & MICROSOFT EXCEL', W / 2, 38, { align: 'center' });

  let y = 60;
  const features = [
    ['Track Up to 50 Debts Over 50 Years', 'Perfect for managing multiple debts with a long-term view.'],
    ['3 Repayment Strategies', 'Snowball, Avalanche, or Custom — pick the method that fits your goals.'],
    ['Works with Any Currency', 'USD, EUR, GBP, AUD, VND — no conversion needed.'],
    ['Automatic Calculations', 'Save time with instant updates as you input payments.'],
    ['Monthly Journal', 'Stay organized with a clear summary and space for notes.'],
    ['Monitor Interest & Debt-Free Dates', 'See how much interest you save with each strategy.'],
  ];
  doc.setFontSize(10); doc.setTextColor(74, 48, 48);
  for (const [title, desc] of features) {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(201, 128, 128); doc.text(`✓  ${title}`, 18, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(74, 48, 48); doc.text(`    ${desc}`, 18, y + 5);
    y += 14;
  }

  doc.setFillColor(201, 168, 168); doc.rect(0, H - 12, W, 12, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text('Thank you for your purchase!  Start your debt-free journey today!', W / 2, H - 5, { align: 'center' });
  const pdfBuf = doc.output('arraybuffer');

  // ZIP
  const zip = new JSZip();
  const folder = zip.folder(slug)!;
  folder.file(`Sample_${slug}.xlsx`, sampleBuf);
  folder.file(`Blank_${slug}.xlsx`, blankBuf);
  folder.file('Instructions.pdf', pdfBuf);
  folder.file('README.txt', [
    `Debt Dashboard — Digital Download`,
    '='.repeat(40),
    '',
    'FILES:',
    `  Sample_${slug}.xlsx   — pre-filled with 6 example debts`,
    `  Blank_${slug}.xlsx    — empty template ready to fill`,
    '  Instructions.pdf      — feature overview',
    '',
    '7 TABS: Quick Start | Dashboard | Debt Setup | Snowball | Avalanche | Custom | Monthly Journal',
    '',
    'Open .xlsx in Excel OR upload to Google Drive > Open with Google Sheets.',
    'Works on Mac, PC, iPhone, and Android.',
    '',
    'IMPORTANT: This is a DIGITAL download. No physical item will be shipped.',
  ].join('\n'));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${slug}_Bundle.zip`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
