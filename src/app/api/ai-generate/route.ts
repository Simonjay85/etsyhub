import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt, fileType } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Return a mock structure when no API key is set
    return NextResponse.json(mockFallback(prompt, fileType));
  }

  const systemPrompt = fileType === 'excel'
    ? `You are a professional spreadsheet designer. The user will describe what kind of spreadsheet they need.
Return ONLY a JSON object with this exact structure:
{
  "title": "Product title for Etsy",
  "sheets": [
    {
      "name": "Sheet tab name (max 31 chars)",
      "headers": ["Column1", "Column2", ...],
      "sampleRows": [
        ["row1col1", "row1col2", ...],
        ["row2col1", "row2col2", ...],
        ["row3col1", "row3col2", ...]
      ],
      "description": "What this sheet does"
    }
  ]
}
Create 2-4 sheets. Headers should be clear and practical. Include 5 sample rows per sheet.
Return ONLY valid JSON, nothing else.`
    : `You are a professional resume/document designer. The user will describe what kind of PDF document they need.
Return ONLY a JSON object with this exact structure:
{
  "title": "Job title / document title",
  "niche": "Professional niche or industry (e.g. 'Marketing Manager')",
  "summary": "A compelling 2-3 sentence professional summary for this niche",
  "sectionTitle": "PROFESSIONAL SUMMARY"
}
Return ONLY valid JSON, nothing else.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? '';

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ ...parsed, ok: true });
  } catch (err) {
    console.error('AI generate error:', err);
    return NextResponse.json(mockFallback(prompt, fileType));
  }
}

function mockFallback(prompt: string, fileType: string) {
  if (fileType === 'excel') {
    return {
      ok: true,
      title: prompt.slice(0, 50) || 'Custom Tracker',
      sheets: [
        {
          name: 'Dashboard',
          headers: ['Category', 'Amount', 'Date', 'Notes', 'Status'],
          sampleRows: [
            ['Income', '5000', '2026-01-01', 'Monthly salary', 'Completed'],
            ['Rent', '-1500', '2026-01-02', 'Monthly rent', 'Paid'],
            ['Groceries', '-300', '2026-01-05', 'Weekly shopping', 'Paid'],
            ['Freelance', '800', '2026-01-10', 'Design project', 'Received'],
            ['Utilities', '-150', '2026-01-15', 'Electricity + water', 'Paid'],
          ],
          description: 'Main overview',
        },
        {
          name: 'Monthly Log',
          headers: ['Month', 'Total Income', 'Total Expenses', 'Net Savings', 'Notes'],
          sampleRows: [
            ['January 2026', '5800', '1950', '3850', 'Good month'],
            ['February 2026', '5000', '2100', '2900', 'Higher utilities'],
            ['March 2026', '6200', '1800', '4400', 'Freelance boost'],
            ['April 2026', '', '', '', ''],
            ['May 2026', '', '', '', ''],
          ],
          description: 'Monthly summary',
        },
      ],
    };
  }
  // PDF fallback
  return {
    ok: true,
    title: prompt.slice(0, 60) || 'Professional',
    niche: prompt.slice(0, 40) || 'Creative Professional',
    summary: `Award-winning ${prompt.slice(0, 30)} professional with 10+ years of experience delivering exceptional results. Known for strategic thinking, team leadership, and measurable impact.`,
    sectionTitle: 'PROFESSIONAL SUMMARY',
  };
}
