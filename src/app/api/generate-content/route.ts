import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { targetNiche } = await request.json();

  const apiKey = process.env.OPENAI_API_KEY;

  // Graceful fallback when no API key is configured
  if (!apiKey) {
    return Response.json({
      title: `${targetNiche} Resume`,
      summary: `Award-winning ${targetNiche} with 10+ years of experience scaling digital campaigns and brand identities. Expert in AI-driven design and market analytics.`,
      sectionTitle: 'PROFESSIONAL SUMMARY',
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a professional resume writer and Etsy digital product creator. Return valid JSON only.',
          },
          {
            role: 'user',
            content: `Create a professional resume template for a "${targetNiche}". Return JSON with keys: "title" (e.g. "CREATIVE DIRECTOR"), "summary" (2–3 sentence professional bio, max 200 chars), "sectionTitle" (e.g. "PROFESSIONAL SUMMARY").`,
          },
        ],
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return Response.json({
      title: content.title ?? `${targetNiche}`,
      summary: content.summary ?? '',
      sectionTitle: content.sectionTitle ?? 'PROFESSIONAL SUMMARY',
    });
  } catch (err) {
    console.error('[generate-content] OpenAI error:', err);
    return Response.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
