/**
 * html-pdf-generator.ts
 *
 * Renders a two-column HTML resume layout (matching professional Etsy templates)
 * → captures with html2canvas → embeds into jsPDF → downloads as PDF
 */

export interface ResumeData {
  niche: string;
  title: string;
  summary: string;
  imageUrl?: string | null;
  fontPair: { label: string; heading: string; body: string };
  pageCount?: 1 | 2 | 3;
}

type RGB = [number, number, number];

function getNicheTheme(niche: string): { accent: string; dark: string; light: string; rgb: RGB } {
  const themes = [
    { accent: '#8b5cf6', dark: '#1e1b4b', light: '#ede9fe', rgb: [139, 92, 246] as RGB },
    { accent: '#3b82f6', dark: '#1e3a5f', light: '#dbeafe', rgb: [59, 130, 246] as RGB },
    { accent: '#ef4444', dark: '#450a0a', light: '#fee2e2', rgb: [239, 68, 68] as RGB },
    { accent: '#14b8a6', dark: '#042f2e', light: '#ccfbf1', rgb: [20, 184, 166] as RGB },
    { accent: '#f97316', dark: '#431407', light: '#ffedd5', rgb: [249, 115, 22] as RGB },
  ];
  let hash = 0;
  for (const ch of niche) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return themes[hash % themes.length];
}

function buildAvatarHtml(imageUrl: string | null | undefined, accentColor: string): string {
  if (imageUrl) {
    return `<img src="${imageUrl}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid white;display:block;margin:0 auto 12px;" crossorigin="anonymous" />`;
  }
  return `
    <div style="width:100px;height:100px;border-radius:50%;background:${accentColor}33;border:4px solid white;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;overflow:hidden;">
      <svg viewBox="0 0 100 100" style="width:70px;height:70px;fill:${accentColor}88">
        <circle cx="50" cy="35" r="22"/>
        <ellipse cx="50" cy="90" rx="36" ry="28"/>
      </svg>
    </div>`;
}

function extraExperienceRows(niche: string, count: number): string {
  const extras = [
    `<div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <strong style="font-size:11px;">Junior ${niche}</strong>
        <span style="font-size:10px;color:#999;">2016 – 2018</span>
      </div>
      <div style="font-size:10px;color:#888;margin-bottom:6px;font-style:italic;">StartupXYZ · New York, NY</div>
      <div style="font-size:10px;color:#555;">Laid the creative foundation for a fast-growing startup; designed the brand identity that remains in use today.</div>
    </div>`,
    `<div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <strong style="font-size:11px;">Creative Intern</strong>
        <span style="font-size:10px;color:#999;">2014 – 2016</span>
      </div>
      <div style="font-size:10px;color:#888;margin-bottom:6px;font-style:italic;">BrightSpark Studio · Chicago, IL</div>
      <div style="font-size:10px;color:#555;">Supported senior designers on award-nominated client projects across print and digital media.</div>
    </div>`,
  ];
  return extras.slice(0, count).join('');
}

