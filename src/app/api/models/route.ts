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
    name: 'Llama 3.3 70B Instruct',
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    isFree: true,
    contextWindow: 131_072,
    provider: 'Meta',
  },
  {
    name: 'Gemma 2 9B IT',
    id: 'google/gemma-2-9b-it:free',
    isFree: true,
    contextWindow: 8_192,
    provider: 'Google',
  },
  {
    name: 'Mistral 7B Instruct',
    id: 'mistralai/mistral-7b-instruct:free',
    isFree: true,
    contextWindow: 32_768,
    provider: 'Mistral AI',
  },
  {
    name: 'Phi-3 Mini 128K Instruct',
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    isFree: true,
    contextWindow: 128_000,
    provider: 'Microsoft',
  },
  {
    name: 'Qwen 2 7B Instruct',
    id: 'qwen/qwen-2-7b-instruct:free',
    isFree: true,
    contextWindow: 32_768,
    provider: 'Alibaba',
  },
];

// ============================================================
// GET /api/models
// ============================================================

export async function GET() {
  try {
    // Check if an OpenRouter API key is configured on the server
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

    return Response.json({
      models,
      hasOpenRouterKey,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Не удалось загрузить список моделей';

    console.error('[/api/models] Error:', message);

    return Response.json({ error: message }, { status: 500 });
  }
}
