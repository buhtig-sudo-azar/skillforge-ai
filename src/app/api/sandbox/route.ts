import ZAI from 'z-ai-web-dev-sdk';
import type { SandboxType } from '@/types';

// ============================================================
// Types
// ============================================================

interface SandboxRequestBody {
  input: string;
  systemPrompt: string;
  sandboxType: SandboxType | string;
  model: string;
}

// ============================================================
// Security validation
// ============================================================

/**
 * Patterns that should never reach the LLM — basic prompt-injection
 * and dangerous instruction markers.  This is a *defensive* check;
 * the sandbox never executes code on the server.
 */
const BLOCKED_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s*:\s*you\s+are\s+now/i,
  /sudo\s+/i,
  /rm\s+-rf/i,
  /\bexec\s*\(/i,
  /\beval\s*\(/i,
  /<script\b/i,
  /\bDROP\s+TABLE\b/i,
];

/** Validate sandbox input — returns an error message or null if OK */
function validateInput(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return 'Поле "input" обязательно и должно быть строкой.';
  }

  if (input.trim().length === 0) {
    return 'Ввод не может быть пустым.';
  }

  if (input.length > 12_000) {
    return 'Ввод слишком длинный (максимум 12 000 символов).';
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      return 'Ввод содержит запрещённый шаблон. Измените формулировку и попробуйте снова.';
    }
  }

  return null;
}

/** Validate the sandboxType against known types */
function validateSandboxType(sandboxType: string): string | null {
  const allowed: string[] = [
    'prompt',
    'agent',
    'tool',
    'mcp',
    'rag',
    'workflow',
    'architecture',
  ];

  if (!sandboxType || typeof sandboxType !== 'string') {
    return 'Поле "sandboxType" обязательно.';
  }

  if (!allowed.includes(sandboxType)) {
    return `Неизвестный тип песочницы: "${sandboxType}". Допустимые: ${allowed.join(', ')}.`;
  }

  return null;
}

// ============================================================
// POST /api/sandbox
// ============================================================

export async function POST(request: Request) {
  try {
    const body: Partial<SandboxRequestBody> = await request.json();

    // ---- Required field presence ----
    const { input, systemPrompt, sandboxType, model } = body;

    if (!systemPrompt || typeof systemPrompt !== 'string') {
      return Response.json(
        { error: 'Поле "systemPrompt" обязательно и должно быть строкой.' },
        { status: 400 },
      );
    }

    if (!model || typeof model !== 'string') {
      return Response.json(
        { error: 'Поле "model" обязательно и должно быть строкой.' },
        { status: 400 },
      );
    }

    // ---- Security validation ----
    const inputError = validateInput(input ?? '');
    if (inputError) {
      return Response.json({ error: inputError }, { status: 400 });
    }

    const typeError = validateSandboxType(sandboxType ?? '');
    if (typeError) {
      return Response.json({ error: typeError }, { status: 400 });
    }

    // ---- Build messages ----
    // The system prompt includes context about the sandbox type
    const enrichedSystemPrompt = [
      systemPrompt,
      '',
      `[Контекст песочницы: тип="${sandboxType}"]. Ответ должен быть обучающим, с примерами и пояснениями на русском языке.`,
    ].join('\n');

    const messages = [
      { role: 'system' as const, content: enrichedSystemPrompt },
      { role: 'user' as const, content: input! },
    ];

    // ---- Call LLM (non-streaming for sandbox) ----
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages,
      model: model || 'default',
      stream: false,
    });

    // ---- Extract response ----
    const result = completion as Record<string, unknown>;
    const choices = result.choices as Array<Record<string, unknown>> | undefined;
    const message = choices?.[0]?.message as Record<string, unknown> | undefined;
    const content = (message?.content as string) ?? '';

    return Response.json({
      output: content,
      model,
      sandboxType,
      success: true,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Произошла неизвестная ошибка при выполнении в песочнице';

    console.error('[/api/sandbox] Error:', message);

    return Response.json({ error: message, success: false }, { status: 500 });
  }
}
