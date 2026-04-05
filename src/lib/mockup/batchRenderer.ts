import { MOCKUP_TEMPLATES, MockupTemplate } from './templates';

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawText(ctx: CanvasRenderingContext2D, text: any) {
  ctx.font = `${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
  ctx.textAlign = text.align;
  ctx.textBaseline = 'middle';
  if (text.shadowBlur) {
    ctx.shadowColor = text.shadowColor || 'black';
    ctx.shadowBlur = text.shadowBlur;
  } else {
    ctx.shadowBlur = 0;
  }
  if (text.backgroundColor) {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = text.backgroundColor;
    const metrics = ctx.measureText(text.text);
    const pad = text.padding || 10;
    const tw = metrics.width + pad * 2;
    const th = text.fontSize + pad * 2;
    const tx = text.align === 'center' ? text.x - tw / 2 : text.x;
    const ty = text.y - th / 2;
    ctx.fillRect(tx, ty, tw, th);
    ctx.restore();
  }
  ctx.fillStyle = text.fill;
  ctx.fillText(text.text, text.x, text.y);
  ctx.shadowBlur = 0;
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

/** Create a 2000x2000 canvas and return its context */
function createCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = 2000;
  canvas.height = 2000;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

/** Draw product image at position with rotation, white border, and drop shadow */
function drawProductWithShadow(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number, cy: number,
  w: number, h: number,
  rotation: number = 0,
  borderWidth: number = 12
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);

  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 15;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-w / 2 - borderWidth, -h / 2 - borderWidth, w + borderWidth * 2, h + borderWidth * 2);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** Fill canvas with wood-grain texture */
function drawWoodBackground(ctx: CanvasRenderingContext2D, baseColor: string, grainColor: string) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 2000, 2000);
  ctx.globalAlpha = 0.05;
  for (let y = 0; y < 2000; y += 6) {
    ctx.strokeStyle = y % 18 === 0 ? grainColor : baseColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y * 0.012) * 4);
    ctx.lineTo(2000, y + Math.sin(y * 0.012 + 2) * 4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ============================================================
// SPECIAL TEMPLATE RENDERERS
// ============================================================

/** #1 HERO — Wood bg, tilted product, "INSTANT DOWNLOAD" badge, title, pen */
function renderHero(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement, title: string, subtitle: string, fileFormats: string, paperSizes: string): string {
  // Wood gradient
  const bg = ctx.createLinearGradient(0, 0, 2000, 2000);
  bg.addColorStop(0, '#f5f0eb');
  bg.addColorStop(0.5, '#ece5dd');
  bg.addColorStop(1, '#ddd5ca');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 2000, 2000);
  drawWoodBackground(ctx, '#ece5dd', '#a09080');

  // "INSTANT DOWNLOAD" badge
  ctx.font = 'bold 36px system-ui, sans-serif';
  const bw = ctx.measureText('INSTANT DOWNLOAD').width + 60;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;
  ctx.strokeRect(1000 - bw / 2, 90, bw, 64);
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('INSTANT DOWNLOAD', 1000, 122);

  // Title
  ctx.fillStyle = '#2c2c2c';
  ctx.font = '900 110px Georgia, serif';
  ctx.fillText(title.toUpperCase(), 1000, 270);

  // Subtitle — uses dynamic paperSizes
  ctx.fillStyle = '#666';
  ctx.font = '600 30px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(paperSizes + ' · PRINTABLE ' + fileFormats + ' TEMPLATE', 1000, 370);

  // Product — perfectly centered and even larger
  const pw = 1500;
  const ph = pw * (img.height / img.width);
  drawProductWithShadow(ctx, img, 1000, 1000, pw, ph, -2);

  // Pen — positioned relative to the new product size
  ctx.save();
  ctx.translate(150, 1000);
  ctx.rotate((-15 * Math.PI) / 180);
  ctx.fillStyle = '#2c2c2c';
  ctx.fillRect(-7, -300, 14, 600);
  ctx.beginPath();
  ctx.moveTo(-7, 300); ctx.lineTo(7, 300); ctx.lineTo(0, 340); ctx.closePath();
  ctx.fillStyle = '#888'; ctx.fill();
  ctx.restore();

  // Bottom callout — centered below the product
  ctx.fillStyle = '#888';
  ctx.font = '700 42px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SUNDAY & MONDAY', 1000, 1750);
  ctx.fillStyle = '#2c2c2c';
  ctx.font = '900 72px Georgia, serif';
  ctx.fillText('INCLUDE', 1000, 1830);

  // Brand
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.font = '600 48px system-ui';
  ctx.textAlign = 'right';
  ctx.fillText('DaisyFlow Studio', 1940, 1940);

  applyGlobalWatermark(ctx);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/** #2 STACKED — Multiple copies of product fanned out, title at top */
function renderStacked(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement, title: string): string {
  // Light grey/marble bg
  const bg = ctx.createLinearGradient(0, 0, 2000, 2000);
  bg.addColorStop(0, '#f8f8f8');
  bg.addColorStop(1, '#e8e8e8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 2000, 2000);

  // Subtle marble noise
  ctx.globalAlpha = 0.02;
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = '#888';
    ctx.fillRect(Math.random() * 2000, Math.random() * 2000, 2, 2);
  }
  ctx.globalAlpha = 1;

  // Title
  ctx.fillStyle = '#2c2c2c';
  ctx.font = '900 80px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PRINTABLE ' + title.toUpperCase(), 1000, 120);

  // Subtitle
  ctx.fillStyle = '#666';
  ctx.font = '600 36px system-ui, sans-serif';
  ctx.fillText('INSTANT DOWNLOAD', 1000, 200);

  // Draw 3 copies stacked with offsets
  const pw = 1050;
  const ph = pw * (img.height / img.width);
  const centerX = 1000;
  const centerY = 380 + ph / 2;

  // Back page (offset top-left)
  drawProductWithShadow(ctx, img, centerX - 60, centerY - 50, pw, ph, -2, 8);
  // Middle page
  drawProductWithShadow(ctx, img, centerX - 25, centerY - 20, pw, ph, -1, 8);
  // Front page
  drawProductWithShadow(ctx, img, centerX + 15, centerY + 10, pw, ph, 1, 8);

  applyGlobalWatermark(ctx);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/** #3 FEATURES — Lavender bg, product center, features callout text around */
function renderFeatures(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement, title: string, featuresText: string): string {
  // Lavender/soft purple gradient
  const bg = ctx.createLinearGradient(0, 0, 2000, 2000);
  bg.addColorStop(0, '#f0e6f6');
  bg.addColorStop(0.5, '#e8daf0');
  bg.addColorStop(1, '#dfd0ea');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 2000, 2000);

  // "Features:" script title
  ctx.fillStyle = '#3d3d3d';
  ctx.font = 'italic 900 100px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Features:', 1000, 100);

  // Product image center
  const pw = 850;
  const ph = pw * (img.height / img.width);
  drawProductWithShadow(ctx, img, 1000, 450 + ph / 2, pw, ph, 0, 6);

  // Parse features and draw around the product
  const features = featuresText.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));
  const cleanFeatures = features.map(f => f.replace(/^[\-\*]\s*/, '').trim());
  
  // Left side features
  const leftFeatures = cleanFeatures.slice(0, Math.ceil(cleanFeatures.length / 2));
  const rightFeatures = cleanFeatures.slice(Math.ceil(cleanFeatures.length / 2));

  ctx.font = '700 32px system-ui, sans-serif';
  ctx.textAlign = 'left';
  
  leftFeatures.forEach((f, i) => {
    const fy = 250 + i * 180;
    // Bullet dot
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(80, fy, 12, 0, Math.PI * 2);
    ctx.fill();
    // Text
    ctx.fillStyle = '#3d3d3d';
    ctx.font = '700 30px system-ui, sans-serif';
    drawWrappedText(ctx, f.toUpperCase(), 110, fy, 420, 36);
  });

  ctx.textAlign = 'right';
  rightFeatures.forEach((f, i) => {
    const fy = 250 + i * 180;
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(1920, fy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3d3d3d';
    ctx.font = '700 30px system-ui, sans-serif';
    drawWrappedText(ctx, f.toUpperCase(), 1500, fy, 400, 36);
  });

  applyGlobalWatermark(ctx);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/** #4 LIFESTYLE — Product on desk-like bg, large script overlay, info bar */
async function renderLifestyle(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement, title: string, bgUrl: string, paperSizes: string): Promise<string> {
  // Try to load bg image, fallback to gradient
  try {
    const bgImg = await loadImage(bgUrl);
    const s = Math.max(2000 / bgImg.width, 2000 / bgImg.height);
    ctx.drawImage(bgImg, 1000 - bgImg.width * s / 2, 1000 - bgImg.height * s / 2, bgImg.width * s, bgImg.height * s);
  } catch {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 2000, 2000);
  }

  // Semi-transparent overlay for readability
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(0, 0, 2000, 2000);

  // Top info bar — dynamic sizes
  ctx.fillStyle = '#3d3d3d';
  ctx.font = '700 36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('1 PAGE  |  ' + paperSizes + '  |  FREEBIE', 1000, 60);

  // Product tilted on desk
  const pw = 1100;
  const ph = pw * (img.height / img.width);
  drawProductWithShadow(ctx, img, 900, 400 + ph / 2, pw, ph, 5, 10);

  // Large script overlay text
  ctx.fillStyle = '#2c2c2c';
  ctx.font = 'italic 900 140px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.85;
  ctx.fillText('Week at a Glance', 1000, 1600);
  ctx.globalAlpha = 1;

  // "UNDATED" badge bottom-right
  ctx.fillStyle = '#2c2c2c';
  ctx.font = '900 60px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('UNDATED', 1900, 1900);

  applyGlobalWatermark(ctx);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/** #5 FLORAL — Pink wood bg, flowers decoration, product flat, title+specs right */
function renderFloral(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement, title: string, fileFormats: string, paperSizes: string): string {
  // Pink wood background
  drawWoodBackground(ctx, '#d4848e', '#b06070');
  // Slightly brighter pink overlay
  const bg = ctx.createLinearGradient(0, 0, 2000, 2000);
  bg.addColorStop(0, 'rgba(210,130,140,0.6)');
  bg.addColorStop(1, 'rgba(180,100,110,0.6)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 2000, 2000);

  // Decorative flower circles (top-left and bottom-right)
  const drawFlowers = (cx: number, cy: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const r = 30 + Math.random() * 20;
      const fx = cx + Math.cos(angle) * (60 + Math.random() * 40);
      const fy = cy + Math.sin(angle) * (60 + Math.random() * 40);
      ctx.beginPath();
      ctx.arc(fx, fy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.3})`;
      ctx.fill();
    }
  };
  drawFlowers(200, 200, 8);
  drawFlowers(1800, 200, 6);
  drawFlowers(200, 1800, 6);
  drawFlowers(1800, 1800, 8);

  // Product — flat, left side
  const pw = 900;
  const ph = pw * (img.height / img.width);
  drawProductWithShadow(ctx, img, 560, 1000, pw, ph, -2, 10);

  // Right side text
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.font = 'italic 700 80px Georgia, serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 1880, 700);

  ctx.font = 'italic 500 48px Georgia, serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('Printable & digital', 1880, 800);

  ctx.font = '900 56px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(fileFormats, 1880, 1100);
  ctx.fillText('SIZE ' + paperSizes, 1880, 1200);

  applyGlobalWatermark(ctx);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/** #6 CLEAN DESK — White bg, tilted product, elegant "Printable & Editable" script overlay */
