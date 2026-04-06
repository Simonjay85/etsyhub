import { NextRequest, NextResponse } from 'next/server';

/**
 * Etsy title sanitizer — applied to every generated title.
 *
 * Rules enforced:
 * 1. Remove forbidden characters: $ ^ ` (backtick)
 * 2. Convert any run of > 3 consecutive ALL-CAPS words to Title Case
 *    A "word" is 2+ uppercase letters. Single-letter caps (I, A) are ignored.
 */
function sanitizeEtsyTitle(title: string): string {
  // 1. Strip forbidden chars
  let t = title.replace(/[$^`]/g, '');

  // 2. Split on common Etsy title separators, fix each segment independently
  //    so we don't turn short caps like "PDF" or "SVG" into "Pdf" / "Svg"
  const SEP = /(\s*\|\s*|\s*-\s*|,\s*)/;
  const segments = t.split(SEP);

  const fixed = segments.map((seg) => {
    // Count ALL-CAPS words (2+ uppercase letters, no lowercase)
    const words = seg.trim().split(/\s+/);
    const capsWords = words.filter((w) => /^[A-Z]{2,}$/.test(w));

    if (capsWords.length <= 3) return seg; // compliant, leave alone

    // > 3 all-caps words: convert them all to Title Case
    return words
      .map((w) => (/^[A-Z]{2,}$/.test(w) ? w.charAt(0) + w.slice(1).toLowerCase() : w))
      .join(' ');
  });

  return fixed.join('');
}

export async function POST(req: NextRequest) {
  try {
    const { keyword, referenceInfo } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(mockFallback(keyword));
    }

    const referenceDirective = referenceInfo?.trim()
      ? '\nCRUCIAL INSTRUCTION: The user has provided Reference Information below. You MUST deeply analyze and extract the actual features, contents, structure, and details from this reference. Base the ENTIRE listing generation on the facts and features mentioned in the Reference Information, but completely rewrite it in your own highly-converting Etsy SEO style.\n\n### REFERENCE CLONE INFORMATION ###\n' +
        referenceInfo +
        '\n### END REFERENCE ###\n'
      : '';

    const titleRules =
      'Build a heavily optimized Etsy SEO title (135-140 chars, NEVER shorter than 135). ' +
      'RULES: ' +
      '1) Front-load the exact main keyword at the very start. ' +
      '2) Add 5-8 strong long-tail phrases separated by | or commas or -. ' +
      '3) Keep adding phrases until the string is very close to 140 chars. A title under 130 chars is REJECTED. ' +
      '4) Use 1-2 emojis like \u2728 or \ud83d\udc96. ' +
      '5) ETSY ALL-CAPS RULE: Do NOT use more than 3 consecutive words in ALL CAPS. Use Title Case. ' +
      '6) FORBIDDEN CHARACTERS: Never use $ ^ ` (backtick). ' +
      '7) SYNONYM DIVERSITY (CRITICAL): Every time you generate a title you MUST use DIFFERENT synonym phrases — rotate among alternatives like: ' +
      '"Instant Download" / "Digital Download" / "Printable File" / "Editable Template", ' +
      '"Goodnotes Compatible" / "iPad Planner" / "Notability Ready", ' +
      '"Aesthetic Design" / "Minimalist Style" / "Modern Layout" / "Boho Chic", ' +
      '"Productivity Tool" / "Daily Organizer" / "Life Planner" / "Goal Tracker", ' +
      '"Canva Template" / "Fully Editable" / "Customizable" / "Easy to Edit", ' +
      '"Gift for Her" / "Self Care Planner" / "Wellness Tracker" / "Mindful Living". ' +
      'NEVER reuse the same phrase combination as before. Mix and match creatively every single generation.';

    const systemPrompt =
      'You are a top-tier Etsy SEO expert and professional copywriter.\n' +
      'Your objective is to generate a highly optimized, comprehensive product listing based on the user keyword.' +
      referenceDirective +
      '\nReturn ONLY a valid JSON object with exact structure:\n' +
      '{\n' +
      '  "title": "' + titleRules + '",\n' +
      '  "description": "Expert Etsy copywriter for feminine digital products. Write a VERY LONG, EXHAUSTIVE listing description (1500+ words). Tone: feminine, soft premium, deeply helpful. Structure: 1) Hook & Opening paragraph 2) WHAT YOU\'LL RECEIVE (detailed breakdown) 3) DEEP DIVE FEATURES (bullet point every single small detail) 4) WHY YOU\'LL LOVE IT (emotional benefits) 5) PERFECT FOR (target audience scenarios) 6) HOW IT WORKS (step-by-step guide) 7) COMPATIBILITY 8) FAQ (make up 3 common questions) 9) IMPORTANT DETAILS 10) PLEASE NOTE 11) Closing line. Rules: SEO-friendly, highly skimmable but very lengthy, buyer-confident, explicitly state digital-only policy and no-refund. Every bullet MUST start with a relevant emoji. Expand heavily on every section.",\n' +
      '  "hashtags": "Exactly 13 highly relevant Etsy tags separated by commas. Each tag must be 20 characters or less."\n' +
      '}\n' +
      'Do not include any other text, markdown blocks, or explanations.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content:
              'Keyword: ' +
              keyword +
              '\n\n[Variation seed: ' +
              Math.random().toString(36).slice(2, 8) +
              ' — generate a UNIQUE title with DIFFERENT synonym phrases than any previous response. Rotate your word choices creatively.]',
          },
        ],
        temperature: 1.1,
        top_p: 0.95,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error: ' + response.statusText);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;
    const parsed = JSON.parse(raw);

    // Sanitize title before returning
    if (typeof parsed.title === 'string') {
      parsed.title = sanitizeEtsyTitle(parsed.title);
    }

    return NextResponse.json({ ...parsed, ok: true });
  } catch (err) {
    console.error('[seo-generate] error:', err);
    return NextResponse.json({ error: 'Failed to generate SEO listing' }, { status: 500 });
  }
}

