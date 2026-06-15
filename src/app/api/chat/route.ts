import ZAI from 'z-ai-web-dev-sdk';
import type { ChatMessage } from '@/types';

// ============================================================
// Types
// ============================================================

interface ChatRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: ChatRequestMessage[];
  systemPrompt: string;
  model: string;
  apiToken?: string;
  stream?: boolean;
}

interface SSEChunk {
  choices: Array<{
    delta: { content?: string };
    finish_reason?: string | null;
  }>;
}

interface ModelInfoEvent {
  type: 'model_info';
  model: string;
  rateLimited: string[];
}

// ============================================================
// Helpers
// ============================================================

/** Validate that the request body has the required fields */
function validateBody(body: Partial<ChatRequestBody>): body is ChatRequestBody {
  if (!body.messages || !Array.isArray(body.messages)) return false;
  if (typeof body.systemPrompt !== 'string') return false;
  if (typeof body.model !== 'string') return false;
  for (const msg of body.messages) {
    if (!msg.role || !msg.content) return false;
    if (!['system', 'user', 'assistant'].includes(msg.role)) return false;
  }
  return true;
}

/** Build the full message array with the system prompt prepended */
function buildMessages(body: ChatRequestBody): ChatRequestMessage[] {
  return [
    { role: 'system', content: body.systemPrompt },
    ...body.messages,
  ];
}

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

export async function POST(request: Request) {
  try {
    // ---- Parse & validate ----
    const rawBody: Partial<ChatRequestBody> = await request.json();

    if (!validateBody(rawBody)) {
      return Response.json(
        { error: 'Неверный формат запроса. Обязательные поля: messages (массив), systemPrompt (строка), model (строка).' },
        { status: 400 },
      );
    }

    const body: ChatRequestBody = rawBody;
    const fullMessages = buildMessages(body);
    const shouldStream = body.stream !== false; // default: true

    // ---- Initialise SDK ----
    const zai = await ZAI.create();

    // ---- Call LLM ----
    const completion = await zai.chat.completions.create({
      messages: fullMessages,
      model: body.model || 'default',
      stream: shouldStream,
    });

    // ---- Streaming response ----
    if (shouldStream && Symbol.asyncIterator in Object(completion)) {
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Emit model_info event so the client knows which model answered
            const modelInfo: ModelInfoEvent = {
              type: 'model_info',
              model: body.model,
              rateLimited: [],
            };
            controller.enqueue(encoder.encode(sseJSON(modelInfo)));

            for await (const chunk of completion as AsyncIterable<unknown>) {
              const c = chunk as Record<string, unknown>;
              const choices = c.choices as Array<Record<string, unknown>> | undefined;
              const delta = choices?.[0]?.delta as Record<string, unknown> | undefined;
              const content = delta?.content as string | undefined;

              if (content) {
                const sseChunk: SSEChunk = {
                  choices: [{ delta: { content }, finish_reason: null }],
                };
                controller.enqueue(encoder.encode(sseJSON(sseChunk)));
              }
            }

            // Signal stream end
            controller.enqueue(encoder.encode(sseData('[DONE]')));
            controller.close();
          } catch (streamError: unknown) {
            const message =
              streamError instanceof Error
                ? streamError.message
                : 'Ошибка при потоковой генерации ответа';
            controller.enqueue(
              encoder.encode(sseJSON({ error: message })),
            );
            controller.enqueue(encoder.encode(sseData('[DONE]')));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // ---- Non-streaming (fallback) ----
    const result = completion as Record<string, unknown>;
    const choices = result.choices as Array<Record<string, unknown>> | undefined;
    const message = choices?.[0]?.message as Record<string, unknown> | undefined;
    const content = message?.content as string | undefined;

    return Response.json({
      choices: [
        {
          message: { role: 'assistant', content: content ?? '' },
          finish_reason: 'stop',
        },
      ],
      model: body.model,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Произошла неизвестная ошибка при обращении к LLM';

    console.error('[/api/chat] Error:', message);

    return Response.json({ error: message }, { status: 500 });
  }
}