async function renderCleanDesk(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement, title: string, bgUrl: string): Promise<string> {
  // Try actual bg, fallback to clean white
  try {
    const bgImg = await loadImage(bgUrl);
    const s = Math.max(2000 / bgImg.width, 2000 / bgImg.height);
    ctx.drawImage(bgImg, 1000 - bgImg.width * s / 2, 1000 - bgImg.height * s / 2, bgImg.width * s, bgImg.height * s);
  } catch {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 2000, 2000);
  }

  // White vignette overlay
  const vig = ctx.createRadialGradient(1000, 1000, 200, 1000, 1000, 1400);
  vig.addColorStop(0, 'rgba(255,255,255,0)');
  vig.addColorStop(1, 'rgba(255,255,255,0.5)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 2000, 2000);

  // Product tilted
  const pw = 1100;
  const ph = pw * (img.height / img.width);
  drawProductWithShadow(ctx, img, 950, 380 + ph / 2, pw, ph, 8, 10);

  // "Printable & Editable" large script
  ctx.fillStyle = '#2c2c2c';
  ctx.font = 'italic 900 130px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Printable &', 950, 1550);
  ctx.fillText('Editable', 950, 1700);

  applyGlobalWatermark(ctx);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/** #7 SPLIT COLOR — Two-tone pastel bg, product + file format list + specs */
