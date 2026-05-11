import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY not set. Add it to .env.local to enable AI cover generation.' },
      { status: 500 }
    );
  }

  let prompt: string;
  try {
    const body = await req.json();
    prompt = body.prompt;
    if (!prompt) throw new Error('Missing prompt');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024',
      output_format: 'png',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    return NextResponse.json(
      { error: err?.error?.message || `OpenAI error ${response.status}` },
      { status: 500 }
    );
  }

  const data = await response.json() as { data: Array<{ b64_json?: string; url?: string }> };
  const b64 = data.data[0]?.b64_json;
  if (!b64) {
    return NextResponse.json({ error: 'No image returned from OpenAI' }, { status: 500 });
  }
  return NextResponse.json({ b64 });
}
