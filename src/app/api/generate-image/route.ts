import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { targetNiche } = await request.json();

  const apiKey = process.env.OPENAI_API_KEY;

  // Graceful fallback — return a placeholder gradient data URL when no key
  if (!apiKey) {
    return Response.json({ imageUrl: null, useFallback: true });
  }

  try {
    const prompt = `A professional, minimalist headshot portrait of a ${targetNiche}. Clean studio background, soft lighting, photorealistic, 4K. Suitable for a premium resume template.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    });

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url ?? null;

    return Response.json({ imageUrl, useFallback: !imageUrl });
  } catch (err) {
    console.error('[generate-image] DALL-E error:', err);
    return Response.json({ imageUrl: null, useFallback: true });
  }
}