function mockFallback(keyword: string) {
  const kw = keyword.trim();
  const kwLower = kw.toLowerCase();
  const kwSlug = kwLower.replace(/ /g, '');
  // Title Case keyword — avoids the all-caps Etsy error
  const kwTitle = kw.replace(/\b\w/g, (c) => c.toUpperCase());

  const fallbackPhrases = [
    'Editable Canva Template',
    'Instant Digital Download',
    'Aesthetic Minimalist Design',
    'Printable PDF',
    'Modern Layout',
    'Self Care Planner',
    'Productivity Tool',
    'Goodnotes iPad',
    'Notability Compatible',
    'Goal Setting Guide',
    'Undated Organizer',
    'Daily Weekly Monthly',
    'Print at Home',
    'Bonus Stickers Included'
  ];
  // Shuffle phrases to get a unique title each run even without OpenAI
  const shuffled = fallbackPhrases.sort(() => 0.5 - Math.random());
  const titleParts = [kwTitle, ...shuffled];
  let title = '';
  for (const part of titleParts) {
    const next = title ? title + ' | ' + part : '\u2728 ' + part;
    if (next.length > 140) break;
    title = next;
  }
  if (title.length < 135) {
    const pad = ' \ud83d\udc96 Best Seller';
    if ((title + pad).length <= 140) title += pad;
  }
  title = sanitizeEtsyTitle(title);

  const description =
    '\ud83c\udf1f WELCOME TO OUR SHOP \u2014 THANK YOU FOR STOPPING BY! \ud83c\udf1f\n\n' +
    'Are you searching for the perfect ' + kw + ' to transform your productivity, organization, and daily planning routine? ' +
    "You've come to the right place! Our premium " + kw + ' has been thoughtfully designed with both beauty and functionality in mind.\n\n' +
    '\u2501'.repeat(30) + '\n\n' +
    '\ud83d\udce6 WHAT YOU\'LL RECEIVE:\n\n' +
    '\ud83d\udcc4 1x Fully Editable Canva Template\n' +
    '\ud83d\udcc4 1x High Resolution PDF Digital Download\n' +
    '\ud83d\udcc4 1x Step-by-Step Instruction Guide\n' +
    '\ud83d\udcc4 Multiple Layout Variations\n' +
    '\ud83d\udcc4 Bonus: 50+ Coordinating Digital Stickers\n' +
    '\ud83d\udcc4 Lifetime Access & Free Updates\n\n' +
    '\u2501'.repeat(30) + '\n\n' +
    '\u2728 DEEP DIVE FEATURES:\n\n' +
    '\ud83c\udfa8 Fully customizable in Canva (Free version works perfectly!)\n' +
    '\ud83d\udcc0 Clean, modern, minimalist aesthetic designed for focus\n' +
    '\ud83c\udf08 Thoughtfully curated soft pastel color palette\n' +
    '\ud83d\udcf1 Hyperlinked navigation for seamless digital use\n' +
    '\ud83d\udcbb Works beautifully on iPad, tablet, laptop, and desktop\n' +
    '\ud83d\udcd7 Print-ready — use digitally OR print easily at home\n' +
    '\ud83c\udfaf Habit trackers, financial logs, and wellness check-ins included\n\n' +
    '\u2501'.repeat(30) + '\n\n' +
    '\ud83d\udcbb COMPATIBILITY & APPS:\n\n' +
    '\u2714\ufe0f GoodNotes 5 & 6 (Highly Recommended!)\n' +
    '\u2714\ufe0f Notability\n' +
    '\u2714\ufe0f Xodo & Noteshelf\n' +
    '\u2714\ufe0f Canva Web & App\n' +
    '\u2714\ufe0f Adobe Acrobat for basic PDF viewing\n\n' +
    '\u2501'.repeat(30) + '\n\n' +
    '\ud83d\udca1 FREQUENTLY ASKED QUESTIONS:\n\n' +
    'Q: How do I access my files?\n' +
    'A: After purchase, Etsy will immediately send you an email with a download link. You can also access them in your Etsy account under "Purchases and Reviews".\n\n' +
    'Q: Do I need a paid Canva Pro account?\n' +
    'A: Not at all! This template is 100% compatible with the FREE version of Canva. No pro elements are used.\n\n' +
    'Q: Can I change the colors, fonts, and text?\n' +
    'A: Yes! Absolutely every single element is fully customizable to match your unique brand or personal style.\n\n' +
    '\u2501'.repeat(30) + '\n\n' +
    '\ud83d\udef8 HOW IT WORKS:\n\n' +
    '1. Add to cart and complete checkout.\n' +
    '2. You will receive an instant download link from Etsy.\n' +
    '3. Download the PDF instructions.\n' +
    '4. Click the link inside the PDF to access your files or template.\n' +
    '5. Import to your favorite app or start customizing immediately!\n\n' +
    '\u2501'.repeat(30) + '\n\n' +
    '\u26a0\ufe0f PLEASE NOTE:\n\n' +
    '\ud83d\udeab This is a DIGITAL PRODUCT — no physical item will be shipped\n' +
    '\ud83d\udeab Due to the instant-download nature, we cannot offer refunds\n' +
    '\ud83d\udeab For PERSONAL USE ONLY\n\n' +
    '\u2501'.repeat(30) + '\n\n' +
    '\ud83d\udc8c Thank you so much for visiting our shop! Every purchase means the world to us.\n\n' +
    'With love and gratitude,\nDaisyFlow Studio \ud83c\udf38';

  return {
    ok: true,
    title,
    description,
    hashtags:
      kwSlug +
      ', digital download, canva template, editable design, minimalist, aesthetic, custom template, modern layout, digital file, small business, printable, planner insert, creative asset',
  };
}
