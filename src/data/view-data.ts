// Моковые данные для view-компонентов

import type {
  Skill,
  SandboxPreset,
  AgentTemplate,
  WorkflowNode,
  WorkflowEdge,
  MCPServer,
  KnowledgeBase,
  ModelConfig,
  SecurityRule,
  AdminStats,
  Achievement,
} from '@/types';

// ============================================================
// SKILL DATA
// ============================================================

export const mockSkill: Skill = {
  id: 's-1',
  slug: 'prompt-engineering-basics',
  name: 'Основы промпт-инжиниринга',
  description: 'Научитесь составлять эффективные промпты для языковых моделей, используя техники zero-shot, few-shot и chain-of-thought.',
  category: 'prompt',
  level: 'beginner',
  yamlFront: `name: Основы промпт-инжиниринга
description: Научитесь составлять эффективные промпты
category: prompt
level: beginner
tags:
  - prompts
  - llm
  - basics
version: 1`,
  body: `## Обзор

Промпт-инжиниринг — это искусство составления инструкций для языковых моделей. Качество промпта напрямую влияет на качество ответа.

### Ключевые принципы

1. **Будьте конкретны** — чётко формулируйте, что ожидаете от модели
2. **Задавайте роль** — «Ты — эксперт по X» улучшает качество ответа
3. **Указывайте формат** — «Ответь в формате списка» уточняет структуру
4. **Разбивайте сложные задачи** — декомпозиция повышает точность

### Техники

#### Zero-shot
Подход без примеров — модель решает задачу только по инструкции.

\`\`\`text
Переведи следующий текст на английский: "Привет, мир!"
\`\`\`

#### Few-shot
Подход с примерами — модель получает несколько примеров перед задачей.

\`\`\`text
Переведи на английский:
Привет → Hello
Мир → World
Солнце → ?
\`\`\`

#### Chain-of-Thought
Пошаговое рассуждение для сложных задач.

\`\`\`text
Реши задачу пошагово:
В магазине 15 яблок. Купили 7. Потом привезли ещё 10.
Сколько яблок стало?
\`\`\`
`,
  tags: ['prompts', 'llm', 'basics', 'chain-of-thought'],
  version: 1,
  isPublic: true,
  templates: [
    {
      id: 't-1',
      name: 'Базовый промпт с ролью',
      content: 'Ты — {{role}}. {{task}}. Ответь в формате {{format}}.',
      language: 'text',
      order: 0,
    },
    {
      id: 't-2',
      name: 'Few-shot шаблон',
      content: 'Выполни задачу: {{task}}\n\nПримеры:\n{{examples}}\n\nТеперь выполни:\n{{input}}',
      language: 'text',
      order: 1,
    },
    {
      id: 't-3',
      name: 'Chain-of-Thought',
      content: 'Реши задачу пошагово, объясняя каждое действие:\n\n{{task}}',
      language: 'text',
      order: 2,
    },
  ],
  examples: [
    {
      id: 'e-1',
      title: 'Простой промпт с ролью',
      input: 'Ты — опытный Python-разработчик. Объясни, как работают декораторы.',
      output: 'Декораторы в Python — это функции высшего порядка, которые принимают другую функцию и расширяют её поведение без изменения исходного кода...',
      order: 0,
    },
    {
      id: 'e-2',
      title: 'Промпт с форматом вывода',
      input: 'Проанализируй текст и выдели:\n1. Основную мысль\n2. Ключевые аргументы\n3. Вывод\n\nТекст: AI трансформирует образование.',
      output: '1. Основная мысль: Искусственный интеллект меняет подход к обучению\n2. Ключевые аргументы: персонализация, автоматизация, доступность\n3. Вывод: AI сделает образование более адаптивным',
      order: 1,
    },
  ],
};

// ============================================================
// SANDBOX DATA
// ============================================================

