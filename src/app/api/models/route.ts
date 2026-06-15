import { NextResponse } from 'next/server';

// ============================================================
// Types
// ============================================================

interface ModelEntry {
  name: string;
  id: string;
  isFree: boolean;
  contextWindow: number;
  provider: string;
}

// ============================================================
// Static model catalogue — popular free models on OpenRouter
// ============================================================

const FREE_MODELS: ModelEntry[] = [
  {
    name: 'Gemma 3 27B',
    id: 'google/gemma-3-27b-it:free',
    isFree: true,
    contextWindow: 131_072,
    provider: 'Google',
  },
  {
    name: 'Llama 4 Maverick',
    id: 'meta-llama/llama-4-maverick:free',
    isFree: true,
    contextWindow: 131_072,
    provider: 'Meta',
  },
  {
    name: 'Qwen 3 32B',
    id: 'qwen/qwen3-32b:free',
    isFree: true,
    contextWindow: 131_072,
    provider: 'Alibaba',
  },
  {
    name: 'Mistral Small 3.1',
    id: 'mistralai/mistral-small-3.1-24b-instruct:free',
    isFree: true,
    contextWindow: 131_072,
    provider: 'Mistral',
  },
];

// ============================================================
// GET /api/models
// ============================================================

export async function GET() {
  try {
    const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY);

    const models: ModelEntry[] = [...FREE_MODELS];

    // If a custom key is present, advertise a default paid model as well
    if (hasOpenRouterKey) {
      models.push({
        name: 'GPT-4o Mini (via OpenRouter)',
        id: 'openai/gpt-4o-mini',
        isFree: false,
        contextWindow: 128_000,
        provider: 'OpenAI',
      });
    }

    return NextResponse.json({
      models,
      hasOpenRouterKey,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Не удалось загрузить список моделей';

    console.error('[/api/models] Error:', message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
