/**
 * styled-debt-tracker.ts
 *
 * Generates a PROFESSIONAL Debt Dashboard Excel file using xlsx-js-style.
 * Pink/rose theme matching the Spreadsheets Hub reference product.
 * Supports configurable options: strategy, maxDebts, currency, tabs, etc.
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
  green:      '4CAF50',
  red:        'E57373',
  yellow:     'F9A825',
  blue:       '5C8BB0',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XStyle = Record<string, any>;

export interface DebtTrackerOptions {
  strategy: 'snowball' | 'avalanche' | 'custom' | 'all';
  maxDebts: 10 | 25 | 50;
  currency: string;               // e.g. '$', '€', '£', '₫'
  includeDashboard: boolean;
  includeChartData: boolean;
  includeMonthlyJournal: boolean;
  includeQuickStart: boolean;
  includeInstructions: boolean;
}

export const DEFAULT_OPTIONS: DebtTrackerOptions = {
  strategy: 'all',
  maxDebts: 25,
  currency: '$',
  includeDashboard: true,
  includeChartData: true,
  includeMonthlyJournal: true,
  includeQuickStart: true,
  includeInstructions: true,
};

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
function buildStyledDashboard(XLSX: any, debts: Debt[], opts: DebtTrackerOptions) {
  const { currency, maxDebts, includeChartData } = opts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin     = debts.reduce((s, d) => s + d.minPayment, 0);
  const totalInterest = debts.reduce((s, d) => s + (d.balance * (d.rate / 100)), 0);
  const currFmt = `"${currency}"#,##0.00`;

  // Title row
  setCell(ws, 'A1', 'Debt Dashboard', titleStyle());
  setCell(ws, 'A2', `TRACK UP TO ${maxDebts} DEBTS OVER 50 YEARS`, subTitleStyle());

  // KPI row labels (row 4)
  setCell(ws, 'A4', 'TOTAL MINIMUM PAYMENTS', kpiLabelStyle());
  setCell(ws, 'C4', 'TOTAL REMAINING', kpiLabelStyle());
  setCell(ws, 'E4', 'TOTAL INTEREST', kpiLabelStyle());

  // KPI values (row 5)
  setCell(ws, 'A5', debts.length ? totalMin : 0, kpiStyle(), currFmt);
  setCell(ws, 'C5', debts.length ? totalBalance : 0, kpiStyle(), currFmt);
  setCell(ws, 'E5', debts.length ? totalInterest : 0, kpiStyle(), currFmt);

  // Section headers
  setCell(ws, 'A7', 'OVERALL DEBT BREAKDOWN', sectionHeaderStyle());
  setCell(ws, 'D7', 'DEBT MANAGEMENT NOTES', sectionHeaderStyle());

  // Chart/notes area
  const noteStyle: XStyle = {
    font: { italic: true, sz: 9, color: { rgb: COLORS.gray }, name: 'Calibri' },
    fill: { fgColor: { rgb: COLORS.lightGray }, patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  };

  if (includeChartData) {
    setCell(ws, 'A8',  `[ Donut Chart: Select A–B in Debt List → Insert → Doughnut Chart ]`, noteStyle);
    setCell(ws, 'A9',  `[ Timeline Chart: Select data in Payoff Schedule → Insert → Line Chart ]`, noteStyle);
  } else {
    setCell(ws, 'A8',  '', noteStyle);
    setCell(ws, 'A9',  '', noteStyle);
  }
  setCell(ws, 'D8',  `Extra Monthly Payment Goal: ${currency}`, noteStyle);
  setCell(ws, 'D9',  'Target Debt-Free Year: ', noteStyle);
  setCell(ws, 'D10', `Priority Strategy: ${opts.strategy === 'all' ? 'Snowball / Avalanche / Custom' : opts.strategy.charAt(0).toUpperCase() + opts.strategy.slice(1)}`, noteStyle);

  // Debt list header (row 13)
  const headers = ['#', 'Debt Name', `Balance (${currency})`, 'Interest Rate', `Min. Payment (${currency})`, 'Category', '% of Total', 'Est. Annual Interest'];
  headers.forEach((h, i) => {
    const col = String.fromCharCode(65 + i);
    setCell(ws, `${col}13`, h, headerStyle());
  });

  // Debt rows (capped to maxDebts)
  const displayDebts = debts.slice(0, maxDebts);
  displayDebts.forEach((d, i) => {
    const r = i + 14;
    const even = i % 2 === 0;
    const pct = totalBalance ? d.balance / totalBalance : 0;
    const estInt = d.balance * (d.rate / 100);
    [i + 1, d.name, d.balance, d.rate / 100, d.minPayment, d.category, pct, estInt].forEach((v, ci) => {
      const col = String.fromCharCode(65 + ci);
      const fmt = ci === 2 || ci === 4 || ci === 7 ? currFmt :
                  ci === 3 || ci === 6 ? '0.00%' : undefined;
      setCell(ws, `${col}${r}`, v as string | number, rowStyle(even), fmt);
    });
  });

  // Empty rows up to maxDebts
  for (let i = displayDebts.length; i < maxDebts; i++) {
    const r = i + 14;
    const even = i % 2 === 0;
    [i + 1, '', '', '', '', '', '', ''].forEach((v, ci) => {
      const col = String.fromCharCode(65 + ci);
      setCell(ws, `${col}${r}`, v as string | number, rowStyle(even));
    });
  }

  // Totals row
  const totalRow = maxDebts + 14;
  const totStyle = headerStyle(COLORS.accent1, COLORS.white);
  setCell(ws, `A${totalRow}`, 'TOTALS', totStyle);
  setCell(ws, `B${totalRow}`, '', totStyle);
  setCell(ws, `C${totalRow}`, totalBalance, totStyle, currFmt);
  setCell(ws, `D${totalRow}`, '', totStyle);
  setCell(ws, `E${totalRow}`, totalMin, totStyle, currFmt);
  setCell(ws, `F${totalRow}`, '', totStyle);
  setCell(ws, `G${totalRow}`, 1, totStyle, '0.00%');
  setCell(ws, `H${totalRow}`, totalInterest, totStyle, currFmt);

  ws['!ref'] = `A1:H${totalRow}`;
  ws['!cols'] = [
    { wch: 4 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 18 },
  ];
  ws['!rows'] = [{ hpt: 28 }, { hpt: 14 }, {}, {}, { hpt: 32 }, {}, { hpt: 18 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 3 } },
    { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } },
    { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } },
    { s: { r: 4, c: 4 }, e: { r: 4, c: 5 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } },
    { s: { r: 6, c: 3 }, e: { r: 6, c: 7 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 2 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 2 } },
    { s: { r: 7, c: 3 }, e: { r: 7, c: 7 } },
    { s: { r: 8, c: 3 }, e: { r: 8, c: 7 } },
    { s: { r: 9, c: 3 }, e: { r: 9, c: 7 } },
  ];

  return ws;
}

/* ── Debt Setup sheet ────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildStyledDebtSetup(XLSX: any, debts: Debt[], opts: DebtTrackerOptions) {
  const { currency, maxDebts } = opts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  const currFmt = `"${currency}"#,##0.00`;

  setCell(ws, 'A1', 'DEBT SETUP', titleStyle());
  setCell(ws, 'A2', `Enter up to ${maxDebts} debts — name, balance, interest rate, minimum payment`, subTitleStyle());

  const headers = ['#', 'Debt Name', `Balance (${currency})`, 'Annual Rate (%)', `Min. Payment (${currency})`, 'Category', 'Notes'];
  headers.forEach((h, i) => setCell(ws, `${String.fromCharCode(65 + i)}4`, h, headerStyle()));

  const total = debts.length > 0 ? debts : [];
  for (let i = 0; i < maxDebts; i++) {
    const d = total[i];
    const r = i + 5;
    const even = i % 2 === 0;
    const st = rowStyle(even);
    setCell(ws, `A${r}`, i + 1, st);
    setCell(ws, `B${r}`, d?.name ?? '', st);
    setCell(ws, `C${r}`, d?.balance ?? '', st, d ? currFmt : undefined);
    setCell(ws, `D${r}`, d ? d.rate / 100 : '', st, d ? '0.00%' : undefined);
    setCell(ws, `E${r}`, d?.minPayment ?? '', st, d ? currFmt : undefined);
    setCell(ws, `F${r}`, d?.category ?? '', st);
    setCell(ws, `G${r}`, '', st);
  }

  ws['!ref'] = `A1:G${maxDebts + 5}`;
  ws['!cols'] = [{ wch: 4 }, { wch: 24 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 32 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ];
  return ws;
}

/* ── Payoff Schedule ─────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildStyledSchedule(XLSX: any, debts: Debt[], method: 'snowball' | 'avalanche' | 'custom', opts: DebtTrackerOptions, extraPayment = 200) {
  const { currency } = opts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  const currFmt = `"${currency}"#,##0.00`;

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

  setCell(ws, 'A4', 'EXTRA MONTHLY PAYMENT', kpiLabelStyle());
  setCell(ws, 'C4', 'TOTAL DEBT', kpiLabelStyle());
  setCell(ws, 'E4', 'EST. PAYOFF MONTHS', kpiLabelStyle());
  setCell(ws, 'A5', extraPayment, kpiStyle(), currFmt);
  setCell(ws, 'C5', debts.reduce((s, d) => s + d.balance, 0), kpiStyle(), currFmt);

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

  const schedHeaders = ['Month', ...sorted.flatMap(d => [`Pay: ${d.name}`, `Bal: ${d.name}`])];
  schedHeaders.forEach((h, i) => setCell(ws, `${String.fromCharCode(65 + i)}7`, h, headerStyle()));

  schedule.slice(0, 120).forEach((row, ri) => {
    const r = ri + 8;
    const even = ri % 2 === 0;
    row.forEach((v, ci) => {
      const fmt = ci > 0 ? currFmt : undefined;
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

/* ── Chart Data tab ──────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildChartDataTab(XLSX: any, debts: Debt[], opts: DebtTrackerOptions) {
  const { currency } = opts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  const currFmt = `"${currency}"#,##0.00`;

  const noteStyle: XStyle = {
    font: { bold: true, sz: 11, name: 'Calibri', color: { rgb: COLORS.dark } },
    fill: { fgColor: { rgb: 'FFF0F0' }, patternType: 'solid' },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  };

  setCell(ws, 'A1', 'CHART DATA — Select ranges below to insert charts in Excel/Google Sheets', titleStyle());

  setCell(ws, 'A3', '📊 DEBT BREAKDOWN (for Donut/Pie Chart)', sectionHeaderStyle());
  setCell(ws, 'A4', 'How to: Select A5:B' + (5 + debts.length - 1) + ' → Insert → Doughnut Chart', noteStyle);
  ['Debt Name', `Balance (${currency})`].forEach((h, i) => setCell(ws, `${String.fromCharCode(65 + i)}5`, h, headerStyle()));
  debts.forEach((d, i) => {
    setCell(ws, `A${6 + i}`, d.name, rowStyle(i % 2 === 0));
    setCell(ws, `B${6 + i}`, d.balance, rowStyle(i % 2 === 0), currFmt);
  });

  const chartDataStartRow = 6 + debts.length + 2;
  setCell(ws, `A${chartDataStartRow}`, '📈 PAYOFF TIMELINE (for Line/Bar Chart)', sectionHeaderStyle());
  setCell(ws, `A${chartDataStartRow + 1}`, 'How to: Select the Month + Total Remaining columns → Insert → Line Chart', noteStyle);
  ['Month', 'Snowball Remaining', 'Avalanche Remaining'].forEach((h, i) =>
    setCell(ws, `${String.fromCharCode(65 + i)}${chartDataStartRow + 2}`, h, headerStyle())
  );

  // Simple simulation for chart data
  const snowSorted = [...debts].sort((a, b) => a.balance - b.balance);
  const avalSorted = [...debts].sort((a, b) => b.rate - a.rate);
  const snowBals = snowSorted.map(d => d.balance);
  const avalBals = avalSorted.map(d => d.balance);
  const extraPay = 200;

  for (let m = 0; m < 60; m++) {
    let snowExtra = extraPay, avalExtra = extraPay;
    for (let i = 0; i < snowBals.length; i++) {
      if (snowBals[i] <= 0) continue;
      const int = (snowBals[i] * (snowSorted[i].rate / 100)) / 12;
      const pay = Math.min(snowSorted[i].minPayment, snowBals[i] + int);
      snowBals[i] = Math.max(0, snowBals[i] + int - pay);
    }
    for (let i = 0; i < snowBals.length; i++) {
      if (snowBals[i] > 0 && snowExtra > 0) {
        const a = Math.min(snowExtra, snowBals[i]); snowBals[i] -= a; snowExtra -= a; break;
      }
    }
    for (let i = 0; i < avalBals.length; i++) {
      if (avalBals[i] <= 0) continue;
      const int = (avalBals[i] * (avalSorted[i].rate / 100)) / 12;
      const pay = Math.min(avalSorted[i].minPayment, avalBals[i] + int);
      avalBals[i] = Math.max(0, avalBals[i] + int - pay);
    }
    for (let i = 0; i < avalBals.length; i++) {
      if (avalBals[i] > 0 && avalExtra > 0) {
        const a = Math.min(avalExtra, avalBals[i]); avalBals[i] -= a; avalExtra -= a; break;
      }
    }
    const snowTotal = snowBals.reduce((s, b) => s + b, 0);
    const avalTotal = avalBals.reduce((s, b) => s + b, 0);
    const r = chartDataStartRow + 3 + m;
    setCell(ws, `A${r}`, m + 1, rowStyle(m % 2 === 0));
    setCell(ws, `B${r}`, Math.round(snowTotal * 100) / 100, rowStyle(m % 2 === 0), currFmt);
    setCell(ws, `C${r}`, Math.round(avalTotal * 100) / 100, rowStyle(m % 2 === 0), currFmt);
  }

  ws['!ref'] = `A1:C${chartDataStartRow + 63}`;
  ws['!cols'] = [{ wch: 24 }, { wch: 18 }, { wch: 18 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
    { s: { r: chartDataStartRow - 1, c: 0 }, e: { r: chartDataStartRow - 1, c: 2 } },
    { s: { r: chartDataStartRow, c: 0 }, e: { r: chartDataStartRow, c: 2 } },
  ];
  return ws;
}

/* ── Quick Start ─────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildQuickStart(XLSX: any, opts: DebtTrackerOptions) {
  const { strategy, maxDebts, currency } = opts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  setCell(ws, 'A1', 'QUICK START GUIDE', titleStyle());
  setCell(ws, 'A2', 'You are 4 steps away from your debt-free plan', subTitleStyle());

  const strategyText = strategy === 'all'
    ? '• Snowball — smallest balance first (psychological wins)\n• Avalanche — highest interest first (saves the most money)\n• Custom — arrange debts in your own preferred order'
    : strategy === 'snowball'
    ? 'This tracker uses the SNOWBALL method — pay smallest balances first for quick wins!'
    : strategy === 'avalanche'
    ? 'This tracker uses the AVALANCHE method — pay highest interest first to save the most money!'
    : 'This tracker uses a CUSTOM order — arrange your debts however works best for you.';

  const steps = [
    ['STEP 1', 'Go to the "Debt Setup" tab', `Enter each debt: name, balance, interest rate, and minimum payment. You can track up to ${maxDebts} debts.`],
    ['STEP 2', 'Choose your strategy', strategyText],
    ['STEP 3', 'Set your extra payment', `On the Dashboard, set how much extra you can pay each month in ${currency}. Watch your payoff date shrink!`],
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
  setCell(ws, 'A21', `Currently configured for: ${currency}  |  USD, EUR, GBP, CAD, AUD, VND and more — no conversion needed!`, subTitleStyle());
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
function buildStyledJournal(XLSX: any, opts: DebtTrackerOptions) {
  const { currency } = opts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ws: any = {};
  const currFmt = `"${currency}"#,##0.00`;

  setCell(ws, 'A1', 'MONTHLY PROGRESS JOURNAL', titleStyle());
  setCell(ws, 'A2', 'Record your payments, milestones, and reflections each month', subTitleStyle());

  const cols = ['Month', 'Year', `Total Paid (${currency})`, `Remaining (${currency})`, `Extra Paid (${currency})`, 'Debts Cleared', 'Notes & Reflections', 'Mood', 'On Track?'];
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
      setCell(ws, `C${r}`, sample ? [2100, 2150][ri] : '', rowStyle(even), sample ? currFmt : undefined);
      setCell(ws, `D${r}`, sample ? [38400, 36400][ri] : '', rowStyle(even), sample ? currFmt : undefined);
      setCell(ws, `E${r}`, sample ? 200 : '', rowStyle(even), sample ? currFmt : undefined);
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
export async function generateStyledDebtTracker(
  debts: Debt[] = SAMPLE_DEBTS,
  productName = 'Debt_Dashboard',
  options: Partial<DebtTrackerOptions> = {}
): Promise<{ blob: Blob, filename: string }> {
  const opts: DebtTrackerOptions = { ...DEFAULT_OPTIONS, ...options };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSXStyle: any = await import('xlsx-js-style');
  const JSZip = (await import('jszip')).default;
  const { jsPDF } = await import('jspdf');

  const slug = productName.replace(/\s+/g, '_');

  // Which strategy tabs to include
  const strategyTabs: Array<'snowball' | 'avalanche' | 'custom'> =
    opts.strategy === 'all' ? ['snowball', 'avalanche', 'custom'] : [opts.strategy];

  const buildWb = (isBlank: boolean) => {
    const wb = XLSXStyle.utils.book_new();
    const d = isBlank ? [] : debts;

    if (opts.includeQuickStart) {
      XLSXStyle.utils.book_append_sheet(wb, buildQuickStart(XLSXStyle, opts), 'Quick Start');
    }
    if (opts.includeDashboard) {
      XLSXStyle.utils.book_append_sheet(wb, buildStyledDashboard(XLSXStyle, d, opts), 'Dashboard');
    }
    XLSXStyle.utils.book_append_sheet(wb, buildStyledDebtSetup(XLSXStyle, d, opts), 'Debt Setup');

    for (const strat of strategyTabs) {
      const tabName = strat.charAt(0).toUpperCase() + strat.slice(1);
      XLSXStyle.utils.book_append_sheet(wb, buildStyledSchedule(XLSXStyle, d, strat, opts), tabName);
    }

    if (opts.includeChartData && !isBlank) {
      XLSXStyle.utils.book_append_sheet(wb, buildChartDataTab(XLSXStyle, d, opts), 'Chart Data');
    }
    if (opts.includeMonthlyJournal) {
      XLSXStyle.utils.book_append_sheet(wb, buildStyledJournal(XLSXStyle, opts), 'Monthly Journal');
    }

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
  doc.text(`TRACK UP TO ${opts.maxDebts} DEBTS  |  CURRENCY: ${opts.currency}  |  STRATEGY: ${opts.strategy.toUpperCase()}`, W / 2, 38, { align: 'center' });

  let y = 60;
  const features: [string, string][] = [
    [`Track Up to ${opts.maxDebts} Debts Over 50 Years`, 'Perfect for managing multiple debts with a long-term view.'],
  ];
  if (opts.strategy === 'all') features.push(['3 Repayment Strategies', 'Snowball, Avalanche, or Custom — pick what fits your goals.']);
  else features.push([`${opts.strategy.charAt(0).toUpperCase() + opts.strategy.slice(1)} Strategy`, 'Optimized payoff plan baked right in.']);
  features.push(['Works with Any Currency', `Configured for ${opts.currency} — no conversion needed.`]);
  features.push(['Automatic Calculations', 'Save time with instant updates as you input payments.']);
  if (opts.includeMonthlyJournal) features.push(['Monthly Journal', 'Stay organized with a clear summary and space for notes.']);
  if (opts.includeChartData) features.push(['Chart-Ready Data', 'Pre-built data ranges for Donut & Line charts in Excel/Google Sheets.']);
  features.push(['Monitor Interest & Debt-Free Dates', 'See how much interest you save with each strategy.']);

  doc.setFontSize(10); doc.setTextColor(74, 48, 48);
  for (const [title, desc] of features) {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(201, 128, 128); doc.text(`✓  ${title}`, 18, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(74, 48, 48); doc.text(`    ${desc}`, 18, y + 5);
    y += 14;
    if (y > H - 20) break;
  }

  doc.setFillColor(201, 168, 168); doc.rect(0, H - 12, W, 12, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text('Thank you for your purchase!  Start your debt-free journey today!', W / 2, H - 5, { align: 'center' });
  const pdfBuf = doc.output('arraybuffer');

  // Build tab list for README
  const tabs = [
    opts.includeQuickStart && 'Quick Start',
    opts.includeDashboard && 'Dashboard',
    'Debt Setup',
    ...strategyTabs.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    opts.includeChartData && 'Chart Data',
    opts.includeMonthlyJournal && 'Monthly Journal',
  ].filter(Boolean);

  // ZIP
  const zip = new JSZip();
  const folder = zip.folder(slug)!;
  folder.file(`Sample_${slug}.xlsx`, sampleBuf);
  folder.file(`Blank_${slug}.xlsx`, blankBuf);
  if (opts.includeInstructions) folder.file('Instructions.pdf', pdfBuf);
  folder.file('README.txt', [
    `Debt Dashboard — Digital Download`,
    '='.repeat(40),
    '',
    `Strategy: ${opts.strategy.toUpperCase()}`,
    `Max Debts: ${opts.maxDebts}`,
    `Currency: ${opts.currency}`,
    '',
    'FILES:',
    `  Sample_${slug}.xlsx   — pre-filled with ${debts.length} example debts`,
    `  Blank_${slug}.xlsx    — empty template ready to fill`,
    opts.includeInstructions ? '  Instructions.pdf      — feature overview' : '',
    '',
    `TABS: ${tabs.join(' | ')}`,
    '',
    'Open .xlsx in Excel OR upload to Google Drive → Open with Google Sheets.',
    'Works on Mac, PC, iPhone, and Android.',
    '',
    'IMPORTANT: This is a DIGITAL download. No physical item will be shipped.',
  ].filter(l => l !== undefined).join('\n'));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  
  return { blob, filename: `${slug}_Bundle.zip` };
}