export const sandboxPresets: SandboxPreset[] = [
  {
    name: 'Zero-shot промпт',
    description: 'Простой промпт без примеров',
    payload: 'Объясни, что такое RAG в AI, в 3 предложениях.',
    systemPrompt: 'Ты — ИИ-ассистент, объясняющий сложные концепции простым языком.',
  },
  {
    name: 'Few-shot промпт',
    description: 'Промпт с примерами для лучшего результата',
    payload: 'Классифицируй:\n"Отличный сервис!" → Позитив\n"Ужасный опыт" → Негатив\n"Нормально, но могло быть лучше" → ?',
    systemPrompt: 'Ты — классификатор тональности текста. Отвечай одним словом.',
  },
  {
    name: 'Chain-of-Thought',
    description: 'Пошаговое рассуждение',
    payload: 'В компании 50 сотрудников. 60% — разработчики. Из них 40% знают Python. Сколько разработчиков знают Python?',
    systemPrompt: 'Ты — математик. Решай задачи пошагово, объясняя каждое действие.',
  },
];

// ============================================================
// AGENT BUILDER DATA
// ============================================================

export const availableSkills = [
  { slug: 'prompt-basics', name: 'Основы промпт-инжиниринга', category: 'prompt' },
  { slug: 'cot-reasoning', name: 'Chain-of-Thought рассуждение', category: 'prompt' },
  { slug: 'few-shot', name: 'Few-shot обучение', category: 'prompt' },
  { slug: 'tool-use', name: 'Использование инструментов', category: 'tool' },
  { slug: 'mcp-integration', name: 'MCP интеграция', category: 'mcp' },
  { slug: 'rag-query', name: 'RAG запросы', category: 'rag' },
  { slug: 'react-pattern', name: 'ReAct паттерн', category: 'agent' },
  { slug: 'planning', name: 'Планирование задач', category: 'agent' },
];

export const mockAgentTemplate: AgentTemplate = {
  id: 'at-1',
  slug: 'custom-agent',
  name: '',
  description: '',
  skills: [],
  systemPrompt: '',
  tools: [],
  mode: 'educational',
};

// ============================================================
// WORKFLOW DATA
// ============================================================