async function renderSplitColor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement, title: string, bgUrl: string, fileFormats: string, paperSizes: string): Promise<string> {
  // Two-tone split background (mint left, pink right)
  ctx.fillStyle = '#b8d8d0'; // Mint
  ctx.fillRect(0, 0, 1000, 2000);
  ctx.fillStyle = '#f0c0c8'; // Pink
  ctx.fillRect(1000, 0, 1000, 2000);

  // Try bg image overlay
  try {
    const bgImg = await loadImage(bgUrl);
    const s = Math.max(2000 / bgImg.width, 2000 / bgImg.height);
    ctx.globalAlpha = 0.3;
    ctx.drawImage(bgImg, 1000 - bgImg.width * s / 2, 1000 - bgImg.height * s / 2, bgImg.width * s, bgImg.height * s);
    ctx.globalAlpha = 1;
  } catch { /* no bg overlay */ }

  // File format list (left side) — dynamic
  ctx.fillStyle = '#3d3d3d';
  ctx.font = '800 52px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const formats = fileFormats.split(/[,&\/]/).map(f => f.trim().toUpperCase()).filter(Boolean);
  formats.forEach((f, i) => {
    ctx.fillText(f, 80, 500 + i * 100);
  });

  // Product — centered/right
  const pw = 1000;
  const ph = pw * (img.height / img.width);
  drawProductWithShadow(ctx, img, 1050, 400 + ph / 2, pw, ph, 3, 8);

  // Right side title & specs
  ctx.textAlign = 'right';
  ctx.fillStyle = '#3d3d3d';
  ctx.font = 'italic 700 64px Georgia, serif';
  ctx.fillText(title, 1900, 1500);

  ctx.font = '600 36px system-ui, sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText('PLANNER WITH TO DO', 1900, 1580);

  ctx.font = '800 48px system-ui, sans-serif';
  ctx.fillStyle = '#e76f51';
  ctx.fillText('300 dpi', 1900, 1700);

  ctx.fillStyle = '#3d3d3d';
  ctx.fillText('2000x2000', 1900, 1780);

  applyGlobalWatermark(ctx);
  return canvas.toDataURL('image/jpeg', 0.95);
}

