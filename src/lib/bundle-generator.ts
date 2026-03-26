/**
 * bundle-generator.ts
 * Generates a full Etsy-ready resume product bundle as a ZIP:
 *   • 1-Page Resume PDF
 *   • 2-Page Resume PDF
 *   • 3-Page Resume PDF
 *   • Cover Letter PDF
 *   • References PDF
 *   • Fonts_Used.txt
 */

import { buildResumeHtml, renderHtmlToCanvases } from './pdf-generator';

export interface BundleContent {
  niche: string;
  title: string;
  summary: string;
  imageUrl?: string | null;
  fontPair: { label: string; heading: string; body: string };
}

async function buildPdfBuffer(
  data: BundleContent,
  pageCount: 1 | 2 | 3
): Promise<ArrayBuffer> {
  const { jsPDF } = await import('jspdf');
  const html = buildResumeHtml({ ...data, pageCount });
  const canvases = await renderHtmlToCanvases(html);

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  canvases.forEach((canvas, i) => {
    if (i > 0) doc.addPage();
    doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, W, H);
  });

  return doc.output('arraybuffer');
}

async function buildCoverLetterPdf(data: BundleContent): Promise<ArrayBuffer> {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const theme = getTheme(data.niche);

  // Render a styled HTML cover letter
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(data.fontPair.heading)}:wght@400;700&family=${encodeURIComponent(data.fontPair.body)}:wght@400;700&display=swap"/>
<style>*{margin:0;padding:0;box-sizing:border-box;}</style>
</head><body style="padding:10px;">
<div style="width:794px;min-height:1123px;background:#fff;font-family:'${data.fontPair.body}',sans-serif;">
  <div style="background:${theme.dark};padding:30px 40px;display:flex;align-items:center;gap:24px;">
    <div style="flex:1;">
      <div style="font-family:'${data.fontPair.heading}',serif;font-size:22px;font-weight:700;color:#fff;">JOHN EVEREST</div>
      <div style="font-size:11px;color:${theme.accent};margin-top:4px;letter-spacing:1px;">${data.title}</div>
    </div>
    <div style="font-size:9.5px;color:#aaa;text-align:right;line-height:1.8;">
      yourname@email.com<br>linkedin.com/username<br>+1 (555) 000-0000<br>New York, NY
    </div>
  </div>
  <div style="padding:50px 50px 40px;">
    <div style="font-size:10px;color:#888;margin-bottom:30px;">27 March 2026</div>
    <div style="font-size:10px;color:#555;margin-bottom:4px;">Hiring Manager</div>
    <div style="font-size:10px;color:#555;margin-bottom:4px;">Company Name</div>
    <div style="font-size:10px;color:#555;margin-bottom:30px;">City, State</div>
    <div style="font-size:10px;color:#333;margin-bottom:16px;font-weight:600;">Dear Hiring Manager,</div>
    <div style="font-size:10.5px;color:#444;line-height:1.9;margin-bottom:16px;">
      I am writing to express my strong interest in the <strong>${data.title}</strong> position. With over 10 years of hands-on experience in <strong>${data.niche}</strong>, I have consistently driven measurable results that span creative excellence, team leadership, and strategic growth.
    </div>
    <div style="font-size:10.5px;color:#444;line-height:1.9;margin-bottom:16px;">
      ${data.summary}
    </div>
    <div style="font-size:10.5px;color:#444;line-height:1.9;margin-bottom:16px;">
      Throughout my career, I have developed deep expertise in brand strategy, cross-functional team leadership, and delivering measurable impact. My track record includes leading projects that have generated significant ROI, won industry awards, and enhanced brand perception in highly competitive markets.
    </div>
    <div style="font-size:10.5px;color:#444;line-height:1.9;margin-bottom:16px;">
      I am excited about the opportunity to bring my passion for <strong>${data.niche}</strong> to your organisation. I would welcome the chance to discuss how my background aligns with your team's strategic goals.
    </div>
    <div style="font-size:10.5px;color:#444;line-height:1.9;margin-bottom:40px;">Thank you for your time and consideration. I look forward to connecting with you.</div>
    <div style="font-size:10.5px;color:#333;font-weight:600;margin-bottom:4px;">Sincerely,</div>
    <div style="font-size:10.5px;color:#555;">John Everest</div>
    <div style="font-size:10px;color:#888;margin-top:4px;">yourname@email.com · linkedin.com/username</div>
  </div>
  <div style="background:${theme.accent};height:8px;margin-top:auto;"></div>