function extraPage(niche: string, theme: ReturnType<typeof getNicheTheme>, data: ResumeData, bodyFont: string): string {
  return `
    <div class="page" style="width:794px;min-height:1123px;background:#fff;display:flex;font-family:'${bodyFont}',sans-serif;position:relative;margin-bottom:8px;">
      <!-- sidebar -->
      <div style="width:240px;min-height:1123px;background:${theme.dark};padding:30px 20px;box-sizing:border-box;flex-shrink:0;">
        <div style="color:${theme.accent};font-size:10px;font-weight:700;letter-spacing:2px;margin-bottom:10px;text-transform:uppercase;">Certifications</div>
        ${[
          `Google Analytics Certified — 2023`,
          `HubSpot Content Marketing — 2022`,
          `Meta Blueprint: Digital Advertising — 2021`,
        ].map(c => `<div style="color:#ccc;font-size:9.5px;margin-bottom:8px;">✓ ${c}</div>`).join('')}

        <div style="color:${theme.accent};font-size:10px;font-weight:700;letter-spacing:2px;margin:20px 0 10px;text-transform:uppercase;">Languages</div>
        ${['English (Native)', 'Spanish (Professional)', 'French (Conversational)'].map(l => `<div style="color:#ccc;font-size:9.5px;margin-bottom:6px;">${l}</div>`).join('')}

        <div style="color:${theme.accent};font-size:10px;font-weight:700;letter-spacing:2px;margin:20px 0 10px;text-transform:uppercase;">Interests</div>
        ${['Photography', 'Generative Art', 'Mountaineering', 'Reading'].map(i => `<div style="color:#ccc;font-size:9.5px;margin-bottom:6px;">${i}</div>`).join('')}
      </div>

      <!-- main -->
      <div style="flex:1;padding:36px 30px;box-sizing:border-box;">
        <div style="border-bottom:2px solid ${theme.accent};padding-bottom:6px;margin-bottom:16px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:${theme.accent};text-transform:uppercase;">Key Projects & Achievements</div>
        </div>
        ${[
          { title: 'Global Brand Relaunch', desc: 'Led a full-scale rebrand for a $40B company across 12 international markets simultaneously, receiving a Cannes Lions Silver.' },
          { title: 'AI Design Integration Initiative', desc: 'Pioneered use of generative AI tools across the creative department, cutting average delivery time by 35% while improving output quality.' },
          { title: 'Award-Winning Campaign Series', desc: 'Conceptualised and produced a 3-part digital campaign that won D&AD Pencil, Clio Bronze, and 2× Webby Awards.' },
        ].map(p => `
          <div style="margin-bottom:18px;">
            <div style="font-size:11px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">${p.title}</div>
            <div style="font-size:10px;color:#555;line-height:1.6;">${p.desc}</div>
          </div>`).join('')}

        <div style="border-bottom:2px solid ${theme.accent};padding-bottom:6px;margin:24px 0 16px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:${theme.accent};text-transform:uppercase;">Speaking & Publications</div>
        </div>
        ${[
          `TEDx Talk — "The Future of AI-Powered Creativity"  |  2024`,
          `Forbes Contributor — Monthly column on ${niche} strategy  |  2022–Present`,
          `Harvard Business Review — "Design Systems at Scale"  |  2023`,
        ].map(s => `<div style="font-size:10px;color:#555;margin-bottom:8px;line-height:1.5;">• ${s}</div>`).join('')}
      </div>
    </div>`;
}