// ============================================================
// MAIN RENDER DISPATCHER
// ============================================================

async function renderSingleMockup(
  template: MockupTemplate,
  productImg: HTMLImageElement,
  title?: string,
  subtitle?: string,
  featuresText?: string,
  fileFormats?: string,
  paperSizes?: string
): Promise<string> {
  const [canvas, ctx] = createCanvas();
  const t = title || 'Weekly Planner';
  const sub = subtitle || 'A4 · A5 · LETTER & HALF · PRINTABLE PDF TEMPLATE';
  const fmt = fileFormats || 'PDF';
  const sizes = paperSizes || 'A4 & LETTER';

  switch (template.templateType) {
    case 'hero':
      return renderHero(ctx, canvas, productImg, t, sub, fmt, sizes);

    case 'stacked':
      return renderStacked(ctx, canvas, productImg, t);

    case 'features':
      return renderFeatures(ctx, canvas, productImg, t, featuresText || '');

    case 'lifestyle':
      return renderLifestyle(ctx, canvas, productImg, t, template.backgroundUrl, sizes);

    case 'floral':
      return renderFloral(ctx, canvas, productImg, t, fmt, sizes);

    case 'cleandesk':
      return renderCleanDesk(ctx, canvas, productImg, t, template.backgroundUrl);

    case 'splitcolor':
      return renderSplitColor(ctx, canvas, productImg, t, template.backgroundUrl, fmt, sizes);

    case 'standard':
    default:
      return renderStandardMockup(ctx, canvas, template, productImg);
  }
}

function applyGlobalWatermark(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.translate(1000, 1000);
  ctx.rotate((-25 * Math.PI) / 180);
  ctx.fillStyle = 'rgba(100, 90, 90, 0.12)';
  ctx.shadowColor = 'rgba(255,255,255,0.5)';
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 130px system-ui, sans-serif';
  ctx.fillText('DaisyFlow Studio', 0, 0);
  ctx.restore();
}

