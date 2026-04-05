import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { keyword, referenceInfo } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Graceful fallback for demonstration when no key is set
      return NextResponse.json(mockFallback(keyword));
    }

    const referenceDirective = referenceInfo?.trim() 
      ? `\nCRUCIAL INSTRUCTION: The user has provided Reference Information ("Clone content") below. You MUST deeply analyze and extract the actual features, contents, structure, and details from this reference. Base the ENTIRE listing generation entirely on the facts, product specifications, and features mentioned in the Reference Information, but completely rewrite and restructure it in your own highly-converting, aesthetic Etsy SEO style described below.\n\n### REFERENCE CLONE INFORMATION ###\n${referenceInfo}\n### END REFERENCE ###\n` 
      : "";

    const systemPrompt = `You are a top-tier Etsy SEO expert and professional copywriter.
Your objective is to generate a highly optimized, extremely comprehensive product listing based on the user's keyword.${referenceDirective}
Return ONLY a valid JSON object with the exact following structure:
{
  "title": "Build a heavily optimized Etsy SEO title (must be between 135 and 140 characters limit max, MUST NOT BE SHORTER THAN 135 CHARS!). RULES: 1) Front-load the exact main keyword at the very beginning. 2) Follow it with 5 to 8 strong long-tail keyword phrases separated by ' | ' or commas or ' - '. 3) CRITICAL: You MUST keep adding highly searched relevant keyword phrases until the string length is exceptionally close to 140 characters! DO NOT return a short title. A title under 130 characters is completely unacceptable and will be rejected. 4) Use 1 or 2 emojis like ✨, 💖, or 📅 for visual boost.",
  "description": "You are an expert Etsy SEO copywriter for feminine digital products in the productivity niche. Write a complete Etsy listing description (very long, 800+ words) for a digital planner targeting the North American market. Audience: women who love productivity, planning, journaling, self-improvement, and aesthetic digital tools. Main benefit: help users stay organized, reduce overwhelm, and plan beautifully. Tone: feminine, soft premium, clear, helpful, aesthetic but practical, natural English for US and Canada buyers. Structure must exactly include: 1) Opening paragraph with keyword 2) WHAT YOU'LL RECEIVE (must accurately reflect the Reference Info if provided) 3) FEATURES 4) WHY YOU'LL LOVE IT 5) PERFECT FOR 6) IMPORTANT DETAILS 7) HOW IT WORKS 8) PLEASE NOTE 9) Short closing line. Rules: Make it SEO-friendly without sounding stuffed, make it skimmable, focus on benefits and buyer confidence, explicitly state policies (digital download only, no physical item shipped, personal use only, no refunds due to the digital nature of the product). Every bullet point MUST start with a relevant emoji.",
  "hashtags": "Exactly 13 highly relevant Etsy tags separated by commas. Each tag must be 20 characters or less. Example: tag1, tag2, tag3"
}
Do not include any other text, markdown blocks, or explanations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Keyword: ${keyword}` },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;
    const parsed = JSON.parse(raw);

    return NextResponse.json({ ...parsed, ok: true });
  } catch (err) {
    console.error('[seo-generate] error:', err);
    return NextResponse.json(
      { error: 'Failed to generate SEO listing' },
      { status: 500 }
    );
  }
}

