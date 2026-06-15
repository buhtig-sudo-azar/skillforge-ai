import { NextResponse } from 'next/server';

// ============================================================
// Server-side cache for free models from OpenRouter
// ============================================================

let cachedModels: { id: string; name: string; label: string }[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

// Fallback модели, если OpenRouter недоступен
const FALLBACK_MODELS = [
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', label: 'Gemma 3 27B' },
  { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick', label: 'Llama 4 Maverick' },
  { id: 'qwen/qwen3-32b:free', name: 'Qwen3 32B', label: 'Qwen3 32B' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', label: 'Mistral Small 3.1' },
  { id: 'moonshotai/kimi-k2.6:free', name: 'Kimi K2.6', label: 'Kimi K2.6' },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nemotron Ultra', label: 'Nemotron Ultra' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next', label: 'Qwen3 Next' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', label: 'Llama 3.3 70B' },
];

// ============================================================
// GET /api/models — динамический список моделей с кэшированием
// Точно как в llm-red-team-lab
// ============================================================

export async function GET() {
  try {
    const now = Date.now();

    // Возвращаем кэшированные данные, если они свежие
    if (cachedModels && now - cacheTime < CACHE_TTL) {
      return NextResponse.json({ models: cachedModels });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Запрашиваем список моделей напрямую у OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      // При ошибке — возвращаем кэш, если есть
      if (cachedModels) {
        return NextResponse.json({ models: cachedModels });
      }
      // Иначе — fallback-список
      return NextResponse.json({ models: FALLBACK_MODELS });
    }

    const data = await response.json();
    const allModels = data.data || [];

    // Фильтруем только бесплатные модели, исключаем content-safety
    const freeModels = allModels
      .filter((m: { id: string }) => m.id.endsWith(':free'))
      .filter((m: { id: string }) => !m.id.includes('content-safety'))
      .map((m: { id: string; name?: string }) => {
        const name = m.name || m.id.split('/').pop() || m.id;
        const label = name.replace(/\s*\(free\)\s*$/i, '').trim();

        return {
          id: m.id,
          name: m.name || m.id,
          label,
        };
      })
      .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));

    cachedModels = freeModels;
    cacheTime = now;

    return NextResponse.json({ models: freeModels });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // При ошибке — возвращаем кэш или fallback
    if (cachedModels) {
      return NextResponse.json({ models: cachedModels });
    }

    console.error('[/api/models] Error:', message);
    return NextResponse.json({ models: FALLBACK_MODELS });
  }
}