/** Standard iPad-in-background mockup (templates #8-10) */
async function renderStandardMockup(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  template: MockupTemplate,
  productImg: HTMLImageElement
): Promise<string> {
  // Background
  try {
    const bgImg = await loadImage(template.backgroundUrl);
    const scale = Math.max(2000 / bgImg.width, 2000 / bgImg.height);
    const w = bgImg.width * scale;
    const h = bgImg.height * scale;
    ctx.drawImage(bgImg, 1000 - w / 2, 1000 - h / 2, w, h);
  } catch {
    const grad = ctx.createLinearGradient(0, 0, 2000, 2000);
    grad.addColorStop(0, '#fdfbfb');
    grad.addColorStop(1, '#ebedee');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2000, 2000);
  }

  // iPad Frame
  ctx.fillStyle = template.frame.color;
  drawRoundedRect(ctx, template.frame.x, template.frame.y, template.frame.width, template.frame.height, template.frame.radius);
  ctx.fill();
  ctx.lineWidth = template.frame.borderSize;
  ctx.strokeStyle = '#333';
  ctx.stroke();

  ctx.fillStyle = '#fff';
  drawRoundedRect(ctx, template.frame.x + 4, template.frame.y + 4, template.frame.width - 8, template.frame.height - 8, template.frame.radius - 2);
  ctx.fill();

  // Screen
  ctx.save();
  drawRoundedRect(ctx, template.screen.x, template.screen.y, template.screen.width, template.screen.height, template.screen.radius);
  ctx.clip();
  const imgScale = Math.max(template.screen.width / productImg.width, template.screen.height / productImg.height);
  const pw = productImg.width * imgScale;
  const ph = productImg.height * imgScale;
  ctx.drawImage(productImg, template.screen.x + template.screen.width / 2 - pw / 2, template.screen.y + template.screen.height / 2 - ph / 2, pw, ph);
  ctx.restore();

  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  drawRoundedRect(ctx, template.screen.x, template.screen.y, template.screen.width, template.screen.height, template.screen.radius);
  ctx.stroke();

  template.texts.forEach(t => drawText(ctx, t));

  if (template.showBestSeller) {
    const bx = 1600, by = 1600, br = 150;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(bx, by, br - 10, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.stroke();
    drawText(ctx, { text: 'BEST', x: bx, y: by - 30, fontSize: 50, fontFamily: 'serif', fontWeight: 'bold', align: 'center', fill: '#fff' });
    drawText(ctx, { text: 'SELLER', x: bx, y: by + 30, fontSize: 50, fontFamily: 'serif', fontWeight: 'bold', align: 'center', fill: '#fff' });
  }

  applyGlobalWatermark(ctx);
  return canvas.toDataURL('image/jpeg', 0.9);
}

// ============================================================
// BATCH GENERATOR
// ============================================================