export function buildResumeHtml(data: ResumeData): string {
  const theme = getNicheTheme(data.niche);
  const headingFont = data.fontPair.heading;
  const bodyFont = data.fontPair.body;
  const extraExp = extraExperienceRows(data.niche, (data.pageCount ?? 1) - 1);

  const page1 = `
  <div class="page" style="width:794px;min-height:1123px;background:#fff;display:flex;font-family:'${bodyFont}',sans-serif;position:relative;margin-bottom:8px;">

    <!-- LEFT SIDEBAR -->
    <div style="width:240px;min-height:1123px;background:${theme.dark};padding:30px 20px 30px;box-sizing:border-box;flex-shrink:0;display:flex;flex-direction:column;">

      <!-- Photo -->
      ${buildAvatarHtml(data.imageUrl, theme.accent)}

      <!-- Name / Title -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-family:'${headingFont}',serif;font-size:18px;font-weight:700;color:#fff;line-height:1.2;">JOHN EVEREST</div>
        <div style="font-size:11px;color:${theme.accent};margin-top:4px;letter-spacing:1px;">${data.title}</div>
      </div>

      <!-- Contact -->
      <div style="margin-bottom:20px;">
        <div style="color:${theme.accent};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Contact</div>
        ${[
          { icon: '📍', text: 'My Address Line 1,<br>New York, NY' },
          { icon: '📞', text: '080 98 9999' },
          { icon: '✉', text: 'yourname@email.com' },
          { icon: '💼', text: 'linkedin.com/username' },
        ].map(c => `
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <span style="font-size:11px;margin-top:1px;">${c.icon}</span>
            <span style="font-size:10px;color:#ccc;line-height:1.4;">${c.text}</span>
          </div>`).join('')}
      </div>

      <!-- Expertise -->
      <div style="margin-bottom:20px;">
        <div style="color:${theme.accent};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Expertise</div>
        ${['Project Management','Public Speaking','Communication','Leadership','Teamwork','Strategic Planning'].map(s =>
          `<div style="font-size:10px;color:#ccc;margin-bottom:7px;">• ${s}</div>`).join('')}
      </div>

      <!-- Education -->
      <div>
        <div style="color:${theme.accent};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Education</div>
        ${[
          { degree: 'MASTER OF MANAGEMENT', school: 'University Name', loc: 'Illinois, IL', years: '2012 – 2014' },
          { degree: 'BACHELOR OF ARTS', school: 'University Name', loc: 'Illinois, IL', years: '2008 – 2012' },
        ].map(e => `
          <div style="margin-bottom:14px;">
            <div style="font-size:9.5px;font-weight:700;color:#fff;">${e.degree}</div>
            <div style="font-size:9px;color:${theme.accent};">${e.school}</div>
            <div style="font-size:9px;color:#999;">${e.loc}</div>
            <div style="font-size:9px;color:#777;">${e.years}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- RIGHT MAIN CONTENT -->
    <div style="flex:1;padding:36px 30px;box-sizing:border-box;background:#fff;">

      <!-- Summary Banner -->
      <div style="background:${theme.light};padding:14px 16px;border-left:4px solid ${theme.accent};margin-bottom:26px;border-radius:0 6px 6px 0;">
        <div style="font-size:10px;font-weight:700;color:${theme.accent};letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">${data.niche} Profile</div>
        <div style="font-size:10px;color:#555;line-height:1.7;">${data.summary}</div>
      </div>

      <!-- Professional Experience -->
      <div style="border-bottom:2px solid ${theme.accent};padding-bottom:6px;margin-bottom:16px;">
        <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:${theme.accent};text-transform:uppercase;">Professional Experiences</div>
      </div>

      ${[
        {
          role: `Senior ${data.niche}`,
          company: 'Acme Creative Agency',
          loc: 'New York, NY',
          date: '2020 – Present',
          bullets: [
            'Led cross-functional team of 12, delivering 30+ high-impact campaigns annually that exceeded KPIs by 27%.',
            'Or, You can explain as a list like this.',
            'Or, You can explain with a long text until reach the second row like this.',
          ],
        },
        {
          role: data.niche,
          company: 'BrightSpark Studio',
          loc: 'New York, NY',
          date: '2018 – 2020',
          bullets: [
            'Spearheaded brand identity projects for Fortune 500 clients; increased client retention by 40%.',
            'Or, You can explain as a list like this.',
            'Or, You can explain with a long text until reach the second row like this.',
          ],
        },
      ].map(exp => `
        <div style="margin-bottom:18px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;">
            <strong style="font-size:11px;color:#1a1a1a;">Job Position – ${exp.company}</strong>
            <span style="font-size:10px;color:#999;white-space:nowrap;margin-left:8px;">${exp.date}</span>
          </div>
          <div style="font-size:10px;color:#888;margin-bottom:6px;font-style:italic;">${exp.loc}</div>
          <div style="font-size:10px;color:#555;margin-bottom:6px;">Describe your responsibilities and achievements in terms of impact and results. Use examples but keep in short.</div>
          <ul style="margin:0;padding-left:16px;">
            ${exp.bullets.map(b => `<li style="font-size:10px;color:#555;margin-bottom:4px;line-height:1.5;">${b}</li>`).join('')}
          </ul>
        </div>`).join('')}

      ${extraExp}

      <!-- Skills bar section -->
      <div style="border-bottom:2px solid ${theme.accent};padding-bottom:6px;margin:20px 0 14px;">
        <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:${theme.accent};text-transform:uppercase;">Core Skills</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${['Adobe Creative Suite','Figma / Sketch','Brand Strategy','SEO Optimisation','Data Analytics','Team Leadership','Content Marketing','Public Speaking'].map(skill => `
          <div style="font-size:10px;color:#555;">• ${skill}</div>`).join('')}
      </div>
    </div>
  </div>`;

  const page3Extra = (data.pageCount ?? 1) >= 3 ? extraPage(data.niche, theme, data, bodyFont) : '';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:wght@400;700&family=${encodeURIComponent(bodyFont)}:wght@400;700&display=swap"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f1f5f9; }
  ul { list-style-type: disc; }
</style>
</head>
<body style="padding:10px;">
  ${page1}
  ${page3Extra}
</body>
</html>`;
}

/**
 * Renders the resume HTML in a hidden iframe, captures with html2canvas,
 * and returns the canvas element for PDF embedding.
 */
export async function renderHtmlToCanvases(html: string): Promise<HTMLCanvasElement[]> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;height:1123px;border:none;opacity:0;';
    document.body.appendChild(iframe);

    iframe.onload = async () => {
      try {
        const doc = iframe.contentDocument!;
        const pages = doc.querySelectorAll<HTMLElement>('.page');
        const canvases: HTMLCanvasElement[] = [];

        const html2canvas = (await import('html2canvas')).default;

        for (const page of pages) {
          const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123,
            logging: false,
          });
          canvases.push(canvas);
        }

        document.body.removeChild(iframe);
        resolve(canvases);
      } catch (err) {
        document.body.removeChild(iframe);
        reject(err);
      }
    };

    iframe.srcdoc = html;
  });
}

export async function generateResumePDF(data: ResumeData): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const html = buildResumeHtml(data);
  const canvases = await renderHtmlToCanvases(html);

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  canvases.forEach((canvas, i) => {
    if (i > 0) doc.addPage();
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    doc.addImage(imgData, 'JPEG', 0, 0, W, H);
  });

  const slug = data.niche.replace(/\s+/g, '-').toLowerCase();
  doc.save(`${slug}-resume-template.pdf`);
}