export const workflowNodeTypes = [
  { type: 'trigger' as const, label: 'Триггер', icon: '⚡', color: 'bg-amber-100 dark:bg-amber-900/30' },
  { type: 'skill' as const, label: 'Навык', icon: '🛠️', color: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { type: 'agent' as const, label: 'Агент', icon: '🤖', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { type: 'condition' as const, label: 'Условие', icon: '🔀', color: 'bg-purple-100 dark:bg-purple-900/30' },
  { type: 'output' as const, label: 'Вывод', icon: '📤', color: 'bg-rose-100 dark:bg-rose-900/30' },
];

export const mockWorkflowNodes: WorkflowNode[] = [
  { id: 'n1', type: 'trigger', label: 'Запрос пользователя', config: {}, position: { x: 50, y: 80 } },
  { id: 'n2', type: 'skill', label: 'Анализ промпта', config: { skillSlug: 'prompt-basics' }, position: { x: 250, y: 80 } },
  { id: 'n3', type: 'condition', label: 'Требуется RAG?', config: { condition: 'has_knowledge_query' }, position: { x: 450, y: 80 } },
  { id: 'n4', type: 'agent', label: 'RAG-агент', config: { agentSlug: 'rag-agent' }, position: { x: 650, y: 30 } },
  { id: 'n5', type: 'output', label: 'Формирование ответа', config: {}, position: { x: 650, y: 150 } },
];

export const mockWorkflowEdges: WorkflowEdge[] = [
  { id: 'e1', from: 'n1', to: 'n2' },
  { id: 'e2', from: 'n2', to: 'n3' },
  { id: 'e3', from: 'n3', to: 'n4', label: 'Да', condition: 'has_knowledge_query' },
  { id: 'e4', from: 'n3', to: 'n5', label: 'Нет' },
];

// ============================================================
// MCP DATA
// ============================================================

export const mockMCPServers: MCPServer[] = [
  {
    id: 'mcp-1',
    slug: 'filesystem',
    name: 'Filesystem Server',
    description: 'Доступ к файловой системе для чтения и записи файлов',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    env: {},
    tools: [
      { name: 'read_file', description: 'Чтение содержимого файла', inputSchema: { type: 'object', properties: { path: { type: 'string', description: 'Путь к файлу' } }, required: ['path'] } },
      { name: 'write_file', description: 'Запись содержимого в файл', inputSchema: { type: 'object', properties: { path: { type: 'string', description: 'Путь к файлу' }, content: { type: 'string', description: 'Содержимое' } }, required: ['path', 'content'] } },
      { name: 'list_directory', description: 'Получение списка файлов в директории', inputSchema: { type: 'object', properties: { path: { type: 'string', description: 'Путь к директории' } }, required: ['path'] } },
    ],
    mode: 'educational',
  },
  {
    id: 'mcp-2',
    slug: 'web-search',
    name: 'Web Search Server',
    description: 'Поиск в интернете через API',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-web-search'],
    env: { SEARCH_API_KEY: '' },
    tools: [
      { name: 'search', description: 'Поиск в интернете', inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Поисковый запрос' }, max_results: { type: 'number', description: 'Макс. количество результатов' } }, required: ['query'] } },
    ],
    mode: 'advanced',
  },
  {
    id: 'mcp-3',
    slug: 'github',
    name: 'GitHub Server',
    description: 'Интеграция с GitHub API',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: { GITHUB_TOKEN: '' },
    tools: [
      { name: 'create_issue', description: 'Создание issue в репозитории', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' } }, required: ['owner', 'repo', 'title'] } },
      { name: 'search_repositories', description: 'Поиск репозиториев', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
    ],
    mode: 'advanced',
  },
];

// ============================================================
// RAG DATA
// ============================================================

export const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb-1',
    slug: 'ai-docs',
    name: 'AI Документация',
    description: 'Документация по AI-инженерии и LLM',
    documents: [
      { id: 'd-1', title: 'Введение в LLM', source: 'llm-intro.md', chunkCount: 12, createdAt: new Date('2025-01-15') },
      { id: 'd-2', title: 'Промпт-инжиниринг гайд', source: 'prompt-guide.md', chunkCount: 24, createdAt: new Date('2025-02-01') },
    ],
    chunkSize: 512,
    overlap: 64,
    embedding: 'openai',
  },
  {
    id: 'kb-2',
    slug: 'company-faq',
    name: 'FAQ компании',
    description: 'Часто задаваемые вопросы и ответы',
    documents: [
      { id: 'd-3', title: 'FAQ по продуктам', source: 'products-faq.md', chunkCount: 8, createdAt: new Date('2025-01-20') },
    ],
    chunkSize: 256,
    overlap: 32,
    embedding: 'local',
  },
];

export const mockRAGResults = {
  chunks: [
    { text: 'RAG (Retrieval-Augmented Generation) — это метод, который комбинирует поиск релевантной информации с генерацией ответа языковой моделью...', score: 0.95, source: 'llm-intro.md' },
    { text: 'Для эффективного RAG необходимо правильно выбрать стратегию чанкинга: fixed-size, semantic или recursive...', score: 0.87, source: 'prompt-guide.md' },
    { text: 'Эмбеддинги преобразуют текст в векторное представление, позволяя вычислять семантическое сходство между запросом и документами...', score: 0.82, source: 'llm-intro.md' },
  ],
  answer: 'RAG (Retrieval-Augmented Generation) — это метод генерации ответов, при котором языковая модель сначала находит релевантную информацию в базе знаний, а затем использует её для формирования точного ответа с цитированием источников. Это позволяет снизить галлюцинации и предоставить актуальную информацию.',
};

// ============================================================
// MODELS DATA
// ============================================================

export const mockModels: ModelConfig[] = [
  { id: 'm-1', slug: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter', modelId: 'openai/gpt-4o-mini', isFree: true, contextWindow: 128000, maxTokens: 16384, enabled: true },
  { id: 'm-2', slug: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'openrouter', modelId: 'anthropic/claude-3-haiku', isFree: true, contextWindow: 200000, maxTokens: 4096, enabled: true },
  { id: 'm-3', slug: 'llama-3-8b', name: 'Llama 3 8B', provider: 'openrouter', modelId: 'meta-llama/llama-3-8b-instruct', isFree: true, contextWindow: 8192, maxTokens: 4096, enabled: true },
  { id: 'm-4', slug: 'gpt-4o', name: 'GPT-4o', provider: 'openrouter', modelId: 'openai/gpt-4o', isFree: false, contextWindow: 128000, maxTokens: 16384, enabled: true },
  { id: 'm-5', slug: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', modelId: 'anthropic/claude-3.5-sonnet', isFree: false, contextWindow: 200000, maxTokens: 8192, enabled: true },
];

// ============================================================
// SECURITY DATA
// ============================================================

export const mockSecurityRules: SecurityRule[] = [
  { id: 'sr-1', slug: 'no-exec-code', name: 'Блокировка выполнения кода', description: 'Запрещает генерацию и выполнение произвольного кода без песочницы', category: 'input-validation', severity: 'critical', pattern: '(exec|eval|system)\\s*\\(', action: 'block', enabled: true },
  { id: 'sr-2', slug: 'pii-filter', name: 'Фильтр персональных данных', description: 'Обнаруживает и маскирует персональные данные в выводе', category: 'output-filter', severity: 'high', pattern: '\\b\\d{3}[-.]?\\d{2}[-.]?\\d{6}\\b', action: 'sanitize', enabled: true },
  { id: 'sr-3', slug: 'rate-limit-api', name: 'Ограничение частоты запросов', description: 'Лимитирует количество запросов к API в минуту', category: 'rate-limit', severity: 'medium', action: 'warn', enabled: true },
  { id: 'sr-4', slug: 'auth-check', name: 'Проверка авторизации', description: 'Требует авторизацию для доступа к защищённым ресурсам', category: 'auth', severity: 'high', action: 'block', enabled: true },
  { id: 'sr-5', slug: 'data-encrypt', name: 'Шифрование данных', description: 'Обеспечивает шифрование конфиденциальных данных при хранении', category: 'data-protection', severity: 'critical', action: 'block', enabled: true },
  { id: 'sr-6', slug: 'prompt-injection', name: 'Защита от prompt injection', description: 'Обнаруживает попытки внедрения вредоносных инструкций в промпт', category: 'input-validation', severity: 'critical', pattern: '(ignore|disregard|forget).*(previous|above|instructions)', action: 'block', enabled: true },
];

export const mockSecurityLog = [
  { timestamp: '2025-06-14 15:32:01', rule: 'no-exec-code', action: 'blocked', details: 'Попытка выполнения: eval("process.exit()")', severity: 'critical' as const },
  { timestamp: '2025-06-14 15:28:45', rule: 'pii-filter', action: 'sanitized', details: 'Обнаружен номер телефона в выводе, замаскирован', severity: 'high' as const },
  { timestamp: '2025-06-14 15:15:22', rule: 'rate-limit-api', action: 'warned', details: 'Превышен лимит: 25 запросов/мин для пользователя user_42', severity: 'medium' as const },
  { timestamp: '2025-06-14 14:58:10', rule: 'prompt-injection', action: 'blocked', details: 'Обнаружена попытка prompt injection: "ignore previous instructions"', severity: 'critical' as const },
  { timestamp: '2025-06-14 14:30:05', rule: 'auth-check', action: 'blocked', details: 'Неавторизованный доступ к /api/admin', severity: 'high' as const },
];

// ============================================================
// ADMIN DATA
// ============================================================

export const mockAdminStats: AdminStats = {
  totalUsers: 1247,
  totalSkills: 48,
  totalTopics: 23,
  totalSandboxRuns: 8432,
  totalChatSessions: 5621,
  activeUsersToday: 156,
};

export const mockRecentActivity = [
  { user: 'Алексей К.', action: 'Завершил навык «Chain-of-Thought»', time: '2 мин назад', type: 'skill' as const },
  { user: 'Мария С.', action: 'Запустил песочницу «RAG-запросы»', time: '5 мин назад', type: 'sandbox' as const },
  { user: 'Дмитрий В.', action: 'Создал нового агента', time: '12 мин назад', type: 'agent' as const },
  { user: 'Елена П.', action: 'Прошла тему «MCP основы»', time: '18 мин назад', type: 'topic' as const },
  { user: 'Иван Р.', action: 'Получил достижение «Первый агент»', time: '25 мин назад', type: 'achievement' as const },
  { user: 'Ольга Н.', action: 'Добавила документ в RAG-базу', time: '30 мин назад', type: 'rag' as const },
];

export const mockSystemConfig = [
  { key: 'DEFAULT_MODEL', value: 'gpt-4o-mini', description: 'Модель по умолчанию' },
  { key: 'MAX_TOKENS', value: '4096', description: 'Макс. количество токенов' },
  { key: 'RATE_LIMIT_RPM', value: '20', description: 'Лимит запросов в минуту' },
  { key: 'CHUNK_SIZE_DEFAULT', value: '512', description: 'Размер чанка по умолчанию' },
  { key: 'EMBEDDING_PROVIDER', value: 'openai', description: 'Провайдер эмбеддингов' },
];

// ============================================================
// ACHIEVEMENTS DATA
// ============================================================

export const mockAchievements: Achievement[] = [
  { id: 'a-1', slug: 'first-skill', title: 'Первый навык', description: 'Завершите первый навык', icon: '🎯', category: 'skills', xpReward: 50, earned: true, earnedAt: new Date('2025-06-10') },
  { id: 'a-2', slug: 'prompt-master', title: 'Мастер промптов', description: 'Завершите 5 навыков в категории «Промпты»', icon: '✍️', category: 'skills', xpReward: 200, earned: true, earnedAt: new Date('2025-06-12') },
  { id: 'a-3', slug: 'agent-creator', title: 'Создатель агентов', description: 'Создайте первого AI-агента', icon: '🤖', category: 'agents', xpReward: 100, earned: true, earnedAt: new Date('2025-06-13') },
  { id: 'a-4', slug: 'sandbox-explorer', title: 'Исследователь песочницы', description: 'Запустите 10 экспериментов в песочнице', icon: '🔬', category: 'sandbox', xpReward: 150, earned: false },
  { id: 'a-5', slug: 'workflow-builder', title: 'Строитель воркфлоу', description: 'Создайте первый AI-воркфлоу', icon: '⚙️', category: 'workflows', xpReward: 100, earned: false },
  { id: 'a-6', slug: 'mcp-integrator', title: 'MCP-интегратор', description: 'Подключите 3 MCP-сервера', icon: '🔌', category: 'mcp', xpReward: 150, earned: false },
  { id: 'a-7', slug: 'rag-specialist', title: 'RAG-специалист', description: 'Создайте базу знаний и выполните 5 запросов', icon: '📚', category: 'rag', xpReward: 150, earned: false },
  { id: 'a-8', slug: 'streak-7', title: 'Неделя подряд', description: 'Занимайтесь 7 дней подряд', icon: '🔥', category: 'streak', xpReward: 200, earned: false },
  { id: 'a-9', slug: 'streak-30', title: 'Месяц подряд', description: 'Занимайтесь 30 дней подряд', icon: '💪', category: 'streak', xpReward: 500, earned: false },
  { id: 'a-10', slug: 'all-categories', title: 'Универсал', description: 'Завершите навыки во всех категориях', icon: '🏆', category: 'general', xpReward: 500, earned: false },
  { id: 'a-11', slug: 'security-guard', title: 'Страж безопасности', description: 'Настройте 5 правил безопасности', icon: '🛡️', category: 'security', xpReward: 100, earned: false },
  { id: 'a-12', slug: 'level-10', title: 'Уровень 10', description: 'Достигните 10-го уровня', icon: '⭐', category: 'general', xpReward: 300, earned: false },
];

// ============================================================
// CHAT DATA
// ============================================================

export const chatModelOptions = [
  { value: 'auto', label: 'Авто-выбор' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (бесплатно)' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku (бесплатно)' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
];