export async function generateBatchMockups(
  productImageSrc: string,
  infographicText: string,
  youWillGetText: string,
  allImageSrcs?: string[],
  showcaseTitle?: string,
  showcaseSubtitle?: string,
  fileFormats?: string,
  paperSizes?: string,
  onProgress?: (index: number, total: number) => void
): Promise<string[]> {
  const generated: string[] = [];
  const productImg = await loadImage(productImageSrc);
  const hasShowcase = (allImageSrcs && allImageSrcs.length >= 3);
  const totalSteps = MOCKUP_TEMPLATES.length + 2 + (hasShowcase ? 1 : 0);

  // 1. Generate all 10 mockups
  for (let i = 0; i < MOCKUP_TEMPLATES.length; i++) {
    const template = MOCKUP_TEMPLATES[i];
    try {
      let templateImg = productImg;
      if (template.templateType === 'hero' && allImageSrcs && allImageSrcs.length > 0) {
        // Use a random image from the uploaded ones for the hero
        const randomSrc = allImageSrcs[Math.floor(Math.random() * allImageSrcs.length)];
        templateImg = await loadImage(randomSrc);
      }
      
      const dataUrl = await renderSingleMockup(template, templateImg, showcaseTitle, showcaseSubtitle, infographicText, fileFormats, paperSizes);
      generated.push(dataUrl);
    } catch (e) {
      console.error(`Failed to generate mockup ${i + 1}`, e);
    }
    if (onProgress) onProgress(i + 1, totalSteps);
  }

  // 2. Beautiful infographic helper
  async function renderBeautifulInfographic(headerText: string, contentText: string, headerColor: string) {
    const infoCanvas = document.createElement('canvas');
    infoCanvas.width = 2000;
    infoCanvas.height = 2000;
    const ictx = infoCanvas.getContext('2d');
    if (!ictx) throw new Error('Cannot get 2d context for infographic');

    const bgImg = await loadImage('/mockups/bg_info.png');
    ictx.drawImage(bgImg, 0, 0, 2000, 2000);

    ictx.shadowColor = 'rgba(0,0,0,0.2)';
    ictx.shadowBlur = 40;
    ictx.shadowOffsetY = 20;

    const pw2 = 850;
    const imgScale2 = pw2 / productImg.width;
    const ph2 = productImg.height * imgScale2;
    const px = 100;
    const py = 1000 - ph2 / 2;

    const border = 24;
    ictx.fillStyle = '#1c1c1e';
    drawRoundedRect(ictx, px - border, py - border, pw2 + border * 2, ph2 + border * 2, 36);
    ictx.fill();
    ictx.shadowBlur = 0;
    ictx.shadowOffsetY = 0;

    ictx.fillStyle = '#fff';
    drawRoundedRect(ictx, px - 4, py - 4, pw2 + 8, ph2 + 8, 12);
    ictx.fill();

    ictx.save();
    drawRoundedRect(ictx, px, py, pw2, ph2, 8);
    ictx.clip();
    ictx.drawImage(productImg, px, py, pw2, ph2);
    ictx.restore();

    // Text on right side
    const tx = 1180;
    const headerY = 280;

    drawText(ictx, {
      text: headerText, x: tx, y: headerY, fontSize: 64,
      fontFamily: '"SF Pro Display", system-ui, sans-serif',
      fontWeight: '900', fill: headerColor, align: 'left'
    });

    ictx.fillStyle = headerColor + '80';
    ictx.beginPath();
    ictx.roundRect(tx, headerY + 40, 200, 8, 4);
    ictx.fill();

    ictx.font = '500 42px "SF Pro Text", system-ui, sans-serif';
    ictx.fillStyle = '#4a4a4a';
    ictx.textAlign = 'left';
    ictx.textBaseline = 'top';

    const lines = contentText.split('\n');
    let currentY = headerY + 120;
    const lineHeight = 80;
    const contentMaxWidth = 720;

    for (const line of lines) {
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        ictx.fillStyle = headerColor;
        ictx.font = '900 42px system-ui';
        ictx.fillText('✦', tx, currentY);
        ictx.fillStyle = '#4a4a4a';
        ictx.font = '500 42px "SF Pro Text", system-ui, sans-serif';
        drawWrappedText(ictx, line.replace(/^[\-\*]\s*/, ''), tx + 60, currentY, contentMaxWidth - 60, lineHeight);
      } else {
        ictx.fillStyle = '#333';
        ictx.font = 'bold 42px "SF Pro Text", system-ui, sans-serif';
        drawWrappedText(ictx, line, tx, currentY, contentMaxWidth, lineHeight);
      }
      const rows = Math.ceil(ictx.measureText(line).width / contentMaxWidth) || 1;
      currentY += (lineHeight * rows) + 10;
    }

    return infoCanvas.toDataURL('image/jpeg', 0.95);
  }

  // 3. "WHY CHOOSE THIS?" Infographic (11th)
  try {
    const dataUrl = await renderBeautifulInfographic('WHY CHOOSE THIS?', infographicText, '#e76f51');
    generated.push(dataUrl);
  } catch (e) {
    console.error('Failed to generate features infographic', e);
  }

  // 4. "WHAT YOU WILL GET" Infographic (12th)
  try {
    const dataUrl = await renderBeautifulInfographic('WHAT YOU WILL GET', youWillGetText, '#8b5cf6');
    generated.push(dataUrl);
  } catch (e) {
    console.error('Failed to generate what-you-get infographic', e);
  }

  // 5. Showcase (13th) — requires 3+ uploaded images
  if (hasShowcase && allImageSrcs) {
    try {
      const dataUrl = await renderShowcaseMockup(allImageSrcs, showcaseTitle || 'All-In-One Digital Planner', showcaseSubtitle || '2026 - LANDSCAPE');
      generated.push(dataUrl);
    } catch (e) {
      console.error('Failed to generate showcase mockup', e);
    }
  }

  if (onProgress) onProgress(totalSteps, totalSteps);
  return generated;
}

