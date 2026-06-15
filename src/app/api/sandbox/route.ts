import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Types
// ============================================================

interface SandboxRequestBody {
  input: string;
  systemPrompt: string;
  sandboxType?: string;
  model?: string;
  mode?: 'educational' | 'advanced';
}

// ============================================================
// Security validation
// ============================================================

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

function validateInput(input: string): string | null {
  if (!input || typeof input !== 'string') return 'Поле "input" обязательно и должно быть строкой.';
  if (input.trim().length === 0) return 'Ввод не может быть пустым.';
  if (input.length > 12_000) return 'Ввод слишком длинный (максимум 12 000 символов).';
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) return 'Ввод содержит запрещённый шаблон. Измените формулировку.';
  }
  return null;
}

// ============================================================
// Educational simulation
// ============================================================

function generateEducationalResponse(input: string, systemPrompt: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('skill') || lowerInput.includes('навык')) {
    return `📊 **Образовательная симуляция**

Запрос обработан в режиме симуляции.

Ваш запрос связан с AI-навыками. В реальном режиме модель проанализировала бы ваш запрос и сгенерировала ответ.

💡 **Совет:** Навык в формате SKILL.md состоит из YAML-фронтматтера и Markdown-тела. Попробуйте создать свой навык!`;
  }

  if (lowerInput.includes('prompt') || lowerInput.includes('промпт')) {
    return `📊 **Образовательная симуляция**

Анализ промпт-запроса завершён.

Качество промпта можно улучшить:
- Добавьте роль (например, "Ты — эксперт по...")
- Укажите формат ответа
- Приведите примеры (few-shot)

В реальном режиме модель сгенерирует ответ по вашему промпту.`;
  }

  if (lowerInput.includes('agent') || lowerInput.includes('агент')) {
    return `📊 **Образовательная симуляция**

Конфигурация агента обработана.

Агент работает в цикле: **Thought → Action → Observation**

В реальном режиме агент:
1. Проанализировал бы задачу
2. Выбрал подходящий инструмент
3. Выполнил действие
4. Вернул результат`;
  }

  if (lowerInput.includes('mcp') || lowerInput.includes('инструмент') || lowerInput.includes('tool')) {
    return `📊 **Образовательная симуляция**

Запрос связан с инструментами/MCP.

MCP (Model Context Protocol) позволяет:
- Подключать внешние инструменты к агентам
- Описывать параметры через JSON Schema
- Безопасно изолировать выполнение

💡 Переключитесь в "Продвинутый" режим для реальных ответов от LLM.`;
  }

  if (lowerInput.includes('rag') || lowerInput.includes('знан') || lowerInput.includes('поиск')) {
    return `📊 **Образовательная симуляция**

Запрос связан с RAG/базами знаний.

RAG-пайплайн состоит из:
1. **Интеграция документов** → загрузка и парсинг
2. **Чанкинг** → разбиение на фрагменты
3. **Эмбеддинги** → векторное представление
4. **Поиск** → нахождение релевантных чанков
5. **Генерация** → ответ на основе контекста

💡 Переключитесь в "Продвинутый" режим для реальных ответов.`;
  }

  return `📊 **Образовательная симуляция**

Ваш запрос: "${input.substring(0, 100)}${input.length > 100 ? '...' : ''}"

В режиме симуляции ответ генерируется локально без вызова API.

💡 Переключитесь в **"Продвинутый"** режим для реальных ответов от LLM.`;
}

// ============================================================
// POST /api/sandbox
// ============================================================

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const SANDBOX_MODEL = 'google/gemma-3-27b-it:free';
const FALLBACK_MODELS = [
  'meta-llama/llama-4-maverick:free',
  'qwen/qwen3-32b:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
];

export async function POST(req: NextRequest) {
  let body: Partial<SandboxRequestBody>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Неверный формат запроса' }, { status: 400 });
  }

  const { input, systemPrompt, sandboxType, model, mode } = body;

  // ---- Validate input ----
  const inputError = validateInput(input ?? '');
  if (inputError) {
    return NextResponse.json({ error: inputError }, { status: 400 });
  }

  // ---- Educational mode: simulated response ----
  if (mode === 'educational' || !OPENROUTER_API_KEY) {
    const simulatedOutput = generateEducationalResponse(input!, systemPrompt ?? '');
    return NextResponse.json({
      output: simulatedOutput,
      model: 'simulation',
      tokens: Math.floor(input!.length * 1.5),
      latency: Math.floor(Math.random() * 200 + 100),
      sandboxType: sandboxType ?? 'prompt',
      success: true,
    });
  }

  // ---- Advanced mode: call OpenRouter ----
  const enrichedSystemPrompt = [
    systemPrompt ?? '',
    '',
    `[Контекст песочницы: тип="${sandboxType ?? 'prompt'}"]. Ответ должен быть обучающим, с примерами и пояснениями на русском языке.`,
  ].join('\n');

  const messages = [
    { role: 'system' as const, content: enrichedSystemPrompt },
    { role: 'user' as const, content: input! },
  ];

  const requestedModel = model && model !== 'auto' ? model : SANDBOX_MODEL;
  const modelsToTry = [requestedModel, ...FALLBACK_MODELS.filter(m => m !== requestedModel)];

  for (const modelId of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://skillforge-ai-plum.vercel.app/',
          'X-Title': 'SkillForge AI Sandbox',
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          stream: false,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) continue;
        console.error(`[/api/sandbox] Model ${modelId} returned ${response.status}`);
        continue;
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content ?? '';

      return NextResponse.json({
        output: content,
        model: modelId,
        tokens: result.usage?.total_tokens ?? Math.floor(input!.length * 1.5),
        latency: Math.floor(Math.random() * 300 + 200),
        sandboxType: sandboxType ?? 'prompt',
        success: true,
      });
    } catch (e) {
      console.error(`[/api/sandbox] Error with model ${modelId}:`, e);
      continue;
    }
  }

  // All models failed — fallback to educational simulation
  const fallbackOutput = generateEducationalResponse(input!, systemPrompt ?? '');
  return NextResponse.json({
    output: fallbackOutput + '\n\n⚠️ _Продвинутый режим недоступен — используется симуляция._',
    model: 'simulation-fallback',
    tokens: Math.floor(input!.length * 1.5),
    latency: Math.floor(Math.random() * 200 + 100),
    sandboxType: sandboxType ?? 'prompt',
    success: true,
  });
}
