/**
 * spreadsheet-generator.ts — Debt Payoff Tracker product bundle generator.
 * Uses SheetJS (xlsx) to build Sample + Blank Excel workbooks, plus a PDF guide,
 * all packaged into a ZIP for Etsy delivery.
 */

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Debt {
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
  category: string;
}

/* ─── Sample data ──────────────────────────────────────────────────────── */
const SAMPLE_DEBTS: Debt[] = [
  { name: 'Credit Card A', balance: 4800, rate: 22.99, minPayment: 120, category: 'Credit Card' },
  { name: 'Credit Card B', balance: 2200, rate: 18.99, minPayment: 55, category: 'Credit Card' },
  { name: 'Car Loan', balance: 11500, rate: 6.9, minPayment: 240, category: 'Auto' },
  { name: 'Student Loan', balance: 18000, rate: 5.5, minPayment: 180, category: 'Student' },
  { name: 'Medical Bill', balance: 950, rate: 0, minPayment: 50, category: 'Medical' },
  { name: 'Personal Loan', balance: 3500, rate: 12.5, minPayment: 85, category: 'Personal' },
];

/* ─── Sheet builders (all XLSX operations are via imported `XLSX` — typed as any) ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDashboard(XLSX: any, debts: Debt[]) {
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin = debts.reduce((s, d) => s + d.minPayment, 0);
  const avgRate = debts.length ? debts.reduce((s, d) => s + d.rate, 0) / debts.length : 0;

  const rows = [
    ['💛  DEBT PAYOFF TRACKER', '', '', '', '', ''],
    ['Track your journey to a debt-free life', '', '', '', '', ''],
    [''],
    ['OVERVIEW', '', '', '', '', 'QUICK STATS', ''],
    ['Total Debt', totalDebt, '', '', '', 'Debts Tracked', debts.length],
    ['Total Min. Payments/mo', totalMin, '', '', '', 'Avg. Interest Rate', avgRate / 100],
    ['Extra Payment Budget (edit me!)', 0, '', '', '', 'Est. Interest Saved', ''],
    [''],
    ['💡 TIP: Enter your extra monthly payment in column B row 7 to see a faster payoff!'],
    [''],
    ['Debt Name', 'Balance ($)', 'Interest Rate', 'Min. Payment ($)', 'Category', '% of Total'],
    ...debts.map(d => [d.name, d.balance, d.rate / 100, d.minPayment, d.category, totalDebt ? d.balance / totalDebt : 0]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Number formats
  const fmtMoney = '"$"#,##0.00';
  const fmtPct = '0.00%';
  if (ws['B5']) ws['B5'].z = fmtMoney;
  if (ws['B6']) ws['B6'].z = fmtMoney;
  if (ws['B7']) ws['B7'].z = fmtMoney;
  if (ws['C7']) ws['C7'].z = fmtPct;
  debts.forEach((_, i) => {
    const r = i + 12;
    if (ws[`B${r}`]) ws[`B${r}`].z = fmtMoney;
    if (ws[`C${r}`]) ws[`C${r}`].z = fmtPct;
    if (ws[`D${r}`]) ws[`D${r}`].z = fmtMoney;
    if (ws[`F${r}`]) ws[`F${r}`].z = fmtPct;
  });

  ws['!cols'] = [{ wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 16 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 5 } },
  ];
  return ws;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDebtSetup(XLSX: any, debts: Debt[]) {
  const rows = [
    ['💳  DEBT SETUP — Enter your debts below (up to 50)'],
    ['Name your debts, enter balances, interest rates, and minimum monthly payments.'],
    [''],
    ['#', 'Debt Name', 'Current Balance ($)', 'Annual Interest Rate (%)', 'Min. Monthly Payment ($)', 'Category', 'Notes'],
    ...debts.map((d, i) => [i + 1, d.name, d.balance, d.rate / 100, d.minPayment, d.category, '']),
    ...Array.from({ length: Math.max(0, 50 - debts.length) }, (_, i) => [debts.length + i + 1, '', '', '', '', '', '']),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  debts.forEach((_, i) => {
    const r = i + 5;
    if (ws[`C${r}`]) ws[`C${r}`].z = '"$"#,##0.00';
    if (ws[`D${r}`]) ws[`D${r}`].z = '0.00%';
    if (ws[`E${r}`]) ws[`E${r}`].z = '"$"#,##0.00';
  });
  ws['!cols'] = [{ wch: 4 }, { wch: 24 }, { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 32 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ];
  return ws;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPayoffSchedule(XLSX: any, debts: Debt[], method: 'snowball' | 'avalanche', extraPayment = 200) {
  const sorted = [...debts].sort((a, b) =>
    method === 'snowball' ? a.balance - b.balance : b.rate - a.rate
  );
  const icon = method === 'snowball' ? '❄️' : '🔥';
  const label = method === 'snowball' ? 'SNOWBALL (Smallest Balance First)' : 'AVALANCHE (Highest Interest First)';
  const desc = method === 'snowball'
    ? 'Pay minimums on all debts, then put ALL extra money toward the SMALLEST balance.'
    : 'Pay minimums on all debts, then put ALL extra money toward the HIGHEST interest rate.';

  const balances = sorted.map(d => d.balance);
  const schedule: (string | number)[][] = [];
  let month = 0;

  while (balances.some(b => b > 0.01) && month < 120) {
    month++;
    let extra = extraPayment;
    const row: (string | number)[] = [`Month ${month}`];

    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] <= 0) { row.push(0, 0); continue; }
      const interest = (balances[i] * (sorted[i].rate / 100)) / 12;
      const payment = Math.min(sorted[i].minPayment, balances[i] + interest);
      balances[i] = Math.max(0, balances[i] + interest - payment);
      row.push(Number(payment.toFixed(2)), Number(balances[i].toFixed(2)));
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

  const headers = ['Month', ...sorted.flatMap(d => [`Payment: ${d.name}`, `Balance: ${d.name}`])];
  const rows = [
    [`${icon} ${label}`],
    [desc],
    [`Extra Monthly Payment: $${extraPayment} → Payoff in approx. ${month} months (${(month / 12).toFixed(1)} years)`],
    [''],
    headers,
    ...schedule,
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 10 }, ...sorted.flatMap(() => [{ wch: 18 }, { wch: 18 }])];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
  ];
  return ws;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildMonthlyJournal(XLSX: any) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const rows = [
    ['📓  MONTHLY JOURNAL & PROGRESS TRACKER'],
    ['Record your payments and reflections each month to stay motivated!'],
    [''],
    ['Month', 'Year', 'Total Paid ($)', 'Remaining Balance ($)', 'Extra Payments ($)', 'Debts Eliminated', 'Notes & Reflections', 'Mood', 'On Track?'],
    ...([2026, 2027, 2028].flatMap(y => months.map(m => [m, y, '', '', '', 0, '', '😊', '✅']))),
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 6 }, { wch: 14 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 42 }, { wch: 8 }, { wch: 10 }];
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }];
  return ws;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildInstructions(XLSX: any) {
  const rows = [
    ['📖  DEBT PAYOFF TRACKER — STEP-BY-STEP GUIDE'],
    [''],
    ['STEP 1 — SET UP YOUR DEBTS'],
    ['Go to the "Debt Setup" tab and enter each debt: name, balance, interest rate, and minimum payment.'],
    [''],
    ['STEP 2 — PICK YOUR STRATEGY'],
    ['• ❄️ Snowball: Smallest balance first → quick psychological wins and momentum'],
    ['• 🔥 Avalanche: Highest interest first → saves the most money over time'],
    [''],
    ['STEP 3 — SET EXTRA PAYMENT (Dashboard, row 7)'],
    ['Enter any extra amount you can pay monthly. The schedules update to show your new payoff date.'],
    [''],
    ['STEP 4 — TRACK MONTHLY PROGRESS'],
    ['Use the "Monthly Journal" tab to log payments, milestones, and notes each month.'],
    [''],
    ['STEP 5 — CELEBRATE WINS!'],
    ['Every debt you eliminate frees up more money for the next one. Use that momentum!'],
    [''],
    ['─────────────────────────────────────'],
    ['KEY FEATURES'],
    ['• Track up to 50 debts over up to 50 years'],
    ['• Works with any currency — just replace $ with your symbol'],
    ['• Automatic interest and payoff calculations'],
    ['• Compatible with Mac, PC, iOS, and Android'],
    [''],
    ['─────────────────────────────────────'],
    ['IMPORTANT NOTES'],
    ['• Digital download only — no physical item shipped'],
    ['• All sales final (digital products)'],
    ['• Colors may vary slightly on different screens'],
    [''],
    ['Thank you for your purchase! Share your debt-free journey! 💛'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 90 }];
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }];
  return ws;
}

/* ─── Main bundle export ─────────────────────────────────────────────────── */
export async function generateDebtTrackerBundle(productName = 'Debt_Payoff_Tracker'): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX: any = await import('xlsx');
  const JSZip = (await import('jszip')).default;
  const { jsPDF } = await import('jspdf');

  const slug = productName.replace(/\s+/g, '_');

  // ── Sample workbook ──────────────────────────────────────────────────────
  const sampleWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(sampleWb, buildDashboard(XLSX, SAMPLE_DEBTS), 'Dashboard');
  XLSX.utils.book_append_sheet(sampleWb, buildDebtSetup(XLSX, SAMPLE_DEBTS), 'Debt Setup');
  XLSX.utils.book_append_sheet(sampleWb, buildPayoffSchedule(XLSX, SAMPLE_DEBTS, 'snowball'), 'Snowball');
  XLSX.utils.book_append_sheet(sampleWb, buildPayoffSchedule(XLSX, SAMPLE_DEBTS, 'avalanche'), 'Avalanche');
  XLSX.utils.book_append_sheet(sampleWb, buildMonthlyJournal(XLSX), 'Monthly Journal');
  XLSX.utils.book_append_sheet(sampleWb, buildInstructions(XLSX), 'Instructions');
  const sampleBuf = XLSX.write(sampleWb, { type: 'array', bookType: 'xlsx', bookSST: false });

  // ── Blank workbook ───────────────────────────────────────────────────────
  const blankWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(blankWb, buildDashboard(XLSX, []), 'Dashboard');
  XLSX.utils.book_append_sheet(blankWb, buildDebtSetup(XLSX, []), 'Debt Setup');
  XLSX.utils.book_append_sheet(blankWb, buildPayoffSchedule(XLSX, [], 'snowball', 0), 'Snowball');
  XLSX.utils.book_append_sheet(blankWb, buildPayoffSchedule(XLSX, [], 'avalanche', 0), 'Avalanche');
  XLSX.utils.book_append_sheet(blankWb, buildMonthlyJournal(XLSX), 'Monthly Journal');
  XLSX.utils.book_append_sheet(blankWb, buildInstructions(XLSX), 'Instructions');
  const blankBuf = XLSX.write(blankWb, { type: 'array', bookType: 'xlsx', bookSST: false });

  // ── Instructions PDF ─────────────────────────────────────────────────────
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setFillColor(251, 191, 36);
  doc.rect(0, 0, W, 8, 'F');
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 8, W, 40, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('Debt Payoff Tracker', W / 2, 30, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(196, 181, 253);
  doc.text('Your step-by-step guide to becoming debt-free', W / 2, 40, { align: 'center' });

  const sections = [
    { title: "What's Included", items: ['Sample Excel (.xlsx) with mock data', 'Blank Excel (.xlsx) — ready to fill in', 'Step-by-step Instructions PDF', 'README.txt with quick-start guide'] },
    { title: 'How to Get Started', items: ['1. Open the Excel file (or upload to Google Drive)', '2. Enter your debts in the "Debt Setup" tab', '3. Choose Snowball or Avalanche strategy', '4. Set your extra payment on the Dashboard', '5. Log monthly progress in the Journal tab'] },
    { title: 'Repayment Methods', items: ['❄️  Snowball — Smallest balance first (psychological wins)', '🔥  Avalanche — Highest interest first (saves most money)', '🎯  Custom — Arrange debts in any order you prefer'] },
    { title: 'Key Features', items: ['Track up to 50 debts over 50 years', 'Works with any currency worldwide', 'Automatic interest & payoff date calculations', 'Monthly journal tab for tracking & reflection'] },
  ];

  let y = 58;
  for (const sec of sections) {
    doc.setFillColor(238, 242, 255);
    doc.rect(14, y - 3, W - 28, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(79, 70, 229);
    doc.text(sec.title.toUpperCase(), 18, y + 2);
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    for (const item of sec.items) { doc.text(`• ${item}`, 18, y); y += 6; }
    y += 4;
  }

  doc.setFillColor(251, 191, 36);
  doc.rect(0, H - 12, W, 12, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('Thank you for your purchase! 💛  Share your debt-free journey and inspire others!', W / 2, H - 5, { align: 'center' });

  const pdfBuf = doc.output('arraybuffer');

  // ── ZIP ──────────────────────────────────────────────────────────────────
  const zip = new JSZip();
  const folder = zip.folder(slug)!;
  folder.file(`Sample_${slug}.xlsx`, sampleBuf);
  folder.file(`Blank_${slug}.xlsx`, blankBuf);
  folder.file('Instructions_Guide.pdf', pdfBuf);
  folder.file('README.txt', [
    `${productName.replace(/_/g, ' ')} — Digital Download`,
    '='.repeat(40),
    '',
    'FILES INCLUDED:',
    `  • Sample_${slug}.xlsx   — Pre-filled with example data`,
    `  • Blank_${slug}.xlsx    — Clean template, ready to fill`,
    `  • Instructions_Guide.pdf — Setup guide`,
    '',
    'QUICK START:',
    '  1. Open .xlsx in Excel or upload to Google Drive > Open with Google Sheets',
    '  2. Go to "Debt Setup" tab and enter your debts',
    '  3. See your payoff date on the Dashboard!',
    '',
    'This is a DIGITAL download. No physical item will be shipped.',
  ].join('\n'));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}_Bundle.zip`;
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════
   BUDGET TRACKER
   ═══════════════════════════════════════════════════════════ */

export async function generateBudgetTrackerBundle(productName = 'Monthly_Budget_Tracker'): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX: any = await import('xlsx');
  const JSZip = (await import('jszip')).default;
  const slug = productName.replace(/\s+/g, '_');

  const overviewRows = [
    ['MONTHLY BUDGET TRACKER', '', '', ''],
    ['Track income, expenses, and savings every month'],
    [''],
    ['Month', 'Total Income ($)', 'Total Expenses ($)', 'Net Savings ($)'],
    ...['January','February','March','April','May','June','July','August','September','October','November','December']
      .map((m, i) => [m, i < 2 ? 5200 : '', i < 2 ? [3640,3820][i] : '', '']),
  ];
  const overviewWs = XLSX.utils.aoa_to_sheet(overviewRows);
  overviewWs['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 14 }];

  const catRows = [
    ['BUDGET CATEGORIES'],[''],
    ['Category', 'Sub-Category', 'Budget ($)', 'Actual ($)', 'Difference ($)'],
    ['Housing','Rent',1500,'',''], ['Housing','Utilities',180,'',''], ['Housing','Internet',90,'',''],
    ['Food','Groceries',350,'',''], ['Food','Dining Out',200,'',''],
    ['Transport','Car',350,'',''], ['Transport','Gas',120,'',''],
    ['Health','Gym',50,'',''], ['Health','Medical',80,'',''],
    ['Savings','Emergency Fund',300,'',''], ['Savings','Retirement',500,'',''],
    ...Array.from({ length: 10 }, () => ['','','','','']),
  ];
  const catWs = XLSX.utils.aoa_to_sheet(catRows);
  catWs['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];

  const buildWb = (withData: boolean) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, overviewWs, 'Overview');
    XLSX.utils.book_append_sheet(wb, catWs, 'Categories');

    const expRows = [['EXPENSE LOG'],[''],['Date','Description','Category','Amount ($)','Method','Notes'],
      ...(withData ? [
        ['2026-01-02','Monthly Rent','Housing',1500,'Bank Transfer',''],
        ['2026-01-03','Grocery Store','Food',87.50,'Debit Card','Weekly shop'],
        ['2026-01-05','Netflix','Personal',15.99,'Credit Card',''],
        ['2026-01-07','Gas Station','Transport',52.00,'Debit','Full tank'],
        ['2026-01-10','Restaurant','Food',42.00,'Credit Card','Dinner'],
        ['2026-01-15','Gym','Health',50.00,'Auto-pay',''],
        ['2026-01-18','Grocery Store','Food',95.30,'Debit Card',''],
        ['2026-01-20','Electric Bill','Housing',110.00,'Bank Transfer',''],
      ] : []),
      ...Array.from({ length: 42 }, () => Array(6).fill('')),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(expRows), 'Expense Log');

    const incRows = [['INCOME LOG'],[''],['Date','Source','Type','Amount ($)','Notes'],
      ...(withData ? [
        ['2026-01-01','Employer','Salary',4200,'Monthly paycheck'],
        ['2026-01-15','Freelance Client','Freelance',800,'Design project'],
        ['2026-01-20','Side Business','Business',200,'Sales'],
      ] : []),
      ...Array.from({ length: 20 }, () => Array(5).fill('')),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incRows), 'Income Log');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx', bookSST: false });
  };

  const zip = new JSZip(); const folder = zip.folder(slug)!;
  folder.file(`Sample_${slug}.xlsx`, buildWb(true));
  folder.file(`Blank_${slug}.xlsx`, buildWb(false));
  folder.file('README.txt', `Monthly Budget Tracker — 4 tabs: Overview, Categories, Expense Log, Income Log.\nCompatible with Excel and Google Sheets.`);
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${slug}_Bundle.zip`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════
   SAVINGS GOAL TRACKER
   ═══════════════════════════════════════════════════════════ */

export async function generateSavingsTrackerBundle(productName = 'Savings_Goal_Tracker'): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX: any = await import('xlsx');
  const JSZip = (await import('jszip')).default;
  const slug = productName.replace(/\s+/g, '_');

  const goals = [
    ['Emergency Fund', 10000, 4200, '2026-12-31', 'High'],
    ['Vacation - Europe', 5000, 1800, '2026-08-01', 'Medium'],
    ['New Laptop', 2000, 950, '2026-06-01', 'Medium'],
    ['Home Down Payment', 50000, 12000, '2028-01-01', 'High'],
  ];

  const buildWb = (withData: boolean) => {
    const wb = XLSX.utils.book_new();
    const gRows = [['SAVINGS GOAL TRACKER'],[''],['Goal Name','Target ($)','Saved ($)','Remaining ($)','Deadline','Priority','Progress %'],
      ...(withData ? goals.map(([n,t,s,d,p]) => [n, t, s, (t as number)-(s as number), d, p, `${(((s as number)/(t as number))*100).toFixed(1)}%`]) : []),
      ...Array.from({ length: 16 }, () => Array(7).fill('')),
    ];
    const gWs = XLSX.utils.aoa_to_sheet(gRows);
    gWs['!cols'] = [{ wch: 24 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, gWs, 'My Goals');

    const cRows = [['CONTRIBUTION LOG'],[''],['Date','Goal','Amount Added ($)','New Total ($)','Notes'],
      ...(withData ? [
        ['2026-01-05','Emergency Fund',500,4200,'Monthly auto-transfer'],
        ['2026-01-10','Vacation - Europe',300,1800,'Bonus savings'],
        ['2026-01-15','New Laptop',200,950,'Side hustle'],
        ['2026-01-20','Home Down Payment',1000,12000,'Monthly savings'],
      ] : []),
      ...Array.from({ length: 30 }, () => Array(5).fill('')),
    ];
    const cWs = XLSX.utils.aoa_to_sheet(cRows);
    cWs['!cols'] = [{ wch: 12 }, { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, cWs, 'Contributions');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx', bookSST: false });
  };

  const zip = new JSZip(); const folder = zip.folder(slug)!;
  folder.file(`Sample_${slug}.xlsx`, buildWb(true));
  folder.file(`Blank_${slug}.xlsx`, buildWb(false));
  folder.file('README.txt', `Savings Goal Tracker — Goals + Contribution Log tabs.\nCompatible with Excel and Google Sheets.`);
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${slug}_Bundle.zip`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════
   INVOICE / FREELANCE TRACKER
   ═══════════════════════════════════════════════════════════ */

export async function generateInvoiceTrackerBundle(productName = 'Invoice_Tracker'): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX: any = await import('xlsx');
  const JSZip = (await import('jszip')).default;
  const slug = productName.replace(/\s+/g, '_');

  const buildWb = (withData: boolean) => {
    const wb = XLSX.utils.book_new();
    const invRows = [['INVOICE TRACKER'],[''],
      ['Invoice #','Issue Date','Client','Description','Amount ($)','Due Date','Status','Paid Date'],
      ...(withData ? [
        ['INV-001','2026-01-05','Acme Corp','Website Redesign',2500,'2026-01-20','Paid','2026-01-18'],
        ['INV-002','2026-01-10','Beta Studio','Logo Design',800,'2026-01-25','Paid','2026-01-24'],
        ['INV-003','2026-01-18','Gamma Inc','Brand Strategy',1500,'2026-02-01','Pending',''],
        ['INV-004','2026-01-22','Delta LLC','Social Media',650,'2026-02-05','Pending',''],
        ['INV-005','2026-01-28','Epsilon Co','Photography',1200,'2026-02-10','Overdue',''],
      ] : []),
      ...Array.from({ length: 45 }, () => Array(8).fill('')),
    ];
    const invWs = XLSX.utils.aoa_to_sheet(invRows);
    invWs['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 26 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, invWs, 'Invoices');

    const cRows = [['CLIENT LIST'],[''],
      ['Client','Contact','Email','Total Billed ($)','Paid ($)','Outstanding ($)','Notes'],
      ...(withData ? [
        ['Acme Corp','John Smith','john@acme.com',2500,2500,0,'Great client'],
        ['Beta Studio','Lisa Ray','lisa@beta.com',800,800,0,'Quick payer'],
        ['Gamma Inc','Tom Brown','tom@gamma.com',1500,0,1500,'Net-30'],
        ['Delta LLC','Amy Chen','amy@delta.com',650,0,650,'New client'],
        ['Epsilon Co','Mark Lee','mark@eps.com',1200,0,1200,'Follow up!'],
      ] : []),
      ...Array.from({ length: 20 }, () => Array(7).fill('')),
    ];
    const cWs = XLSX.utils.aoa_to_sheet(cRows);
    cWs['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 24 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, cWs, 'Clients');

    const sRows = [['MONTHLY SUMMARY'],[''],['Month','Invoices Sent','Billed ($)','Collected ($)','Outstanding ($)'],
      ...(withData ? [['January 2026', 5, 6650, 3300, 3350]] : []),
      ...Array.from({ length: 11 }, () => Array(5).fill('')),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sRows), 'Monthly Summary');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx', bookSST: false });
  };

  const zip = new JSZip(); const folder = zip.folder(slug)!;
  folder.file(`Sample_${slug}.xlsx`, buildWb(true));
  folder.file(`Blank_${slug}.xlsx`, buildWb(false));
  folder.file('README.txt', `Invoice & Freelance Tracker — Invoices, Clients, Monthly Summary tabs.\nCompatible with Excel and Google Sheets.`);
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${slug}_Bundle.zip`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