/** Multi-iPad fan/cascade showcase mockup */
async function renderShowcaseMockup(imageSrcs: string[], title: string, subtitle: string): Promise<string> {
  const [canvas, ctx] = createCanvas();

  const bgGrad = ctx.createLinearGradient(0, 0, 2000, 2000);
  bgGrad.addColorStop(0, '#1a1a2e');
  bgGrad.addColorStop(0.5, '#16213e');
  bgGrad.addColorStop(1, '#0f3460');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 2000, 2000);

  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
    ctx.fillRect(Math.random() * 2000, Math.random() * 2000, 1, 1);
  }
  ctx.globalAlpha = 1;

  const srcs = imageSrcs.slice(0, 5);
  const imgs: HTMLImageElement[] = [];
  for (const src of srcs) {
    try { imgs.push(await loadImage(src)); } catch { /* skip */ }
  }
  if (imgs.length === 0) throw new Error('No images loaded for showcase');

  drawText(ctx, { text: title, x: 1000, y: 150, fontSize: 80, fontFamily: 'Georgia, serif', fontWeight: 'bold', fill: '#fff', align: 'center', shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.5)' });
  drawText(ctx, { text: subtitle, x: 1000, y: 240, fontSize: 42, fontFamily: 'system-ui', fontWeight: '600', fill: 'rgba(255,255,255,0.7)', align: 'center' });

  const iPadW = 660, iPadH = 480, fb = 20, fr = 24;
  type Pos = { x: number; y: number; rot: number; s: number; z: number };
  let positions: Pos[];

  if (imgs.length >= 5) {
    positions = [
      { x: 100, y: 520, rot: -12, s: 0.88, z: 1 },
      { x: 360, y: 420, rot: -5, s: 0.94, z: 2 },
      { x: 630, y: 380, rot: 0, s: 1.0, z: 5 },
      { x: 900, y: 420, rot: 5, s: 0.94, z: 3 },
      { x: 1160, y: 520, rot: 12, s: 0.88, z: 4 },
    ];
  } else if (imgs.length === 4) {
    positions = [
      { x: 150, y: 500, rot: -10, s: 0.88, z: 1 },
      { x: 440, y: 400, rot: -3, s: 0.95, z: 2 },
      { x: 720, y: 380, rot: 3, s: 1.0, z: 4 },
      { x: 1000, y: 460, rot: 9, s: 0.90, z: 3 },
    ];
  } else {
    positions = [
      { x: 200, y: 480, rot: -8, s: 0.92, z: 1 },
      { x: 570, y: 380, rot: 0, s: 1.0, z: 3 },
      { x: 940, y: 480, rot: 8, s: 0.92, z: 2 },
    ];
  }

  const sorted = positions.map((p, i) => ({ ...p, idx: i })).sort((a, b) => a.z - b.z);

  for (const pos of sorted) {
    if (pos.idx >= imgs.length) continue;
    const img = imgs[pos.idx];
    const w = iPadW * pos.s, h = iPadH * pos.s, border = fb * pos.s;

    ctx.save();
    ctx.translate(pos.x + w / 2, pos.y + h / 2);
    ctx.rotate((pos.rot * Math.PI) / 180);

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = '#1c1c1e';
    drawRoundedRect(ctx, -w / 2 - border, -h / 2 - border, w + border * 2, h + border * 2, fr * pos.s);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = '#fff';
    drawRoundedRect(ctx, -w / 2 - 3, -h / 2 - 3, w + 6, h + 6, (fr - 4) * pos.s);
    ctx.fill();

    ctx.save();
    drawRoundedRect(ctx, -w / 2, -h / 2, w, h, (fr - 6) * pos.s);
    ctx.clip();
    const is = Math.max(w / img.width, h / img.height);
    ctx.drawImage(img, -img.width * is / 2, -img.height * is / 2, img.width * is, img.height * is);
    ctx.restore();
    ctx.restore();
  }

  const barY = 1680;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, barY, 2000, 320);
  drawText(ctx, { text: 'GOOGLE & APPLE CALENDAR & REMINDER INTEGRATION', x: 1000, y: barY + 80, fontSize: 34, fontFamily: 'system-ui', fontWeight: '600', fill: 'rgba(255,255,255,0.8)', align: 'center' });
  drawText(ctx, { text: 'YEARLY  ·  MONTHLY  ·  WEEKLY  ·  DAILY PLANNER', x: 1000, y: barY + 140, fontSize: 34, fontFamily: 'system-ui', fontWeight: '600', fill: 'rgba(255,255,255,0.8)', align: 'center' });

  applyGlobalWatermark(ctx);
  return canvas.toDataURL('image/jpeg', 0.95);
}