</div>
</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;height:1123px;border:none;opacity:0;';
  document.body.appendChild(iframe);

  const canvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
    iframe.onload = async () => {
      try {
        const page = iframe.contentDocument!.body.firstElementChild as HTMLElement;
        const c = await html2canvas(page, { scale: 2, useCORS: true, backgroundColor: '#fff', width: 794, height: 1123, logging: false });
        document.body.removeChild(iframe);
        resolve(c);
      } catch (e) { document.body.removeChild(iframe); reject(e); }
    };
    iframe.srcdoc = html;
  });

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
  return doc.output('arraybuffer');
}

async function buildReferencesPdf(data: BundleContent): Promise<ArrayBuffer> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const theme = getTheme(data.niche);

  doc.setFillColor(...theme.rgb);
  doc.rect(0, 0, W, 40, 'F');
  doc.setFillColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('REFERENCES', 14, 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 255);
  doc.text(`${data.title}  ·  John Everest`, 14, 32);

  const refs = [
    { name: 'Jordan Lee', role: `Chief Marketing Officer @ Apex Holdings`, email: 'j.lee@apex.com', phone: '+1 (555) 111-2222' },
    { name: 'Priya Sharma', role: 'VP Creative @ Pinnacle Agency', email: 'p.sharma@pinnacle.io', phone: '+1 (555) 333-4444' },
    { name: 'Marcus Chen', role: 'Co-Founder & CEO @ BrightSpark', email: 'm.chen@brightspark.co', phone: '+1 (555) 555-6666' },
  ];

  let y = 52;
  for (const ref of refs) {
    doc.setFillColor(247, 248, 252);
    doc.rect(14, y - 3, W - 28, 32, 'F');
    doc.setFillColor(...theme.rgb);
    doc.rect(14, y - 3, 3, 32, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(ref.name, 22, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(ref.role, 22, y + 12);
    doc.text(`✉  ${ref.email}`, 22, y + 19);
    doc.text(`✆  ${ref.phone}`, 22, y + 25);

    y += 42;
  }

  doc.setFillColor(...theme.rgb);
  doc.rect(0, H - 8, W, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('Created with Etsy Creator Studio', W / 2, H - 3, { align: 'center' });

  return doc.output('arraybuffer');
}

function getTheme(niche: string): { accent: string; dark: string; rgb: [number, number, number] } {
  const themes = [
    { accent: '#8b5cf6', dark: '#1e1b4b', rgb: [139, 92, 246] as [number, number, number] },
    { accent: '#3b82f6', dark: '#1e3a5f', rgb: [59, 130, 246] as [number, number, number] },
    { accent: '#ef4444', dark: '#450a0a', rgb: [239, 68, 68] as [number, number, number] },
    { accent: '#14b8a6', dark: '#042f2e', rgb: [20, 184, 166] as [number, number, number] },
    { accent: '#f97316', dark: '#431407', rgb: [249, 115, 22] as [number, number, number] },
  ];
  let hash = 0;
  for (const ch of niche) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return themes[hash % themes.length];
}

export async function generateBundle(content: BundleContent): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const slug = content.niche.replace(/\s+/g, '_');

  // Generate all documents (sequentially to avoid too many iframes at once)
  const buf1 = await buildPdfBuffer(content, 1);
  const buf2 = await buildPdfBuffer(content, 2);
  const buf3 = await buildPdfBuffer(content, 3);
  const bufCL = await buildCoverLetterPdf(content);
  const bufRef = await buildReferencesPdf(content);

  const fontsText = [
    `FONTS USED — ${content.niche.toUpperCase()} RESUME BUNDLE`,
    '='.repeat(50),
    ``,
    `Heading Font : ${content.fontPair.heading}`,
    `Body Font    : ${content.fontPair.body}`,
    ``,
    `Download free at: https://fonts.google.com`,
    `  • ${content.fontPair.heading}`,
    `  • ${content.fontPair.body}`,
    ``,
    `Note: Fonts are embedded inside the PDF files.`,
    ``,
    '='.repeat(50),
    `Created with Etsy Creator Studio`,
  ].join('\n');

  const zip = new JSZip();
  const folder = zip.folder(`${slug}_Resume_Bundle`)!;
  folder.file(`1_Page_Resume_${slug}.pdf`, buf1);
  folder.file(`2_Page_Resume_${slug}.pdf`, buf2);
  folder.file(`3_Page_Resume_${slug}.pdf`, buf3);
  folder.file(`Cover_Letter_${slug}.pdf`, bufCL);
  folder.file(`References_${slug}.pdf`, bufRef);
  folder.file('Fonts_Used.txt', fontsText);

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}_Resume_Bundle.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
