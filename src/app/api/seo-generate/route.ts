import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Graceful fallback for demonstration when no key is set
      return NextResponse.json(mockFallback(keyword));
    }

    const systemPrompt = `You are an expert Etsy SEO specialist and copywriter. The user will provide a product keyword.
Your job is to generate a highly optimized Etsy product listing.
Return ONLY a valid JSON object with the exact following structure:
{
  "title": "A highly optimized Etsy title using long-tail keywords (max 140 chars)",
  "description": "A well-structured, engaging product description (can include emojis and bullet points). Should be multiple lines/paragraphs.",
  "hashtags": "13 highly relevant Etsy tags separated by commas. Each tag must be 20 characters or less."
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
        max_tokens: 1500,
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
  return {
    ok: true,
    title: `${keyword.toUpperCase()} | Editable Canva Template | Digital Download | Minimalist Design`,
    description: `🌟 WELCOME TO THE SHOP! 🌟\n\nTake your productivity to the next level with this stunning ${keyword} template. Designed for both form and function, this asset will help you stay organized and stylish.\n\n✨ WHAT YOU GET:\n- Fully Editable Canva Template\n- High Resolution PDF Download\n- Lifetime Access\n\n📌 HOW IT WORKS:\n1. Purchase the listing.\n2. Download the PDF containing the access link.\n3. Make a copy in your Canva account & edit!\n\nThank you for supporting small businesses!`,
    hashtags: `${keyword.toLowerCase().replace(/ /g, '')}, digital download, canva template, editable design, minimalist, aesthetic, custom template, modern layout, digital file, small business, printable, planner insert, creative asset`
  };
}