function mockFallback(keyword: string) {
  const kw = keyword.trim();
  const kwUpper = kw.toUpperCase();
  const kwLower = kw.toLowerCase();
  const kwSlug = kwLower.replace(/ /g, '');

  // Build a title that is 135-140 characters with long-tail keyword phrases
  const titleParts = [
    kwUpper,
    'Editable Canva Template',
    'Instant Digital Download',
    'Aesthetic Minimalist Design',
    'Printable PDF',
    'Modern Layout',
    'Self Care Planner',
    'Productivity Tool',
    'Goodnotes iPad',
  ];
  let title = '';
  for (const part of titleParts) {
    const next = title ? `${title} | ${part}` : `✨ ${part}`;
    if (next.length > 140) break;
    title = next;
  }
  // Pad with sparkle if still under 135
  if (title.length < 135) {
    const pad = ' 💖 Best Seller';
    if ((title + pad).length <= 140) title += pad;
  }

  const description = `🌟 WELCOME TO OUR SHOP — THANK YOU FOR STOPPING BY! 🌟

Are you searching for the perfect ${kw} to transform your productivity, organization, and daily planning routine? You've come to the right place! Our premium ${kw} has been thoughtfully designed with both beauty and functionality in mind. Whether you're a busy mom, a college student, a small business owner, or simply someone who loves keeping life beautifully organized — this digital product was made with YOU in heart.

We know how overwhelming it can feel to juggle everything at once. That's exactly why we created this stunning ${kw} — to help you reduce stress, plan with confidence, and finally feel in control of your schedule, goals, and dreams. Every detail has been carefully crafted to provide a seamless, joyful planning experience that you'll look forward to every single day.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 WHAT YOU'LL RECEIVE:

📄 1x Fully Editable Canva Template — Customize every element including colors, fonts, images, and layout to perfectly match your personal brand and aesthetic preferences
📄 1x High Resolution PDF Digital Download — Print-ready at 300 DPI for crisp, vibrant results on any paper size
📄 1x Step-by-Step Instruction Guide — Easy to follow, beginner-friendly setup instructions so you can start using your ${kw} within minutes of purchase
📄 Multiple Layout Variations — Choose from several beautifully designed page styles to suit your unique workflow and planning needs
📄 Bonus: 50+ Coordinating Digital Stickers — Adorable, themed sticker elements to decorate and personalize your pages
📄 Lifetime Access & Free Updates — Once you purchase, you'll receive all future updates and improvements at absolutely no extra cost

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ FEATURES YOU'LL LOVE:

🎨 Fully customizable in Canva (Free version works perfectly!)
📐 Clean, modern, minimalist aesthetic with premium typography
🌈 Soft pastel color palette — elegant and easy on the eyes
📱 Compatible with Goodnotes, Notability, Noteshelf, Xodo, and more
💻 Works beautifully on iPad, tablet, laptop, and desktop
📏 Available in US Letter (8.5 x 11"), A4, and A5 sizes
🔗 Hyperlinked tabs and sections for seamless digital navigation
🖨️ Print-ready — use digitally OR print at home or at any print shop
✏️ Editable text fields — add your own content, goals, and notes
🌟 Professional quality design that looks like you hired a graphic designer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💖 WHY YOU'LL ABSOLUTELY LOVE THIS ${kwUpper}:

We've poured hundreds of hours of research, design, and testing into creating this ${kw} so that you don't have to start from scratch. Every page has been meticulously crafted with intention — from the carefully chosen color palette to the thoughtfully structured layouts that guide you through your planning journey.

Unlike generic templates you might find elsewhere, our ${kw} is designed specifically for women who appreciate both aesthetics AND practicality. We believe that your planning tools should inspire you, motivate you, and make you genuinely excited to sit down and organize your life.

Here's what makes our template truly special:
💎 Premium design quality that rivals products sold for 10x the price
💎 Beginner-friendly — no design experience needed whatsoever
💎 Instant access — start customizing within minutes of purchase
💎 Versatile enough for personal use, small business, or gifting
💎 Regularly updated based on customer feedback and seasonal trends

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PERFECT FOR:

👩‍💼 Busy professionals who want to stay organized without sacrificing style
🎓 Students managing coursework, exams, and extracurricular activities
👩‍👧‍👦 Moms balancing family schedules, meal planning, and self-care
💼 Entrepreneurs and small business owners tracking goals and projects
🧘‍♀️ Anyone on a self-improvement journey who values beautiful organization
✍️ Journaling enthusiasts who love combining productivity with creativity
🎁 Anyone looking for a thoughtful, practical digital gift

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 HOW IT WORKS:

1️⃣ Complete your purchase — you'll receive instant access to your download
2️⃣ Download the PDF file which contains your exclusive Canva template link
3️⃣ Click the link to open the template directly in your free Canva account
4️⃣ Make a copy of the template to your own Canva workspace
5️⃣ Customize absolutely everything — colors, fonts, text, images, and more
6️⃣ Export as PDF, PNG, or print directly from Canva
7️⃣ Enjoy your beautifully personalized ${kw} forever!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️ IMPORTANT DETAILS:

📎 You will need a FREE Canva account to edit this template (canva.com)
📎 No physical product will be shipped — this is a 100% digital download
📎 Colors may vary slightly depending on your screen and printer settings
📎 For personal use only — commercial licenses available upon request
📎 All sales are final due to the digital nature of this product

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ PLEASE NOTE:

🚫 This is a DIGITAL PRODUCT — absolutely no physical item will be mailed or shipped to you
🚫 Due to the instant-download digital nature of this product, we are unable to offer refunds or exchanges
🚫 Please read the full listing description carefully before purchasing
🚫 This template is for PERSONAL USE ONLY and may not be resold, redistributed, or used for any commercial purposes without prior written permission
🚫 If you experience any issues with your download, please contact us BEFORE leaving a review — we are always happy to help!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💌 FROM OUR HEARTS TO YOURS:

Thank you SO much for visiting our shop and supporting our small, woman-owned business! Every single purchase means the world to us and helps us continue creating beautiful digital products that make your life easier and more organized.

If you have ANY questions about this ${kw}, need help with customization, or just want to say hi — please don't hesitate to reach out! We typically respond within 24 hours and we genuinely love hearing from our customers.

Don't forget to ⭐ favorite this listing and follow our shop for exclusive discounts, new product launches, and special seasonal collections!

With love and gratitude,
DaisyFlow Studio 🌸`;

  return {
    ok: true,
    title,
    description,
    hashtags: `${kwSlug}, digital download, canva template, editable design, minimalist, aesthetic, custom template, modern layout, digital file, small business, printable, planner insert, creative asset`
  };
}
