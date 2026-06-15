import { NextRequest } from 'next/server';

const PRIMARY_MODEL = 'google/gemma-3-27b-it:free';
const FALLBACK_MODELS = [
  'meta-llama/llama-4-maverick:free',
  'qwen/qwen3-32b:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
];

// ============================================================
// Types
// ============================================================

interface ChatRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: ChatRequestMessage[];
  systemPrompt?: string;
  model?: string;
  stream?: boolean;
  apiToken?: string;
}

// ============================================================
// Helpers
// ============================================================

/** Create an SSE-encoded data line */
function sseData(payload: string): string {
  return `data: ${payload}\n\n`;
}

/** Create a JSON SSE event */
function sseJSON(data: unknown): string {
  return sseData(JSON.stringify(data));
}

// ============================================================
// POST /api/chat
// ============================================================

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Неверный формат запроса' }), { status: 400 });
  }

  const { messages, model: requestedModel, stream: shouldStream = true, apiToken } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Поле messages обязательно и должно быть непустым массивом' }),
      { status: 400 },
    );
  }

  // Приоритет: пользовательский токен → env-переменная
  const apiKey = apiToken || process.env.OPENROUTER_API_KEY || '';

  // Determine models to try with fallback
  const modelsToTry = requestedModel && requestedModel !== 'auto'
    ? [requestedModel, ...FALLBACK_MODELS]
    : [PRIMARY_MODEL, ...FALLBACK_MODELS];

  for (const model of modelsToTry) {
    try {
      if (!apiKey) {
        // No API key configured — skip OpenRouter, try next
        continue;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://skillforge-ai-plum.vercel.app/',
          'X-Title': 'SkillForge AI',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: shouldStream,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) continue; // rate limited — try next model
        const errorText = await response.text().catch(() => '');
        console.error(`[/api/chat] Model ${model} returned ${response.status}: ${errorText}`);
        continue;
      }

      if (!shouldStream) {
        // Non-streaming response
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Stream SSE response — inject model_info event then pass through
      const encoder = new TextEncoder();
      const modelInfoEvent = sseJSON({
        type: 'model_info',
        model,
        rateLimited: [],
      });

      const stream = new ReadableStream({
        async start(controller) {
          // Emit model_info event first so the client knows which model answered
          controller.enqueue(encoder.encode(modelInfoEvent));

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              controller.enqueue(encoder.encode(chunk));
            }
          } catch (streamError) {
            console.error('[/api/chat] Stream error:', streamError);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (e) {
      console.error(`[/api/chat] Error with model ${model}:`, e);
      continue;
    }
  }

  // All models failed — return a helpful fallback response
  // Return a simulated streaming response so the UI still works
  const fallbackContent = 'Извините, все модели временно недоступны. Пожалуйста, попробуйте позже или добавьте свой OpenRouter API-токен в настройках модели.';

  if (shouldStream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // model_info event
        controller.enqueue(encoder.encode(sseJSON({
          type: 'model_info',
          model: 'fallback',
          rateLimited: modelsToTry,
        })));
        // content event
        controller.enqueue(encoder.encode(sseJSON({
          choices: [{ delta: { content: fallbackContent }, finish_reason: null }],
        })));
        // done event
        controller.enqueue(encoder.encode(sseData('[DONE]')));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  return new Response(
    JSON.stringify({ error: 'Все модели недоступны', content: fallbackContent }),
    { status: 503 },
  );
}
