import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { model, apiToken } = await req.json();

    if (!model || typeof model !== 'string') {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }

    const apiKey = apiToken || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const startTime = Date.now();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://skillforge-ai-plum.vercel.app',
        'X-Title': 'SkillForge AI Probe',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
        stream: false,
      }),
    });

    const latency = Date.now() - startTime;

    const rateLimitLimit = response.headers.get('x-ratelimit-limit');
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');

    if (response.ok) {
      return NextResponse.json({
        available: true,
        model,
        latency,
        rateLimit: {
          limit: rateLimitLimit ? parseInt(rateLimitLimit, 10) : null,
          remaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : null,
          reset: rateLimitReset || null,
        },
      });
    }

    // 402 = valid token but insufficient credits (token works, model needs payment)
    if (response.status === 402) {
      return NextResponse.json({
        available: false,
        model,
        reason: 'insufficient_credits',
        latency,
      });
    }

    // 429 = valid token, just hit rate limit
    if (response.status === 429) {
      return NextResponse.json({
        available: false,
        model,
        reason: 'rate_limited',
        rateLimit: {
          limit: rateLimitLimit ? parseInt(rateLimitLimit, 10) : null,
          remaining: 0,
          reset: rateLimitReset || null,
        },
      });
    }

    // 401 = actually invalid token
    if (response.status === 401) {
      return NextResponse.json({
        available: false,
        model,
        reason: 'invalid_token',
      });
    }

    const errText = await response.text().catch(() => '');
    return NextResponse.json({
      available: false,
      model,
      reason: response.status === 404 ? 'not_found' : 'error',
      details: errText,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
