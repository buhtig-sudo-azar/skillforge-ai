import { Topic } from '@/types';

export const categoryGradients: Record<string, string> = {
  skills: 'from-amber-500 to-orange-600',
  agents: 'from-blue-500 to-cyan-600',
  chatbots: 'from-purple-500 to-pink-600',
  sandboxes: 'from-green-500 to-emerald-600',
  workflows: 'from-red-500 to-rose-600',
  mcp: 'from-teal-500 to-cyan-600',
  rag: 'from-indigo-500 to-violet-600',
};

export const categoryIcons: Record<string, string> = {
  skills: '🛠️',
  agents: '🤖',
  chatbots: '💬',
  sandboxes: '🔬',
  workflows: '⚙️',
  mcp: '🔌',
  rag: '📚',
};

export const topics: Topic[] = [
  // ============================================================
  // SKILLS
  // ============================================================
  {
    id: 't-skills',
    slug: 'skills',
    title: 'AI Skills & SKILL.md',
    description: 'Научитесь создавать и управлять AI-навыками — базовыми строительными блоками любой AI-системы.',
    icon: '🛠️',
    gradient: categoryGradients.skills,
    order: 0,
    category: 'skills',
    isPublic: true,
    subtopics: [
      {
        id: 'st-skill-1',
        topicId: 't-skills',
        slug: 'what-is-skill',
        title: 'Что такое AI Skill?',
        order: 0,
        introduction: {
          what: 'AI Skill — это инструкция для ИИ-агента, сохранённая в файле SKILL.md, которая описывает, как решать конкретную задачу. Скилл состоит из YAML-блока с метаданными и Markdown-тела с пошаговой инструкцией.',
          why: 'Скиллы позволяют один раз описать рабочий процесс и не повторять агенту одни и те же инструкции. Нейросеть сама определяет, когда применить навык — это называется автотриггеринг.',
          where: 'Скиллы используются в AI-агентах вроде Claude Code, Codex, Hermes. Они лежат в папке skills/ внутри проекта и автоматически загружаются агентом.',
          problem: 'Без скиллов приходится каждый раз заново объяснять ИИ, как оформлять код, писать документацию или разбирать ошибки. Это неэффективно и приводит к нестабильным результатам.'
        },
        theory: {
          terms: [
            { name: 'SKILL.md', definition: 'Файл в формате Markdown с YAML-заголовком, содержащий инструкцию для ИИ-агента' },
            { name: 'Автотриггеринг', definition: 'Механизм, при котором ИИ сам решает, когда применить навык, основываясь на контексте задачи' },
            { name: 'YAML Frontmatter', definition: 'Блок метаданных в начале файла, выделенный тремя дефисами, содержащий name и description навыка' },
            { name: 'Композиция навыков', definition: 'Объединение нескольких скиллов для решения сложных задач — принцип модульности' }
          ],
          principles: [
            'Каждый навык должен решать одну конкретную задачу',
            'Описание в YAML определяет, когда агент применит навык',
            'Качественный скилл триггерится автоматически в 90% релевантных задач',
            'Скиллы можно комбинировать — сложные системы состоят из простых навыков'
          ],
          architecture: 'Архитектура Skill Engine: skills/ → SKILL.md (name, description, body) + templates/ + scripts/ + references/. Агент сканирует папку навыков, читает YAML-блоки и выбирает подходящий навык по контексту задачи.',
          connections: ['Агенты используют навыки для выполнения задач', 'Воркфлоу оркестрируют последовательность навыков', 'Песочницы позволяют тестировать навыки безопасно']
        },
        diagramType: 'flow',
        diagramData: {
          type: 'flow',
          nodes: [
            { id: '1', label: 'Пользователь ставит задачу', type: 'start' },
            { id: '2', label: 'Агент сканирует навыки', type: 'process' },
            { id: '3', label: 'Подходящий навык найден?', type: 'decision' },
            { id: '4', label: 'Применить навык', type: 'process' },
            { id: '5', label: 'Запросить уточнение', type: 'process' },
            { id: '6', label: 'Результат', type: 'end' }
          ],
          edges: [
            { from: '1', to: '2' },
            { from: '2', to: '3' },
            { from: '3', to: '4', label: 'Да' },
            { from: '3', to: '5', label: 'Нет' },
            { from: '4', to: '6' },
            { from: '5', to: '6' }
          ]
        },
        examples: [
          {
            title: 'Простой SKILL.md для форматирования кода',
            code: `---\nname: code-formatter\ndescription: Форматирует код согласно правилам проекта\n---\n\n# Code Formatter\n\n## Правила форматирования\n\n- Используй 2 пробела для отступов\n- Ставь точку с запятой в конце строк\n- Группируй импорты по алфавиту\n- Добавляй пустую строку между блоками логики`,
            language: 'markdown',
            explanation: 'Минимальный скилл: YAML-блок с name и description, затем Markdown-инструкция. Агент увидит этот навык и применит его, когда задача связана с форматированием кода.'
          },
          {
            title: 'Навык с шаблоном и скриптом',
            code: `---\nname: api-endpoint-generator\ndescription: Генерирует REST API эндпоинт по спецификации\n---\n\n# API Endpoint Generator\n\n## Шаги\n\n1. Прочитай спецификацию эндпоинта\n2. Используй шаблон из templates/endpoint.ts\n3. Сгенерируй handler, validation, types\n4. Добавь Swagger документацию\n5. Запусти scripts/test-endpoint.sh для проверки`,
            language: 'markdown',
            explanation: 'Расширенный скилл ссылается на внешние ресурсы: шаблоны кода в templates/ и скрипты проверки в scripts/. Это делает навык мощнее и переиспользуемее.'
          }
        ],
        sandboxType: 'prompt',
        sandboxConfig: {
          presets: [
            { name: 'Базовый навык', description: 'Создай простой навык для форматирования кода', payload: 'Создай навык для форматирования TypeScript кода', systemPrompt: 'Ты — эксперт по созданию AI-навыков. Помоги создать корректный SKILL.md файл.' },
            { name: 'Навык с шаблоном', description: 'Создай навык с использованием шаблонов', payload: 'Создай навык для генерации React компонентов по шаблону', systemPrompt: 'Ты — эксперт по созданию AI-навыков. Создай навык, который использует шаблоны кода.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Отсутствует YAML-блок', explanation: 'Без name и description агент не сможет найти и применить навык', correct: 'Всегда добавляй YAML frontmatter с обязательными полями name и description' },
          { error: 'Слишком общее описание навыка', explanation: 'Если description размытый, агент не поймёт, когда применять навык', correct: 'Пиши конкретное описание: какую задачу решает и в каких условиях применяется' },
          { error: 'Один навык на все случаи', explanation: 'Монструозный навык на 500 строк агент не сможет корректно триггерить', correct: 'Разделяй на несколько узконаправленных навыков — принцип единственной ответственности' }
        ]
      },
      {
        id: 'st-skill-2',
        topicId: 't-skills',
        slug: 'skill-structure',
        title: 'Структура навыка',
        order: 1,
        introduction: {
          what: 'Структура навыка — это организация файлов и папок, составляющих AI-скилл. Основной файл SKILL.md содержит инструкцию, а дополнительные папки хранят шаблоны, скрипты и примеры.',
          why: 'Правильная структура делает навык переиспользуемым, тестируемым и поддерживаемым. Другие разработчики (и ИИ-агенты) смогут легко понять и использовать навык.',
          where: 'Структура стандартизирована в экосистемах Claude Code, Codex и Hermes. Папка навыка располагается в skills/ директории проекта.',
          problem: 'Без стандартизированной структуры навыки становятся несовместимыми между агентами, их трудно переиспользовать и поддерживать.'
        },
        theory: {
          terms: [
            { name: 'templates/', definition: 'Папка с шаблонами кода, которые ИИ использует при выполнении навыка' },
            { name: 'scripts/', definition: 'Папка с исполняемыми скриптами для автоматизации задач' },
            { name: 'references/', definition: 'Папка с документацией и примерами хороших результатов' },
            { name: 'assets/', definition: 'Папка со статическими ресурсами: иконки, шрифты, изображения' }
          ],
          principles: [
            'SKILL.md — обязательный файл, остальные опциональны',
            'Шаблоны ускоряют работу навыка, предоставляя готовые заготовки',
            'Скрипты позволяют навыку выполнять проверку и автоматизацию',
            'Примеры в references/ помогают ИИ понять ожидаемый результат'
          ],
          architecture: 'skills/name/SKILL.md + templates/*.ts + scripts/*.sh + references/*.md + assets/*',
          connections: ['Шаблоны ссылаются на типы из Topic Engine', 'Скрипты могут вызывать Sandbox для валидации', 'Примеры используются в Lesson Engine']
        },
        diagramType: 'tree',
        diagramData: {
          type: 'tree',
          root: {
            id: 'root',
            label: 'skills/my-skill/',
            children: [
              { id: 'skill-md', label: 'SKILL.md (обязательно)' },
              { id: 'templates', label: 'templates/', children: [
                { id: 'tmpl1', label: 'component.ts' },
                { id: 'tmpl2', label: 'handler.ts' }
              ]},
              { id: 'scripts', label: 'scripts/', children: [
                { id: 'scr1', label: 'validate.sh' },
                { id: 'scr2', label: 'generate.py' }
              ]},
              { id: 'references', label: 'references/', children: [
                { id: 'ref1', label: 'examples.md' }
              ]}
            ]
          }
        },
        examples: [
          {
            title: 'Полная структура навыка',
            code: `skills/\n  code-review/\n    SKILL.md          # Основная инструкция\n    templates/\n      review-template.md  # Шаблон ревью\n    scripts/\n      lint-check.sh       # Скрипт проверки\n    references/\n      good-review.md      # Пример хорошего ревью`,
            language: 'text',
            explanation: 'Полная структура навыка code-review. SKILL.md описывает процесс, templates содержит шаблон, scripts — автоматизацию, references — примеры.'
          }
        ],
        sandboxType: 'prompt',
        sandboxConfig: {
          presets: [
            { name: 'Создание структуры', description: 'Создай полную структуру навыка', payload: 'Создай структуру навыка для анализа логов ошибок', systemPrompt: 'Ты — эксперт по структуре AI-навыков. Помоги создать правильную файловую структуру.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Всё в одном SKILL.md', explanation: 'Инструкция, шаблоны и скрипты в одном файле делают навык нечитаемым', correct: 'Разноси контент по папкам: шаблоны в templates/, скрипты в scripts/' },
          { error: 'Нет примеров в references/', explanation: 'Без примеров ИИ не понимает, какой результат ожидается', correct: 'Добавляй 2-3 примера хороших результатов в references/' }
        ]
      },
      {
        id: 'st-skill-3',
        topicId: 't-skills',
        slug: 'skill-categories',
        title: 'Категории навыков',
        order: 2,
        introduction: {
          what: 'Категории навыков — это классификация AI-скиллов по типу решаемой задачи: промпт-инжиниринг, агентные задачи, инструменты, MCP, RAG, воркфлоу, архитектура и безопасность.',
          why: 'Категоризация помогает агентам быстрее находить нужный навык и понимать его назначение. Это как каталогизация библиотеки — без неё поиск превращается в хаос.',
          where: 'Категория указывается в YAML-блоке навыка или определяется автоматически по содержимому.',
          problem: 'Без категоризации навыки перемешиваются, агент тратит время на поиск подходящего и может выбрать неверный.'
        },
        theory: {
          terms: [
            { name: 'Prompt Skills', definition: 'Навыки работы с промптами: шаблоны, few-shot, chain-of-thought' },
            { name: 'Agent Skills', definition: 'Навыки агентов: планирование, инструментальное использование, рефлексия' },
            { name: 'Tool Skills', definition: 'Навыки определения и использования инструментов (function calling)' },
            { name: 'MCP Skills', definition: 'Навыки подключения и использования Model Context Protocol серверов' },
            { name: 'RAG Skills', definition: 'Навыки работы с retrieval-augmented generation: поиск, индексация, генерация' }
          ],
          principles: [
            'Каждый навык принадлежит ровно одной категории',
            'Категория влияет на автотриггеринг — агент ищет навык в релевантной категории',
            'Междисциплинарные навыки декомпозируются на несколько узких',
            'Категории расширяются — можно добавлять новые типы навыков'
          ],
          architecture: 'Skill Category Taxonomy: prompt → agent → tool → mcp → rag → workflow → architecture → security',
          connections: ['Prompt skills используются в Chatbot Engine', 'Agent skills основа Agent Engine', 'Tool skills нужны для MCP Engine']
        },
        diagramType: 'knowledge-map',
        diagramData: {
          type: 'knowledge-map',
          concepts: [
            { id: 'c1', label: 'Prompt', description: 'Промпт-инжиниринг' },
            { id: 'c2', label: 'Agent', description: 'Агентные задачи' },
            { id: 'c3', label: 'Tool', description: 'Инструменты' },
            { id: 'c4', label: 'MCP', description: 'Model Context Protocol' },
            { id: 'c5', label: 'RAG', description: 'Поиск и генерация' },
            { id: 'c6', label: 'Workflow', description: 'Воркфлоу' },
            { id: 'c7', label: 'Architecture', description: 'Архитектура' },
            { id: 'c8', label: 'Security', description: 'Безопасность' }
          ],
          relations: [
            { from: 'c1', to: 'c2', label: 'подаёт промпт' },
            { from: 'c2', to: 'c3', label: 'вызывает инструмент' },
            { from: 'c3', to: 'c4', label: 'подключает через MCP' },
            { from: 'c4', to: 'c5', label: 'предоставляет данные' },
            { from: 'c6', to: 'c2', label: 'оркестрирует' },
            { from: 'c8', to: 'c1', label: 'валидирует' }
          ]
        },
        examples: [
          {
            title: 'Prompt Skill: Few-Shot шаблон',
            code: `---\nname: few-shot-classifier\ndescription: Классифицирует текст по категориям с помощью few-shot примеров\ncategory: prompt\n---\n\n# Few-Shot Classifier\n\nКлассифицируй текст, используя примеры:\n\n- "Акция выросла на 5%" → финансы\n- "Гол забил Месси" → спорт\n- "Новый процессор Apple" → технологии`,
            language: 'markdown',
            explanation: 'Навык категории prompt — использует few-shot примеры для классификации. Категория помогает агенту найти этот навык при задачах классификации.'
          }
        ],
        sandboxType: 'prompt',
        sandboxConfig: {
          presets: [
            { name: 'Определение категории', description: 'Определи категорию навыка по описанию', payload: 'Навык, который подключается к базе данных и извлекает релевантные документы', systemPrompt: 'Определи категорию навыка: prompt, agent, tool, mcp, rag, workflow, architecture или security.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Неверная категория', explanation: 'Если навык в неправильной категории, агент не найдёт его', correct: 'Указывай категорию, соответствующую основной задаче навыка' },
          { error: 'Смешивание категорий', explanation: 'Навык, который и промптит, и ищет данные — неясной категории', correct: 'Разделяй на несколько навыков, каждый со своей категорией' }
        ]
      },
      {
        id: 'st-skill-4',
        topicId: 't-skills',
        slug: 'skill-composition',
        title: 'Композиция навыков',
        order: 3,
        introduction: {
          what: 'Композиция навыков — это принцип модульности, согласно которому любая часть системы является навыком или композицией навыков. Агенты, чат-боты, воркфлоу — всё это составные навыки.',
          why: 'Композиция позволяет строить сложные системы из простых блоков. Как из LEGO — маленькие детали собираются в большие конструкции.',
          where: 'Композиция применяется на уровне воркфлоу (последовательность навыков), агентов (набор навыков + инструменты) и чат-ботов (системный промпт + навыки).',
          problem: 'Без композиции каждый компонент нужно разрабатывать с нуля. Это ведёт к дублированию кода и сложности поддержки.'
        },
        theory: {
          terms: [
            { name: 'Модульность', definition: 'Принцип: любая часть системы — это навык или композиция навыков' },
            { name: 'Композиция', definition: 'Объединение нескольких навыков в более крупную функциональную единицу' },
            { name: 'Декомпозиция', definition: 'Разделение сложной задачи на простые навыки' }
          ],
          principles: [
            'Маленькие навыки легче тестировать и переиспользовать',
            'Композиция следует принципу единственной ответственности',
            'Сложные системы = простые навыки + правильная оркестрация',
            'Любой Engine системы — это тоже навык'
          ],
          architecture: 'Skill → Composition → Agent → Workflow → System. Каждый уровень строится на предыдущем.',
          connections: ['Воркфлоу — композиция навыков с оркестрацией', 'Агент — навык + инструменты + память', 'Чат-бот — навык + системный промпт + история']
        },
        diagramType: 'graph',
        diagramData: {
          type: 'graph',
          nodes: [
            { id: 'n1', label: 'Skill A', group: 'skill' },
            { id: 'n2', label: 'Skill B', group: 'skill' },
            { id: 'n3', label: 'Skill C', group: 'skill' },
            { id: 'n4', label: 'Agent', group: 'composition' },
            { id: 'n5', label: 'Workflow', group: 'composition' },
            { id: 'n6', label: 'System', group: 'system' }
          ],
          edges: [
            { from: 'n1', to: 'n4', label: 'часть' },
            { from: 'n2', to: 'n4', label: 'часть' },
            { from: 'n3', to: 'n5', label: 'часть' },
            { from: 'n4', to: 'n5', label: 'шаг' },
            { from: 'n5', to: 'n6', label: 'часть' }
          ]
        },
        examples: [
          {
            title: 'Композиция навыков в агенте',
            code: `---\nname: code-review-agent\ndescription: Агент для ревью кода, использующий композицию навыков\n---\n\n# Code Review Agent\n\n## Навыки:\n1. lint-checker — проверяет стиль кода\n2. bug-detector — ищет потенциальные баги\n3. security-scanner — проверяет уязвимости\n4. performance-analyzer — анализирует производительность\n\n## Оркестрация:\nВыполни навыки параллельно, затем собери результаты в единый отчёт.`,
            language: 'markdown',
            explanation: 'Агент code-review состоит из 4 навыков. Каждый навык независим, но вместе они дают полный анализ кода.'
          }
        ],
        sandboxType: 'architecture',
        sandboxConfig: {
          presets: [
            { name: 'Спроектировать композицию', description: 'Создай композицию навыков для задачи', payload: 'Спроектируй систему навыков для автоматического написания документации к коду', systemPrompt: 'Ты — архитектор AI-систем. Помоги создать композицию навыков по принципу модульности.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Монолитный навык вместо композиции', explanation: 'Огромный навык на 1000 строк вместо нескольких маленьких', correct: 'Разделяй на атомарные навыки и компонуй через агента или воркфлоу' },
          { error: 'Круговые зависимости', explanation: 'Навык A вызывает навык B, который вызывает навык A', correct: 'Строй иерархию: базовые навыки → композиции → система' }
        ]
      }
    ]
  },
  // ============================================================
  // AGENTS
  // ============================================================
  {
    id: 't-agents',
    slug: 'agents',
    title: 'AI Агенты',
    description: 'Изучите архитектуру и паттерны проектирования автономных AI-агентов — от простых до мультиагентных систем.',
    icon: '🤖',
    gradient: categoryGradients.agents,
    order: 1,
    category: 'agents',
    isPublic: true,
    subtopics: [
      {
        id: 'st-agent-1',
        topicId: 't-agents',
        slug: 'what-is-agent',
        title: 'Что такое AI Агент?',
        order: 0,
        introduction: {
          what: 'AI Агент — это автономная система, способная воспринимать среду, принимать решения и выполнять действия для достижения целей. В отличие от простого чат-бота, агент планирует, использует инструменты и адаптируется.',
          why: 'Агенты автоматизируют сложные задачи, требующие рассуждений и принятия решений. Они могут работать автономно, вызывать API, обрабатывать данные и координировать действия.',
          where: 'Агенты применяются в автоматизации DevOps, анализе данных, написании кода, поддержке пользователей и оркестрации бизнес-процессов.',
          problem: 'Простые LLM-вызовы не могут решать многошаговые задачи, использовать инструменты или работать с внешними системами. Агенты решают эту проблему.'
        },
        theory: {
          terms: [
            { name: 'Цикл восприятие-действие', definition: 'Основной цикл агента: восприятие → рассуждение → действие → наблюдение результата' },
            { name: 'Автономность', definition: 'Способность агента действовать без постоянного контроля человека' },
            { name: 'Инструменты (Tools)', definition: 'Функции, которые агент может вызывать для взаимодействия с внешним миром' },
            { name: 'Память агента', definition: 'Хранение контекста, истории и промежуточных результатов между шагами' }
          ],
          principles: [
            'Агент действует в цикле: думай → действуй → наблюдай',
            'Инструменты расширяют возможности агента за пределы текста',
            'Память обеспечивает контекстность и связность действий',
            'Агент должен знать свои ограничения и просить помощи'
          ],
          architecture: 'Agent = LLM + System Prompt + Tools + Memory + Planning Loop. Агент получает задачу, планирует шаги, вызывает инструменты, анализирует результаты и итерирует.',
          connections: ['Инструменты агента описываются как Skills', 'Агенты используются в Workflow Engine', 'Песочницы позволяют тестировать агентов безопасно']
        },
        diagramType: 'flow',
        diagramData: {
          type: 'flow',
          nodes: [
            { id: '1', label: 'Получить задачу', type: 'start' },
            { id: '2', label: 'Спланировать шаги', type: 'process' },
            { id: '3', label: 'Выбрать действие', type: 'decision' },
            { id: '4', label: 'Вызвать инструмент', type: 'process' },
            { id: '5', label: 'Сгенерировать ответ', type: 'process' },
            { id: '6', label: 'Наблюдать результат', type: 'process' },
            { id: '7', label: 'Задача выполнена?', type: 'decision' },
            { id: '8', label: 'Финальный ответ', type: 'end' }
          ],
          edges: [
            { from: '1', to: '2' },
            { from: '2', to: '3' },
            { from: '3', to: '4', label: 'Инструмент' },
            { from: '3', to: '5', label: 'Ответ' },
            { from: '4', to: '6' },
            { from: '5', to: '6' },
            { from: '6', to: '7' },
            { from: '7', to: '8', label: 'Да' },
            { from: '7', to: '2', label: 'Нет' }
          ]
        },
        examples: [
          {
            title: 'Простой агент с инструментом',
            code: `const agent = {\n  systemPrompt: "Ты — помощник для поиска информации.",\n  tools: [{\n    name: "web_search",\n    description: "Ищет информацию в интернете",\n    parameters: {\n      query: { type: "string", description: "Поисковый запрос" }\n    }\n  }],\n  maxIterations: 5\n};`,
            language: 'typescript',
            explanation: 'Минимальная конфигурация агента: системный промпт, один инструмент и ограничение на количество итераций.'
          }
        ],
        sandboxType: 'agent',
        sandboxConfig: {
          presets: [
            { name: 'Простой агент', description: 'Создай агента с одним инструментом', payload: 'Создай агента, который может искать информацию и отвечать на вопросы', systemPrompt: 'Ты — эксперт по проектированию AI-агентов. Помоги описать конфигурацию агента.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Нет ограничения на итерации', explanation: 'Агент может зациклиться и потратить все токены', correct: 'Всегда устанавливай maxIterations и timeout' },
          { error: 'Слишком много инструментов', explanation: 'Агент путается, когда инструментов больше 10', correct: 'Группируй инструменты и подавай только релевантные' }
        ]
      },
      {
        id: 'st-agent-2',
        topicId: 't-agents',
        slug: 'agent-architecture',
        title: 'Архитектура агента',
        order: 1,
        introduction: {
          what: 'Архитектура агента — это паттерн организации цикла рассуждений и действий. Основные паттерны: ReAct, Chain-of-Thought, Plan-and-Execute, Reflexion.',
          why: 'Правильная архитектура определяет эффективность агента. ReAct лучше для задач с инструментами, CoT — для рассуждений, Plan-and-Execute — для многошаговых задач.',
          where: 'Выбор архитектуры зависит от задачи: простые запросы — CoT, инструментальные задачи — ReAct, сложные проекты — Plan-and-Execute.',
          problem: 'Неправильный выбор архитектуры ведёт к ненужным итерациям, потере контекста или неспособности решить задачу.'
        },
        theory: {
          terms: [
            { name: 'ReAct', definition: 'Reasoning + Acting: агент чередует рассуждения и действия в каждом шаге' },
            { name: 'Chain-of-Thought (CoT)', definition: 'Пошаговые рассуждения: агент расписывает логику перед ответом' },
            { name: 'Plan-and-Execute', definition: 'Сначала планирует все шаги, затем выполняет их последовательно' },
            { name: 'Reflexion', definition: 'Агент рефлексирует над результатами и улучшает свой подход' }
          ],
          principles: [
            'ReAct: мысль → действие → наблюдение → мысль → ...',
            'CoT добавляет промежуточные рассуждения для сложных задач',
            'Plan-and-Execute эффективен для задач с известной структурой',
            'Reflexion позволяет агенту учиться на ошибках'
          ],
          architecture: 'ReAct Loop: Thought → Action → Observation → (repeat). Plan-and-Execute: Plan → [Execute Step → Evaluate] → Final.',
          connections: ['ReAct использует инструменты из Tool Engine', 'Планирование описывается как Workflow', 'Рефлексия использует RAG для хранения опыта']
        },
        diagramType: 'flow',
        diagramData: {
          type: 'flow',
          nodes: [
            { id: '1', label: 'Задача', type: 'start' },
            { id: '2', label: 'Thought: Что нужно сделать?', type: 'process' },
            { id: '3', label: 'Action: Вызвать инструмент', type: 'process' },
            { id: '4', label: 'Observation: Результат', type: 'process' },
            { id: '5', label: 'Задача решена?', type: 'decision' },
            { id: '6', label: 'Финальный ответ', type: 'end' }
          ],
          edges: [
            { from: '1', to: '2' },
            { from: '2', to: '3' },
            { from: '3', to: '4' },
            { from: '4', to: '5' },
            { from: '5', to: '6', label: 'Да' },
            { from: '5', to: '2', label: 'Нет' }
          ]
        },
        examples: [
          {
            title: 'ReAct промпт',
            code: `Ты — агент, решающий задачи шаг за шагом.\n\nФормат ответа:\nThought: [твоё рассуждение]\nAction: [название инструмента](аргументы)\nObservation: [результат инструмента]\n... (повторяй пока не решишь задачу)\nAnswer: [финальный ответ]`,
            language: 'text',
            explanation: 'Промпт для ReAct-агента. Чёткий формат заставляет агента рассуждать перед действием.'
          }
        ],
        sandboxType: 'agent',
        sandboxConfig: {
          presets: [
            { name: 'ReAct агент', description: 'Протестируй ReAct паттерн', payload: 'Найди столицу Франции и посчитай расстояние от Парижа до Берлина', systemPrompt: 'Ты — ReAct агент. Используй формат Thought/Action/Observation.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Бесконечный цикл ReAct', explanation: 'Агент повторяет одни и те же действия', correct: 'Добавь счётчик итераций и условие выхода' },
          { error: 'Планирование без адаптации', explanation: 'Plan-and-Execute агент не корректирует план при ошибках', correct: 'Добавь шаг оценки после каждого этапа и возможность перепланирования' }
        ]
      },
      {
        id: 'st-agent-3',
        topicId: 't-agents',
        slug: 'agent-tools',
        title: 'Инструменты агента',
        order: 2,
        introduction: {
          what: 'Инструменты агента — это функции с описанной схемой параметров, которые ИИ-агент может вызывать для взаимодействия с внешними системами: API, базы данных, файлы, веб-сервисы.',
          why: 'Без инструментов агент ограничен генерацией текста. Инструменты дают ему возможность действовать: искать информацию, выполнять код, отправлять запросы.',
          where: 'Инструменты описываются в формате function calling (OpenAI, Anthropic) или через MCP (Model Context Protocol).',
          problem: 'Без чёткого описания инструментов агент не сможет их корректно вызвать, передаст неверные параметры или вызовет несуществующую функцию.'
        },
        theory: {
          terms: [
            { name: 'Function Calling', definition: 'Механизм LLM для генерации структурированных вызовов функций с параметрами' },
            { name: 'JSON Schema', definition: 'Формат описания схемы параметров инструмента' },
            { name: 'Tool Selection', definition: 'Процесс выбора агентом подходящего инструмента из доступных' }
          ],
          principles: [
            'Каждый инструмент имеет имя, описание и схему параметров',
            'Описание должно быть достаточно подробным для корректного выбора',
            'Параметры валидируются по JSON Schema перед выполнением',
            'Результат выполнения возвращается агенту как наблюдение'
          ],
          architecture: 'Tool Definition: { name, description, parameters: JSON Schema } → LLM выбирает инструмент → Валидация параметров → Выполнение → Результат агенту',
          connections: ['Инструменты подключаются через MCP Engine', 'Валидация параметров через Security Engine', 'Результаты логируются для аналитики']
        },
        diagramType: 'flow',
        diagramData: {
          type: 'flow',
          nodes: [
            { id: '1', label: 'Агент решает вызвать инструмент', type: 'start' },
            { id: '2', label: 'Генерирует function call', type: 'process' },
            { id: '3', label: 'Валидация параметров', type: 'decision' },
            { id: '4', label: 'Выполнение функции', type: 'process' },
            { id: '5', label: 'Ошибка валидации', type: 'process' },
            { id: '6', label: 'Результат агенту', type: 'end' }
          ],
          edges: [
            { from: '1', to: '2' },
            { from: '2', to: '3' },
            { from: '3', to: '4', label: 'OK' },
            { from: '3', to: '5', label: 'Ошибка' },
            { from: '4', to: '6' },
            { from: '5', to: '2' }
          ]
        },
        examples: [
          {
            title: 'Определение инструмента',
            code: `const tools = [{\n  name: "get_weather",\n  description: "Получает текущую погоду для указанного города",\n  parameters: {\n    type: "object",\n    properties: {\n      city: {\n        type: "string",\n        description: "Название города"\n      },\n      unit: {\n        type: "string",\n        enum: ["celsius", "fahrenheit"],\n        description: "Единица измерения температуры"\n      }\n    },\n    required: ["city"]\n  }\n}];`,
            language: 'typescript',
            explanation: 'Определение инструмента get_weather с одним обязательным и одним опциональным параметром. JSON Schema описывает структуру.'
          }
        ],
        sandboxType: 'tool',
        sandboxConfig: {
          presets: [
            { name: 'Создание инструмента', description: 'Определи инструмент для агента', payload: 'Создай инструмент для поиска книг по названию', systemPrompt: 'Ты — эксперт по проектированию инструментов для AI-агентов. Создай JSON Schema описание инструмента.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Неясное описание инструмента', explanation: 'Агент не понимает, когда использовать инструмент', correct: 'Описание должно содержать: что делает, когда использовать, какие данные возвращает' },
          { error: 'Отсутствие required полей', explanation: 'Агент может не передать обязательные параметры', correct: 'Чётко указывай required поля в JSON Schema' }
        ]
      },
      {
        id: 'st-agent-4',
        topicId: 't-agents',
        slug: 'multi-agent',
        title: 'Мультиагентные системы',
        order: 3,
        introduction: {
          what: 'Мультиагентные системы — это архитектура, в которой несколько AI-агентов сотрудничают для решения сложных задач. Каждый агент специализируется на своей области и делегирует подзадачи.',
          why: 'Один агент не может быть экспертом во всём. Мультиагентные системы позволяют разделить задачи по специализации и параллелить вычисления.',
          where: 'Применяются в сложных проектах: автоматизация DevOps, анализ данных, написание кода (один агент пишет, другой проверяет, третий тестирует).',
          problem: 'Координация агентов — сложная задача. Без правильной оркестрации агенты могут конфликтовать, дублировать работу или терять контекст.'
        },
        theory: {
          terms: [
            { name: 'Оркестратор', definition: 'Агент, который координирует работу других агентов, распределяет задачи и собирает результаты' },
            { name: 'Делегирование', definition: 'Передача подзадачи от одного агента другому, более подходящему' },
            { name: 'Общая память', definition: 'Пространство для обмена информацией между агентами' }
          ],
          principles: [
            'Каждый агент имеет чёткую роль и специализацию',
            'Оркестратор распределяет задачи и разрешает конфликты',
            'Агенты общаются через структурированные сообщения',
            'Результаты агрегируются и валидируются перед возвратом'
          ],
          architecture: 'Orchestrator → [Agent A, Agent B, Agent C] → Shared Memory → Orchestrator → Result',
          connections: ['Оркестратор — это Workflow Engine', 'Каждый агент описан как Skill', 'Песочницы позволяют тестировать взаимодействие агентов']
        },
        diagramType: 'graph',
        diagramData: {
          type: 'graph',
          nodes: [
            { id: 'orch', label: 'Оркестратор', group: 'orchestrator' },
            { id: 'a1', label: 'Writer Agent', group: 'worker' },
            { id: 'a2', label: 'Reviewer Agent', group: 'worker' },
            { id: 'a3', label: 'Tester Agent', group: 'worker' },
            { id: 'mem', label: 'Shared Memory', group: 'memory' }
          ],
          edges: [
            { from: 'orch', to: 'a1', label: 'напиши код' },
            { from: 'a1', to: 'mem', label: 'сохранить' },
            { from: 'mem', to: 'a2', label: 'прочитать' },
            { from: 'a2', to: 'orch', label: 'отзыв' },
            { from: 'mem', to: 'a3', label: 'прочитать' },
            { from: 'a3', to: 'orch', label: 'результат тестов' }
          ]
        },
        examples: [
          {
            title: 'Мультиагентная система ревью кода',
            code: `const multiAgent = {\n  orchestrator: {\n    role: "Координатор ревью кода",\n    agents: ["code-writer", "code-reviewer", "test-runner"]\n  },\n  agents: [\n    { slug: "code-writer", task: "Написать код по спецификации" },\n    { slug: "code-reviewer", task: "Проверить код на баги и стиль" },\n    { slug: "test-runner", task: "Запустить тесты и собрать результаты" }\n  ]\n};`,
            language: 'typescript',
            explanation: 'Пример мультиагентной системы: оркестратор направляет задачи трём специализированным агентам.'
          }
        ],
        sandboxType: 'agent',
        sandboxConfig: {
          presets: [
            { name: 'Мультиагентная система', description: 'Спроектируй мультиагентную систему', payload: 'Спроектируй мультиагентную систему для автоматизации DevOps: мониторинг, алертинг, автоисправление', systemPrompt: 'Ты — архитектор мультиагентных AI-систем. Помоги спроектировать систему с правильной координацией агентов.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Все агенты делают всё', explanation: 'Нет специализации — агенты дублируют работу', correct: 'Каждый агент должен иметь чёткую роль и область ответственности' },
          { error: 'Нет оркестратора', explanation: 'Агенты работают хаотично без координации', correct: 'Всегда назначай оркестратора для распределения задач и разрешения конфликтов' }
        ]
      }
    ]
  },
  // ============================================================
  // CHATBOTS
  // ============================================================
  {
    id: 't-chatbots',
    slug: 'chatbots',
    title: 'Чат-боты и LLM',
    description: 'Освойте промпт-инжиниринг, стриминг ответов, управление моделями и создание интеллектуальных чат-ботов.',
    icon: '💬',
    gradient: categoryGradients.chatbots,
    order: 2,
    category: 'chatbots',
    isPublic: true,
    subtopics: [
      {
        id: 'st-chat-1',
        topicId: 't-chatbots',
        slug: 'what-is-chatbot',
        title: 'Что такое чат-бот?',
        order: 0,
        introduction: {
          what: 'Чат-бот на базе LLM — это приложение, которое ведёт диалог с пользователем, используя большую языковую модель. Он понимает контекст разговора, генерирует осмысленные ответы и может выполнять задачи через инструменты.',
          why: 'Чат-боты — самый распространённый способ взаимодействия с AI. Они используются в поддержке, образовании, автоматизации и как интерфейс к AI-агентам.',
          where: 'Чат-боты применяются в поддержке клиентов, образовательных платформах (как эта!), AI-ассистентах и интерфейсах к сложным системам.',
          problem: 'Создать чат-бот, который даёт точные, релевантные ответы и не галлюцинирует — нетривиальная задача, требующая правильных системных промптов и управления контекстом.'
        },
        theory: {
          terms: [
            { name: 'System Prompt', definition: 'Скрытая инструкция, определяющая поведение чат-бота: роль, стиль, ограничения' },
            { name: 'Контекстное окно', definition: 'Максимальный объём текста, который модель может обработать за один запрос' },
            { name: 'Галлюцинация', definition: 'Генерация моделью неверной, но правдоподобной информации' },
            { name: 'Управление контекстом', definition: 'Стратегии обработки длинных диалогов: обрезка, суммаризация, RAG' }
          ],
          principles: [
            'Системный промпт — основа поведения чат-бота',
            'Контекстное окно ограничено — управляй историей диалога',
            'Галлюцинации можно уменьшить через RAG и правильные промпты',
            'Стриминг улучшает восприятие — пользователь видит ответ сразу'
          ],
          architecture: 'User → Chat Interface → API Route (system prompt + history) → LLM → SSE Stream → Chat Interface',
          connections: ['Промпты — это Prompt Skills', 'Модели управляются через Model System', 'Стриминг реализуется через SSE']
        },
        diagramType: 'flow',
        diagramData: {
          type: 'flow',
          nodes: [
            { id: '1', label: 'Сообщение пользователя', type: 'start' },
            { id: '2', label: 'Добавить в историю', type: 'process' },
            { id: '3', label: 'Собрать контекст', type: 'process' },
            { id: '4', label: 'Вызвать LLM', type: 'process' },
            { id: '5', label: 'Стриминг ответа', type: 'process' },
            { id: '6', label: 'Отобразить пользователю', type: 'end' }
          ],
          edges: [
            { from: '1', to: '2' },
            { from: '2', to: '3' },
            { from: '3', to: '4' },
            { from: '4', to: '5' },
            { from: '5', to: '6' }
          ]
        },
        examples: [
          {
            title: 'Системный промпт для образовательного чат-бота',
            code: `Ты — AI-преподаватель курса "Промпт-инжиниринг".\n\nПравила:\n1. Объясняй простым языком, приводя примеры\n2. Если студент ошибается, мягко поправляй\n3. Используй аналогии для сложных концепций\n4. Давай практические задания после объяснения\n5. Никогда не выдумывай факты — если не уверен, скажи об этом`,
            language: 'text',
            explanation: 'Хороший системный промпт: определяет роль, задаёт правила поведения и ограничения.'
          }
        ],
        sandboxType: 'prompt',
        sandboxConfig: {
          presets: [
            { name: 'Создание чат-бота', description: 'Создай системный промпт для чат-бота', payload: 'Создай системный промпт для чат-бота, который помогает изучать Python', systemPrompt: 'Ты — эксперт по созданию чат-ботов. Помоги создать эффективный системный промпт.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Пустой системный промпт', explanation: 'Без инструкций бот ведёт себя непредсказуемо', correct: 'Всегда задавай роль, стиль и ограничения через системный промпт' },
          { error: 'Игнорирование контекстного окна', explanation: 'Длинный диалог переполняет контекст, бот забывает начало', correct: 'Ограничивай историю или используй суммаризацию старых сообщений' }
        ]
      },
      {
        id: 'st-chat-2',
        topicId: 't-chatbots',
        slug: 'prompt-engineering',
        title: 'Промпт-инжинерия',
        order: 1,
        introduction: {
          what: 'Промпт-инжинерия — это искусство и наука создания инструкций для LLM, максимизирующих качество и релевантность ответов. Включает техники: few-shot, chain-of-thought, structured output, role-playing.',
          why: 'Правильный промпт может улучшить качество ответа на 50-200%. Разница между «расскажи про Python» и структурированным промптом — как между блокнотом и учебником.',
          where: 'Промпт-инжинерия применяется везде, где используется LLM: чат-боты, агенты, генерация кода, анализ данных.',
          problem: 'Плохой промпт приводит к расплывчатым, неточным или бесполезным ответам. Модель делает не то, что нужно, а то, что ей сказали.'
        },
        theory: {
          terms: [
            { name: 'Few-Shot', definition: 'Предоставление 2-3 примеров входа-выхода для демонстрации ожидаемого формата' },
            { name: 'Chain-of-Thought', definition: 'Пошаговые рассуждения: "Давай подумаем шаг за шагом"' },
            { name: 'Structured Output', definition: 'Требование ответа в определённом формате: JSON, таблица, Markdown' },
            { name: 'Role Prompting', definition: 'Назначение модели роли: "Ты — опытный DevOps инженер"' }
          ],
          principles: [
            'Будь конкретным: чем точнее запрос, тем точнее ответ',
            'Показывай примеры: few-shot лучше zero-shot',
            'Структурируй: используй заголовки, списки, разделители',
            'Итерируй: первый промпт редко бывает идеальным'
          ],
          architecture: 'Prompt = Role + Context + Task + Format + Constraints + Examples',
          connections: ['Промпты сохраняются как Skills', 'Промпт-инжинерия — основа Chatbot Engine', 'Песочницы позволяют тестировать промпты']
        },
        diagramType: 'cause-effect',
        diagramData: {
          type: 'cause-effect',
          causes: [
            { id: 'c1', label: 'Конкретный промпт' },
            { id: 'c2', label: 'Few-shot примеры' },
            { id: 'c3', label: 'Чёткий формат' }
          ],
          effects: [
            { id: 'e1', label: 'Точный ответ' },
            { id: 'e2', label: 'Структурированный вывод' },
            { id: 'e3', label: 'Меньше галлюцинаций' }
          ],
          connections: [
            { cause: 'c1', effect: 'e1' },
            { cause: 'c2', effect: 'e1' },
            { cause: 'c2', effect: 'e3' },
            { cause: 'c3', effect: 'e2' }
          ]
        },
        examples: [
          {
            title: 'Few-shot промпт для классификации',
            code: `Классифицируй отзыв по тональности:\n\nОтзыв: "Отличный продукт, рекомендую!" → Позитивный\nОтзыв: "Ужасное качество, не советую" → Негативный\nОтзыв: "Нормально, но могло быть лучше" → Нейтральный\n\nОтзыв: "Быстрая доставка, всё работает!" →`,
            language: 'text',
            explanation: 'Few-shot промпт даёт модели 3 примера, после чего она понимает паттерн и классифицирует новый отзыв.'
          }
        ],
        sandboxType: 'prompt',
        sandboxConfig: {
          presets: [
            { name: 'Zero-shot vs Few-shot', description: 'Сравни ответы с примерами и без', payload: 'Объясни, что такое REST API', systemPrompt: 'Ты — образовательный чат-бот. Объясняй технические концепции простым языком.' },
            { name: 'Chain-of-Thought', description: 'Добавь пошаговые рассуждения', payload: 'Сколько будет 15% от 240? Подумай шаг за шагом.', systemPrompt: 'Ты — математический ассистент. Всегда показывай ход рассуждений.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Слишком длинный промпт', explanation: 'Модель теряет суть среди деталей', correct: 'Структурируй промпт: роль → контекст → задача → формат' },
          { error: 'Противоречивые инструкции', explanation: '«Будь краток, но подробно объясни» — модель запутается', correct: 'Избегай противоречий, выбирай одно направление' }
        ]
      },
      {
        id: 'st-chat-3',
        topicId: 't-chatbots',
        slug: 'streaming-responses',
        title: 'Стриминг и SSE',
        order: 2,
        introduction: {
          what: 'Server-Sent Events (SSE) — это протокол для стриминга данных от сервера к клиенту в реальном времени. В контексте LLM, SSE позволяет отображать токены ответа по мере их генерации.',
          why: 'Без стриминга пользователь ждёт 10-30 секунд, пока модель сгенерирует полный ответ. Со стримингом он видит первые токены через 100-500мс.',
          where: 'SSE используется во всех современных чат-ботах: ChatGPT, Claude, Gemini. Это стандарт для LLM-интерфейсов.',
          problem: 'Реализация стриминга сложнее обычного HTTP-запроса: нужно обрабатывать поток данных, отслеживать ошибки и поддерживать соединение.'
        },
        theory: {
          terms: [
            { name: 'SSE (Server-Sent Events)', definition: 'Протокол односторонней передачи данных от сервера к клиенту через HTTP-соединение' },
            { name: 'Token Streaming', definition: 'Постепенная отправка сгенерированных токенов LLM клиенту по мере их появления' },
            { name: 'Delta', definition: 'Инкрементальное изменение — один токен или фрагмент текста в SSE-событии' }
          ],
          principles: [
            'SSE — однонаправленный поток: сервер → клиент',
            'Каждое событие начинается с "data: " и заканчивается двойным переносом строки',
            'Специальное событие "data: [DONE]" означает конец потока',
            'Клиент может прервать стрим через AbortController'
          ],
          architecture: 'LLM API → SSE Stream → API Route (proxy) → SSE Stream → Client (EventSource/fetch) → UI update',
          connections: ['Стриминг используется в Chatbot Engine', 'Модели управляются через Model System', 'AbortController позволяет отменять запросы']
        },
        diagramType: 'flow',
        diagramData: {
          type: 'flow',
          nodes: [
            { id: '1', label: 'Клиент отправляет запрос', type: 'start' },
            { id: '2', label: 'API Route проксирует к LLM', type: 'process' },
            { id: '3', label: 'LLM генерирует токены', type: 'process' },
            { id: '4', label: 'SSE: data: {delta}', type: 'process' },
            { id: '5', label: 'Клиент обновляет UI', type: 'process' },
            { id: '6', label: 'SSE: data: [DONE]', type: 'end' }
          ],
          edges: [
            { from: '1', to: '2' },
            { from: '2', to: '3' },
            { from: '3', to: '4' },
            { from: '4', to: '5' },
            { from: '5', to: '3', label: 'Следующий токен' },
            { from: '5', to: '6', label: 'Конец' }
          ]
        },
        examples: [
          {
            title: 'Клиентский SSE парсер',
            code: `const response = await fetch('/api/chat', {\n  method: 'POST',\n  body: JSON.stringify({ messages, systemPrompt, model }),\n});\n\nconst reader = response.body!.getReader();\nconst decoder = new TextDecoder();\n\nwhile (true) {\n  const { done, value } = await reader.read();\n  if (done) break;\n  const chunk = decoder.decode(value);\n  const lines = chunk.split('\\n');\n  for (const line of lines) {\n    if (line.startsWith('data: ') && line !== 'data: [DONE]') {\n      const data = JSON.parse(line.slice(6));\n      const token = data.choices[0]?.delta?.content || '';\n      onToken(token); // обновляем UI\n    }\n  }\n}`,
            language: 'typescript',
            explanation: 'Клиентский код для чтения SSE потока. Каждый чанк парсится, токены извлекаются и отображаются в UI.'
          }
        ],
        sandboxType: 'prompt',
        sandboxConfig: {
          presets: [
            { name: 'Понимание SSE', description: 'Объясни, как работает SSE стриминг', payload: 'Объясни, как работает Server-Sent Events для стриминга LLM ответов', systemPrompt: 'Ты — эксперт по веб-протоколам. Объясни SSE просто и с примерами.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Не обрабатывать [DONE]', explanation: 'Клиент зависнет, ожидая новые токены', correct: 'Всегда обрабатывай событие data: [DONE] как конец потока' },
          { error: 'Блокировка UI при парсинге', explanation: 'Сложный парсинг на главном потоке тормозит рендер', correct: 'Используй ReadableStream и обновляй UI инкрементально' }
        ]
      },
      {
        id: 'st-chat-4',
        topicId: 't-chatbots',
        slug: 'model-selection',
        title: 'Выбор модели',
        order: 3,
        introduction: {
          what: 'Выбор модели — это стратегия подбора LLM для конкретной задачи: учёт стоимости, скорости, качества и доступности. Включает механизмы фоллбэка при недоступности модели.',
          why: 'Разные задачи требуют разных моделей: простые вопросы — маленькая быстрая модель, сложные рассуждения — большая и дорогая. Фоллбэк обеспечивает надёжность.',
          where: 'Управление моделями реализуется через OpenRouter, который даёт доступ к множеству моделей через единый API.',
          problem: 'Без фоллбэка приложение ломается, когда модель недоступна или достигнут лимит запросов. Без выбора модели — переплата за простые задачи.'
        },
        theory: {
          terms: [
            { name: 'Free Tier', definition: 'Бесплатный тариф LLM API с ограничениями по скорости и объёму' },
            { name: 'Rate Limiting', definition: 'Ограничение количества запросов к API в единицу времени' },
            { name: 'Fallback', definition: 'Автоматическое переключение на запасную модель при недоступности основной' }
          ],
          principles: [
            'Используй бесплатные модели для образовательных задач',
            'Фоллбэк: основная модель → бесплатная альтернатива → следующая',
            'Отслеживай rate limits и кэшируй статус моделей',
            'Позволяй пользователям подключать свои API-ключи'
          ],
          architecture: 'Model Selector → Try Primary Model → (429 Error?) → Try Fallback Model → Stream Response',
          connections: ['Модели управляются через Model System', 'Rate limits хранятся в Model Store', 'API-ключи пользователей в настройках']
        },
        diagramType: 'flow',
        diagramData: {
          type: 'flow',
          nodes: [
            { id: '1', label: 'Запрос к модели', type: 'start' },
            { id: '2', label: 'Попробовать основную', type: 'process' },
            { id: '3', label: 'Успешно?', type: 'decision' },
            { id: '4', label: 'Вернуть ответ', type: 'end' },
            { id: '5', label: 'Попробовать fallback', type: 'process' },
            { id: '6', label: 'Все модели недоступны', type: 'end' }
          ],
          edges: [
            { from: '1', to: '2' },
            { from: '2', to: '3' },
            { from: '3', to: '4', label: 'Да' },
            { from: '3', to: '5', label: '429/Ошибка' },
            { from: '5', to: '3' },
            { from: '5', to: '6', label: 'Все исчерпаны' }
          ]
        },
        examples: [
          {
            title: 'Multi-model fallback',
            code: `async function callWithFallback(prompt, models) {\n  for (const model of models) {\n    try {\n      const response = await callLLM(model, prompt);\n      if (response.ok) return response;\n      if (response.status === 429) {\n        rateLimitedModels.add(model);\n        continue; // пробуем следующую\n      }\n    } catch (e) {\n      continue;\n    }\n  }\n  throw new Error('Все модели недоступны');\n}`,
            language: 'typescript',
            explanation: 'Простейший fallback: перебираем модели по приоритету, пропускаем rate-limited, возвращаем первый успешный ответ.'
          }
        ],
        sandboxType: 'prompt',
        sandboxConfig: {
          presets: [
            { name: 'Стратегия выбора модели', description: 'Определи стратегию выбора модели', payload: 'Какую модель выбрать для: 1) простых вопросов 2) анализа кода 3) генерации текста?', systemPrompt: 'Ты — эксперт по LLM-моделям. Помоги выбрать оптимальную модель для каждой задачи.' }
          ],
          mode: 'educational'
        },
        commonMistakes: [
          { error: 'Только одна модель', explanation: 'Нет фоллбэка — приложение ломается при недоступности', correct: 'Всегда имей 2-3 запасных модели' },
          { error: 'Не отслеживать rate limits', explanation: 'Повторные запросы к rate-limited модели тратят время', correct: 'Кэшируй статус rate limits с TTL 10 минут' }
        ]
      }
    ]
  },
  // ============================================================
  // SANDBOXES
  // ============================================================
  {
    id: 't-sandboxes',
    slug: 'sandboxes',
    title: 'Песочницы и симуляция',
    description: 'Учитесь безопасно экспериментировать с AI: тестируйте промпты, агентов и инструменты в изолированных средах.',
    icon: '🔬',
    gradient: categoryGradients.sandboxes,
    order: 3,
    category: 'sandboxes',
    isPublic: true,
    subtopics: [
      {
        id: 'st-sb-1',
        topicId: 't-sandboxes',
        slug: 'what-is-sandbox',
        title: 'Что такое песочница?',
        order: 0,
        introduction: {
          what: 'Песочница (Sandbox) — это изолированная среда для безопасного экспериментирования с AI. В образовательном режиме симулирует реальные API, в продвинутом — подключается к настоящим сервисам.',
          why: 'Песочницы позволяют учиться без риска: ошибаться, тестировать гипотезы и видеть результаты без последствий для реальных систем.',
          where: 'Песочницы встроены в каждый раздел платформы: Prompt Sandbox, Agent Sandbox, Tool Sandbox, MCP Sandbox, RAG Sandbox, Workflow Sandbox.',
          problem: 'Без песочниц обучение на реальных API стоит денег и может привести к ошибкам в продакшене. Песочницы решают обе проблемы.'
        },
        theory: {
          terms: [
            { name: 'Educational Mode', definition: 'Режим полной симуляции — все ответы генерируются, API не вызываются' },
            { name: 'Advanced Mode', definition: 'Режим с реальными API — опциональное подключение к настоящим сервисам' },
            { name: 'Preset', definition: 'Предустановленный сценарий для быстрого старта эксперимента' }
          ],
          principles: [
            'Безопасность прежде всего: песочница изолирована от реальных систем',
            'Пресеты ускоряют обучение — не нужно писать всё с нуля',
            'Результаты можно сбросить и начать заново',
            'Educational Mode бесплатен, Advanced требует API-ключ'
          ],
          architecture: 'Sandbox Input → System Prompt + Context → LLM (simulated or real) → Structured Output → Feedback',
          connections: ['Каждая песочница связана с определённой категорией навыков', 'Результаты сохраняются в Progress Store', 'Security Engine валидирует ввод']
        },
        diagramType: 'flow',
        diagramData: {
          type: 'flow',
          nodes: [
            { id: '1', label: 'Выбрать тип песочницы', type: 'start' },
            { id: '2', label: 'Выбрать пресет или свой ввод', type: 'process' },
            { id: '3', label: 'Режим?', type: 'decision' },
            { id: '4', label: 'Симуляция (Educational)', type: 'process' },
            { id: '5', label: 'Реальный API (Advanced)', type: 'process' },
            { id: '6', label: 'Анализ результата', type: 'process' },
            { id: '7', label: 'Обратная связь', type: 'end' }
          ],
          edges: [
            { from: '1', to: '2' },
            { from: '2', to: '3' },
            { from: '3', to: '4', label: 'Educational' },
            { from: '3', to: '5', label: 'Advanced' },
            { from: '4', to: '6' },
            { from: '5', to: '6' },
            { from: '6', to: '7' }
          ]
        },
        examples: [
          {
            title: 'Конфигурация песочницы',
            code: `const sandbox = {\n  type: "prompt",\n  mode: "educational",\n  presets: [\n    { name: "Few-shot классификация", payload: "Классифицируй: ..." },\n    { name: "CoT рассуждение", payload: "Подумай шаг за шагом: ..." }\n  ],\n  systemPrompt: "Ты — симулятор AI-модели. Отвечай реалистично."\n};`,
            language: 'typescript',
            explanation: 'Конфигурация песочницы: тип, режим, пресеты и системный промпт.'
          }
        ],
        sandboxType: 'prompt',
        sandboxConfig: { presets: [{ name: 'Тест песочницы', description: 'Попробуй работу песочницы', payload: 'Привет! Как работает песочница?', systemPrompt: 'Ты — симулятор AI-модели в образовательной песочнице. Отвечай дружелюбно и информативно.' }], mode: 'educational' },
        commonMistakes: [
          { error: 'Тестирование на продакшене', explanation: 'Эксперименты с реальными API могут стоить денег и сломать данные', correct: 'Начинай в Educational Mode, переходи к Advanced только когда уверен' }
        ]
      },
      {
        id: 'st-sb-2',
        topicId: 't-sandboxes',
        slug: 'prompt-sandbox',
        title: 'Промпт-песочница',
        order: 1,
        introduction: { what: 'Промпт-песочница позволяет тестировать различные промпты и системные инструкции, наблюдая за изменением поведения модели в реальном времени.', why: 'Позволяет быстро итерировать промпты: измени системную инструкцию, отправь запрос и сразу увидишь результат.', where: 'Используется при разработке чат-ботов, настройке системных промптов и обучении промпт-инжинирингу.', problem: 'Без песочницы каждый тест промпта требует настройки окружения, API-ключей и мониторинга.' },
        theory: { terms: [{ name: 'System Prompt Editor', definition: 'Поле для редактирования системной инструкции в реальном времени' }, { name: 'A/B Testing промптов', definition: 'Сравнение результатов двух разных промптов на одном запросе' }], principles: ['Измени один параметр за раз', 'Сравнивай результаты на одинаковых входных данных', 'Сохраняй удачные промпты как Skills'], architecture: 'System Prompt + User Input → LLM → Output → Compare → Iterate', connections: ['Удачные промпты сохраняются как Prompt Skills', 'Результаты логируются для аналитики'] },
        diagramType: 'flow', diagramData: { type: 'flow', nodes: [{ id: '1', label: 'Написать промпт', type: 'start' }, { id: '2', label: 'Отправить запрос', type: 'process' }, { id: '3', label: 'Получить ответ', type: 'process' }, { id: '4', label: 'Удовлетворён?', type: 'decision' }, { id: '5', label: 'Сохранить как Skill', type: 'end' }], edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4' }, { from: '4', to: '5', label: 'Да' }, { from: '4', to: '1', label: 'Нет — итерация' }] },
        examples: [{ title: 'Тестирование системного промпта', code: `// Промпт A\nconst promptA = "Ты — помощник. Отвечай кратко.";\n// Промпт B\nconst promptB = "Ты — эксперт. Давай подробные объяснения с примерами.";\n// Один и тот же запрос\nconst query = "Объясни замыкания в JavaScript";\n// Сравниваем ответы`, language: 'typescript', explanation: 'A/B тестирование промптов: один и тот же запрос, разные системные инструкции. Сравниваем качество ответов.' }],
        sandboxType: 'prompt',
        sandboxConfig: { presets: [{ name: 'A/B тест', description: 'Сравни два промпта', payload: 'Объясни, что такое рекурсия', systemPrompt: 'Ты — образовательный чат-бот. Отвечай на русском.' }, { name: 'Ролевой промпт', description: 'Протестируй ролевое поведение', payload: 'Как оптимизировать SQL запрос?', systemPrompt: 'Ты — Senior Database Administrator с 15 годами опыта. Давай конкретные рекомендации.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Менять всё сразу', explanation: 'Непонятно, какое изменение улучшило результат', correct: 'Меняй один элемент промпта за раз' }]
      },
      {
        id: 'st-sb-3',
        topicId: 't-sandboxes',
        slug: 'agent-sandbox',
        title: 'Песочница агентов',
        order: 2,
        introduction: { what: 'Agent Sandbox позволяет тестировать поведение AI-агентов: как они планируют шаги, выбирают инструменты и обрабатывают результаты.', why: 'Позволяет отлаживать агентов перед деплоем: проверить, правильно ли агент выбирает инструменты и формирует вызовы.', where: 'Используется при разработке и тестировании агентов, обучении агентным паттернам.', problem: 'Без песочницы ошибки агента обнаруживаются только в продакшене — когда они уже стоят денег и времени.' },
        theory: { terms: [{ name: 'Agent Trace', definition: 'Лог шагов агента: мысль → действие → наблюдение на каждой итерации' }, { name: 'Mock Tools', definition: 'Симулированные инструменты для тестирования без реальных API' }], principles: ['Тестируй агента на типичных и граничных сценариях', 'Используй mock-инструменты для предсказуемости', 'Логируй каждый шаг для анализа'], architecture: 'Task → Agent (ReAct loop) → Mock/Real Tools → Trace Log → Analysis', connections: ['Инструменты агента описаны как Tool Skills', 'Трейсы логируются для улучшения агента'] },
        diagramType: 'flow', diagramData: { type: 'flow', nodes: [{ id: '1', label: 'Задача для агента', type: 'start' }, { id: '2', label: 'Thought: рассуждение', type: 'process' }, { id: '3', label: 'Action: вызов инструмента', type: 'process' }, { id: '4', label: 'Observation: результат', type: 'process' }, { id: '5', label: 'Трейс лог', type: 'process' }, { id: '6', label: 'Финальный ответ', type: 'end' }], edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4' }, { from: '4', to: '5' }, { from: '5', to: '2', label: 'Итерация' }, { from: '5', to: '6', label: 'Готово' }] },
        examples: [{ title: 'Тест агента с mock-инструментом', code: `const mockTools = {\n  get_weather: (args) => ({ temp: "22°C", condition: "солнечно" }),\n  search_web: (args) => ({ results: ["Результат 1", "Результат 2"] })\n};\n\n// Агент использует mock вместо реальных API\nconst result = await runAgent(task, mockTools);`, language: 'typescript', explanation: 'Mock-инструменты возвращают предсказуемые результаты, что позволяет тестировать логику агента изолированно.' }],
        sandboxType: 'agent',
        sandboxConfig: { presets: [{ name: 'Тест агента', description: 'Протестируй поведение агента', payload: 'Найди погоду в Москве и посоветуй, как одеться', systemPrompt: 'Ты — агент с инструментами get_weather и search. Используй формат ReAct.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Тестирование только на счастливом пути', explanation: 'Агент может не справиться с нестандартными ситуациями', correct: 'Тестируй граничные случаи: пустые результаты, ошибки API, неоднозначные запросы' }]
      },
      {
        id: 'st-sb-4',
        topicId: 't-sandboxes',
        slug: 'tool-sandbox',
        title: 'Песочница инструментов',
        order: 3,
        introduction: { what: 'Tool Sandbox позволяет тестировать определения инструментов (function calling): проверять схему параметров, валидацию и то, как LLM генерирует вызовы.', why: 'Неправильная схема инструмента — частая причина ошибок агентов. Песочница позволяет быстро выявить и исправить проблемы.', where: 'Используется при разработке инструментов для агентов и MCP-серверов.', problem: 'Без валидации инструмент может принимать неверные параметры, что ведёт к ошибкам в работе агента.' },
        theory: { terms: [{ name: 'Parameter Schema', definition: 'JSON Schema описание параметров инструмента: типы, обязательность, enum-значения' }, { name: 'Schema Validation', definition: 'Проверка, что сгенерированные LLM параметры соответствуют схеме' }], principles: ['Все параметры должны иметь описание', 'Required поля явно указаны', 'Enum ограничивают допустимые значения', 'Тестируй схему с разными промптами'], architecture: 'Tool Definition → LLM generates call → Validate parameters → Execute → Return result', connections: ['Инструменты подключаются через MCP Engine', 'Валидация — часть Security Engine'] },
        diagramType: 'flow', diagramData: { type: 'flow', nodes: [{ id: '1', label: 'Определить инструмент', type: 'start' }, { id: '2', label: 'Протестировать вызов', type: 'process' }, { id: '3', label: 'Валидация параметров', type: 'decision' }, { id: '4', label: 'Выполнить', type: 'process' }, { id: '5', label: 'Ошибка — исправить схему', type: 'process' }, { id: '6', label: 'Результат', type: 'end' }], edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4', label: 'OK' }, { from: '3', to: '5', label: 'Ошибка' }, { from: '4', to: '6' }, { from: '5', to: '1' }] },
        examples: [{ title: 'Тестирование схемы инструмента', code: `const tool = {\n  name: "send_email",\n  parameters: {\n    to: { type: "string", description: "Email получателя" },\n    subject: { type: "string" },\n    body: { type: "string" },\n    priority: { type: "string", enum: ["low", "normal", "high"] }\n  },\n  required: ["to", "subject", "body"]\n};\n\n// Тест: LLM должна сгенерировать корректный вызов\nconst testPrompt = "Отправь письмо Ивану о встрече";`, language: 'typescript', explanation: 'Инструмент send_email с валидацией: обязательные поля и enum для приоритета. Тест проверяет, что LLM корректно заполняет параметры.' }],
        sandboxType: 'tool',
        sandboxConfig: { presets: [{ name: 'Создание инструмента', description: 'Создай и протестируй инструмент', payload: 'Создай инструмент для поиска ресторанов по категории и рейтингу', systemPrompt: 'Ты — эксперт по проектированию инструментов для AI-агентов. Помоги создать и протестировать JSON Schema.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Нет описаний параметров', explanation: 'LLM не понимает, что передавать в параметр', correct: 'Каждый параметр должен иметь description' }, { error: 'Слишком много optional полей', explanation: 'Агент может передать лишние или неверные данные', correct: 'Минимизируй optional поля, чётко указывай required' }]
      }
    ]
  },
  // ============================================================
  // WORKFLOWS
  // ============================================================
  {
    id: 't-workflows',
    slug: 'workflows',
    title: 'Воркфлоу и автоматизация',
    description: 'Научитесь оркестрировать навыки и агенты в автоматизированные рабочие процессы.',
    icon: '⚙️',
    gradient: categoryGradients.workflows,
    order: 4,
    category: 'workflows',
    isPublic: true,
    subtopics: [
      {
        id: 'st-wf-1',
        topicId: 't-workflows',
        slug: 'what-is-workflow',
        title: 'Что такое воркфлоу?',
        order: 0,
        introduction: { what: 'Воркфлоу — это автоматизированная последовательность шагов, оркестрирующая навыки и агенты для решения сложных задач. Каждый шаг — это Skill или вызов агента.', why: 'Воркфлоу превращают набор разрозненных навыков в надёжный автоматизированный процесс. Как конвейер на заводе — каждый шаг выполняется в нужном порядке.', where: 'Воркфлоу применяются в CI/CD, обработке данных, генерации контента, автоматизации бизнес-процессов.', problem: 'Без воркфлоу каждый шаг нужно запускать вручную, что неэффективно и подвержено ошибкам.' },
        theory: { terms: [{ name: 'Node', definition: 'Узел воркфлоу: триггер, навык, агент, условие или выход' }, { name: 'Edge', definition: 'Связь между узлами, определяющая порядок выполнения' }, { name: 'Trigger', definition: 'Событие, запускающее воркфлоу: запрос пользователя, таймер, webhook' }], principles: ['Воркфлоу = навыки + агенты + условия + оркестрация', 'Каждый узел выполняет одну задачу', 'Условия управляют ветвлением логики', 'Обработка ошибок обязательна для production воркфлоу'], architecture: 'Trigger → [Skill/Agent/Condition nodes] → Edges (sequential/parallel/conditional) → Output', connections: ['Каждый узел — это Skill из Skill Engine', 'Агентные узлы используют Agent Engine', 'Воркфлоу тестируются в Workflow Sandbox'] },
        diagramType: 'tree', diagramData: { type: 'tree', root: { id: 'trigger', label: 'Trigger: Запрос', children: [{ id: 'skill1', label: 'Skill: Анализ' }, { id: 'condition', label: 'Condition: Тип задачи?', children: [{ id: 'agent1', label: 'Agent: Код-ревью' }, { id: 'agent2', label: 'Agent: Документация' }] }, { id: 'output', label: 'Output: Результат' }] } },
        examples: [{ title: 'Воркфлоу код-ревью', code: `const workflow = {\n  nodes: [\n    { id: 'trigger', type: 'trigger', label: 'Новый Pull Request' },\n    { id: 'analyze', type: 'skill', label: 'Анализ изменений' },\n    { id: 'review', type: 'agent', label: 'Code Review Agent' },\n    { id: 'test', type: 'agent', label: 'Test Agent' },\n    { id: 'report', type: 'skill', label: 'Сборка отчёта' },\n    { id: 'output', type: 'output', label: 'Комментарий в PR' }\n  ],\n  edges: [\n    { from: 'trigger', to: 'analyze' },\n    { from: 'analyze', to: 'review' },\n    { from: 'analyze', to: 'test' }, // параллельно\n    { from: 'review', to: 'report' },\n    { from: 'test', to: 'report' },\n    { from: 'report', to: 'output' }\n  ]\n};`, language: 'typescript', explanation: 'Воркфлоу для автоматического код-ревью: анализ → параллельный review + test → сборка отчёта → комментарий.' }],
        sandboxType: 'workflow',
        sandboxConfig: { presets: [{ name: 'Простой воркфлоу', description: 'Спроектируй простой воркфлоу', payload: 'Спроектируй воркфлоу для автоматической генерации документации из кода', systemPrompt: 'Ты — эксперт по проектированию воркфлоу. Помоги создать последовательность шагов.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Линейный воркфлоу без обработки ошибок', explanation: 'Любой сбой ломает всю цепочку', correct: 'Добавляй error handling узлы и fallback действия' }, { error: 'Все шаги последовательно', explanation: 'Медленно, если шаги независимы', correct: 'Запускай независимые шаги параллельно' }]
      },
      {
        id: 'st-wf-2',
        topicId: 't-workflows',
        slug: 'workflow-design',
        title: 'Проектирование воркфлоу',
        order: 1,
        introduction: { what: 'Проектирование воркфлоу — это визуальное и логическое описание последовательности шагов: какие узлы, как связаны, какие условия и что происходит при ошибках.', why: 'Хорошо спроектированный воркфлоу надёжен, понятен и легко модифицируется. Плохой — хрупок и непредсказуем.', where: 'Проектирование выполняется визуально (drag-and-drop) или текстово (YAML/JSON) в Workflow Engine.', problem: 'Без визуализации и структурирования воркфлоу превращается в нечитаемый спагетти-код.' },
        theory: { terms: [{ name: 'Sequential Flow', definition: 'Линейное выполнение: шаг за шагом, каждый зависит от предыдущего' }, { name: 'Parallel Flow', definition: 'Параллельное выполнение: независимые шаги запускаются одновременно' }, { name: 'Conditional Branch', definition: 'Ветвление: выбор следующего шага на основе условия' }, { name: 'Loop', definition: 'Цикл: повторение шагов до выполнения условия' }], principles: ['Начинай с конечного результата и иди назад', 'Минимизируй зависимости между шагами', 'Каждый узел должен быть идемпотентным', 'Документируй каждый шаг'], architecture: 'Design → Validate → Test (dry-run) → Deploy → Monitor', connections: ['Визуальный редактор — часть Workflow Engine', 'Валидация через Security Engine'] },
        diagramType: 'graph', diagramData: { type: 'graph', nodes: [{ id: 'n1', label: 'Trigger', group: 'start' }, { id: 'n2', label: 'Skill A', group: 'skill' }, { id: 'n3', label: 'Skill B', group: 'skill' }, { id: 'n4', label: 'Condition', group: 'decision' }, { id: 'n5', label: 'Agent C', group: 'agent' }, { id: 'n6', label: 'Output', group: 'end' }], edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5', label: 'Yes' }, { from: 'n4', to: 'n6', label: 'No' }, { from: 'n5', to: 'n6' }] },
        examples: [{ title: 'YAML описание воркфлоу', code: `workflow:\n  name: document-generator\n  trigger: on_code_commit\n  steps:\n    - id: analyze\n      type: skill\n      skill: code-analyzer\n    - id: generate\n      type: agent\n      agent: doc-writer\n      depends_on: [analyze]\n    - id: validate\n      type: skill\n      skill: doc-validator\n      depends_on: [generate]\n    - id: publish\n      type: output\n      depends_on: [validate]`, language: 'yaml', explanation: 'YAML-описание воркфлоу генерации документации: анализ → генерация → валидация → публикация.' }],
        sandboxType: 'workflow',
        sandboxConfig: { presets: [{ name: 'Визуальное проектирование', description: 'Спроектируй воркфлоу визуально', payload: 'Нарисуй воркфлоу для обработки заявок поддержки: приём → классификация → назначение → решение → уведомление', systemPrompt: 'Ты — эксперт по проектированию воркфлоу. Опиши узлы и связи.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Циклические зависимости', explanation: 'Узел A зависит от B, а B зависит от A — deadlock', correct: 'Проверяй ацикличность графа воркфлоу' }, { error: 'Нет rollback при ошибке', explanation: 'Ошибка в середине оставляет систему в неконсистентном состоянии', correct: 'Добавляй компенсирующие действия для каждого шага' }]
      },
      {
        id: 'st-wf-3',
        topicId: 't-workflows',
        slug: 'workflow-patterns',
        title: 'Паттерны воркфлоу',
        order: 2,
        introduction: { what: 'Паттерны воркфлоу — это типовые решения для организации потоков работ: последовательный, параллельный, условный, циклический и fan-out/fan-in.', why: 'Паттерны дают готовые шаблоны для типичных задач — не нужно изобретать велосипед каждый раз.', where: 'Паттерны применяются как строительные блоки при проектировании сложных воркфлоу.', problem: 'Без знания паттернов проектировщик воркфлоу reinvent-ит решения и совершает типичные ошибки.' },
        theory: { terms: [{ name: 'Fan-out/Fan-in', definition: 'Распараллеливание задачи на N обработчиков и сбор результатов в один' }, { name: 'Saga Pattern', definition: 'Управление распределёнными транзакциями с компенсацией при сбоях' }, { name: 'Pipeline', definition: 'Конвейер: выход одного шага — вход следующего' }], principles: ['Последовательный — проще всего, но медленнее', 'Параллельный — быстрее, но сложнее координация', 'Условный — гибкость, но больше тестов', 'Saga — надёжность для критичных процессов'], architecture: 'Sequential → Pipeline → Parallel → Fan-out → Conditional → Saga', connections: ['Паттерны реализуются через Workflow Engine', 'Каждый паттерн можно протестировать в Workflow Sandbox'] },
        diagramType: 'tree', diagramData: { type: 'tree', root: { id: 'root', label: 'Паттерны воркфлоу', children: [{ id: 'p1', label: 'Sequential' }, { id: 'p2', label: 'Parallel' }, { id: 'p3', label: 'Conditional' }, { id: 'p4', label: 'Fan-out/Fan-in' }, { id: 'p5', label: 'Saga' }, { id: 'p6', label: 'Pipeline' }] } },
        examples: [{ title: 'Fan-out/Fan-in паттерн', code: `// Анализируем документ параллельно разными агентами\nconst results = await Promise.all([\n  agentAnalyze(document, 'grammar'),\n  agentAnalyze(document, 'style'),\n  agentAnalyze(document, 'facts')\n]);\n// Собираем результаты\nconst report = mergeReports(results);`, language: 'typescript', explanation: 'Fan-out: документ анализируется тремя агентами параллельно. Fan-in: результаты объединяются в один отчёт.' }],
        sandboxType: 'workflow',
        sandboxConfig: { presets: [{ name: 'Выбор паттерна', description: 'Определи подходящий паттерн', payload: 'Какой паттерн использовать для обработки 1000 документов с разными типами анализа?', systemPrompt: 'Ты — эксперт по паттернам воркфлоу. Рекомендуй оптимальный паттерн для задачи.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Параллельность там, где нужна последовательность', explanation: 'Данные второго шага зависят от первого, но запущены параллельно', correct: 'Анализируй зависимости данных перед выбором паттерна' }]
      }
    ]
  },
  // ============================================================
  // MCP
  // ============================================================
  {
    id: 't-mcp',
    slug: 'mcp',
    title: 'Model Context Protocol',
    description: 'Изучите стандарт подключения AI к внешним инструментам и данным через Model Context Protocol.',
    icon: '🔌',
    gradient: categoryGradients.mcp,
    order: 5,
    category: 'mcp',
    isPublic: true,
    subtopics: [
      {
        id: 'st-mcp-1',
        topicId: 't-mcp',
        slug: 'what-is-mcp',
        title: 'Что такое MCP?',
        order: 0,
        introduction: { what: 'Model Context Protocol (MCP) — это открытый стандарт, позволяющий AI-моделям подключаться к внешним инструментам, базам данных и сервисам через унифицированный интерфейс.', why: 'MCP стандартизирует подключение инструментов: вместо интеграции каждого API по отдельности, агент работает с MCP-серверами через единый протокол.', where: 'MCP используется в Claude Desktop, Cursor, и других AI-инструментах для подключения файловой системы, баз данных, веб-сервисов.', problem: 'Без стандарта каждое подключение инструмента к AI требует индивидуальной интеграции — дорого и несовместимо.' },
        theory: { terms: [{ name: 'MCP Server', definition: 'Сервер, предоставляющий инструменты и данные через MCP протокол' }, { name: 'MCP Client', definition: 'AI-приложение, подключающееся к MCP серверам для использования инструментов' }, { name: 'Transport', definition: 'Способ связи между клиентом и сервером: stdio, HTTP+SSE' }], principles: ['MCP разделяет AI-модель и инструменты', 'Серверы независимы и могут быть переиспользованы', 'Безопасность: серверы имеют ограниченные права доступа', 'Стандарт: любой MCP-клиент работает с любым MCP-сервером'], architecture: 'AI Client ↔ MCP Protocol ↔ MCP Server → Tools/Resources', connections: ['MCP инструменты описаны как Tool Skills', 'MCP серверы тестируются в MCP Sandbox', 'Безопасность контролируется Security Engine'] },
        diagramType: 'flow', diagramData: { type: 'flow', nodes: [{ id: '1', label: 'AI Агент (Client)', type: 'start' }, { id: '2', label: 'MCP Protocol', type: 'process' }, { id: '3', label: 'MCP Server: Files', type: 'process' }, { id: '4', label: 'MCP Server: DB', type: 'process' }, { id: '5', label: 'MCP Server: API', type: 'process' }, { id: '6', label: 'Результат агенту', type: 'end' }], edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '2', to: '4' }, { from: '2', to: '5' }, { from: '3', to: '6' }, { from: '4', to: '6' }, { from: '5', to: '6' }] },
        examples: [{ title: 'Конфигурация MCP сервера', code: `const mcpServer = {\n  name: "filesystem-server",\n  command: "npx",\n  args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user"],\n  tools: [\n    { name: "read_file", description: "Читает файл" },\n    { name: "write_file", description: "Записывает файл" },\n    { name: "list_dir", description: "Показывает содержимое директории" }\n  ]\n};`, language: 'typescript', explanation: 'MCP сервер для работы с файловой системой: три инструмента с чёткими описаниями.' }],
        sandboxType: 'mcp',
        sandboxConfig: { presets: [{ name: 'Создание MCP сервера', description: 'Создай конфигурацию MCP сервера', payload: 'Создай MCP сервер для работы с базой данных PostgreSQL', systemPrompt: 'Ты — эксперт по MCP протоколу. Помоги создать конфигурацию MCP сервера.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Небезопасные права доступа', explanation: 'MCP сервер с полным доступом к файловой системе', correct: 'Ограничивай доступ MCP серверов минимально необходимым' }, { error: 'Нет обработки отключений', explanation: 'Если MCP сервер упадёт, агент зависнет', correct: 'Добавляй timeout и fallback при недоступности MCP сервера' }]
      },
      {
        id: 'st-mcp-2',
        topicId: 't-mcp',
        slug: 'mcp-servers',
        title: 'MCP серверы',
        order: 1,
        introduction: { what: 'MCP сервер — это процесс, который предоставляет инструменты и ресурсы AI-моделям через MCP протокол. Запускается как отдельный сервис с определённой командой и аргументами.', why: 'Серверы инкапсулируют логику работы с внешними системами, предоставляя AI унифицированный интерфейс.', where: 'Серверы могут работать с файлами, базами данных, API, веб-сервисами и любыми другими источниками данных.', problem: 'Без MCP серверов каждая интеграция инструмента требует модификации AI-клиента — дорого и негибко.' },
        theory: { terms: [{ name: 'stdio transport', definition: 'Коммуникация через стандартные потоки ввода-вывода — для локальных серверов' }, { name: 'HTTP+SSE transport', definition: 'Коммуникация через HTTP с Server-Sent Events — для удалённых серверов' }, { name: 'Tool Discovery', definition: 'Автоматическое обнаружение инструментов, предоставляемых MCP сервером' }], principles: ['Каждый сервер независим и самодостаточен', 'Серверы общаются через JSON-RPC', 'Discovery позволяет агенту автоматически узнать доступные инструменты', 'Серверы можно комбинировать для сложных интеграций'], architecture: 'Command + Args → MCP Server Process → JSON-RPC → Tools/Resources', connections: ['Серверы регистрируются в MCP Engine', 'Инструменты серверов — это Tool Skills', 'Безопасность контролируется через Security Engine'] },
        diagramType: 'flow', diagramData: { type: 'flow', nodes: [{ id: '1', label: 'Запуск сервера', type: 'start' }, { id: '2', label: 'Регистрация инструментов', type: 'process' }, { id: '3', label: 'Ожидание запросов', type: 'process' }, { id: '4', label: 'Обработка tool call', type: 'process' }, { id: '5', label: 'Возврат результата', type: 'end' }], edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4' }, { from: '4', to: '5' }, { from: '5', to: '3' }] },
        examples: [{ title: 'Запуск MCP сервера', code: `// В конфигурации Claude Desktop:\n{\n  "mcpServers": {\n    "postgres": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-postgres",\n              "postgresql://localhost/mydb"]\n    },\n    "github": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-github"],\n      "env": { "GITHUB_TOKEN": "ghp_..." }\n    }\n  }\n}`, language: 'json', explanation: 'Конфигурация двух MCP серверов: PostgreSQL и GitHub. Каждый имеет свою команду запуска и аргументы.' }],
        sandboxType: 'mcp',
        sandboxConfig: { presets: [{ name: 'Конфигурация сервера', description: 'Создай конфигурацию MCP сервера', payload: 'Создай MCP сервер для работы с Slack API', systemPrompt: 'Ты — эксперт по MCP серверам. Создай конфигурацию для подключения к Slack.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Хранение токенов в коде', explanation: 'Секреты в конфигурации сервера — риск утечки', correct: 'Используй переменные окружения для всех секретов' }, { error: 'Нет graceful shutdown', explanation: 'Сервер убивается без завершения операций', correct: 'Обрабатывай SIGTERM и gracefully закрывай соединения' }]
      },
      {
        id: 'st-mcp-3',
        topicId: 't-mcp',
        slug: 'mcp-tools',
        title: 'MCP инструменты',
        order: 2,
        introduction: { what: 'MCP инструменты — это функции, предоставляемые MCP сервером, которые AI-агент может вызывать. Каждый инструмент имеет имя, описание и схему входных параметров.', why: 'Инструменты расширяют возможности AI за пределы генерации текста: чтение файлов, запросы к БД, вызовы API.', where: 'Инструменты автоматически обнаруживаются при подключении к MCP серверу (tool discovery).', problem: 'Без чёткого описания инструментов агент не сможет их корректно вызвать.' },
        theory: { terms: [{ name: 'Input Schema', definition: 'JSON Schema, описывающая параметры инструмента' }, { name: 'Tool Call', definition: 'Вызов инструмента агентом с передачей параметров' }, { name: 'Tool Result', definition: 'Результат выполнения инструмента, возвращаемый агенту' }], principles: ['Каждый инструмент имеет уникальное имя на сервере', 'Описание инструмента должно быть полным и точным', 'Input Schema валидирует параметры перед выполнением', 'Результат всегда в текстовом формате для понимания LLM'], architecture: 'Agent → Tool Call (name + params) → MCP Server → Execute → Tool Result → Agent', connections: ['Инструменты эквивалентны Tool Skills', 'Валидация через Security Engine'] },
        diagramType: 'flow', diagramData: { type: 'flow', nodes: [{ id: '1', label: 'Агент выбирает инструмент', type: 'start' }, { id: '2', label: 'Генерация tool call', type: 'process' }, { id: '3', label: 'Валидация параметров', type: 'decision' }, { id: '4', label: 'Выполнение', type: 'process' }, { id: '5', label: 'Ошибка валидации', type: 'process' }, { id: '6', label: 'Результат агенту', type: 'end' }], edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4', label: 'OK' }, { from: '3', to: '5', label: 'Ошибка' }, { from: '4', to: '6' }, { from: '5', to: '2' }] },
        examples: [{ title: 'Определение MCP инструмента', code: `{\n  "name": "query_database",\n  "description": "Выполняет SQL запрос к базе данных и возвращает результаты",\n  "inputSchema": {\n    "type": "object",\n    "properties": {\n      "sql": {\n        "type": "string",\n        "description": "SQL запрос для выполнения (только SELECT)"\n      },\n      "limit": {\n        "type": "number",\n        "description": "Максимум строк в результате",\n        "default": 100\n      }\n    },\n    "required": ["sql"]\n  }\n}`, language: 'json', explanation: 'MCP инструмент для запросов к БД. Заметь: описание ограничивает SQL только SELECT — мера безопасности.' }],
        sandboxType: 'mcp',
        sandboxConfig: { presets: [{ name: 'Создание MCP инструмента', description: 'Создай определение MCP инструмента', payload: 'Создай MCP инструмент для отправки уведомлений в Telegram', systemPrompt: 'Ты — эксперт по MCP инструментам. Создай полное определение с inputSchema.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Нет ограничений на входные данные', explanation: 'SQL injection через MCP инструмент', correct: 'Ограничивай типы запросов, валидируй входные данные в inputSchema' }, { error: 'Слишком большой результат', explanation: 'Инструмент возвращает мегабайты данных, переполняя контекст', correct: 'Ограничивай размер результата через параметр limit' }]
      }
    ]
  },
  // ============================================================
  // RAG
  // ============================================================
  {
    id: 't-rag',
    slug: 'rag',
    title: 'RAG и базы знаний',
    description: 'Освойте Retrieval-Augmented Generation: от обработки документов до векторного поиска и генерации ответов.',
    icon: '📚',
    gradient: categoryGradients.rag,
    order: 6,
    category: 'rag',
    isPublic: true,
    subtopics: [
      {
        id: 'st-rag-1',
        topicId: 't-rag',
        slug: 'what-is-rag',
        title: 'Что такое RAG?',
        order: 0,
        introduction: { what: 'RAG (Retrieval-Augmented Generation) — это метод, объединяющий поиск релевантной информации с генерацией ответа. LLM сначала находит нужные данные в базе знаний, затем генерирует ответ на их основе.', why: 'RAG решает проблему галлюцинаций: вместо выдумывания фактов, модель опирается на реальные документы. Также позволяет обновлять знания без переобучения модели.', where: 'RAG применяется в корпоративных чат-ботах, системах поддержки, анализе документов, образовательных платформах.', problem: 'Без RAG модель ограничена знаниями из обучения и может галлюцинировать. RAG даёт ей доступ к актуальным и проверенным данным.' },
        theory: { terms: [{ name: 'Retrieval', definition: 'Поиск релевантных фрагментов документов по запросу пользователя' }, { name: 'Augmented', definition: 'Дополнение промпта модели найденными фрагментами как контекстом' }, { name: 'Generation', definition: 'Генерация ответа моделью на основе промпта + контекста' }, { name: 'Embedding', definition: 'Векторное представление текста для семантического поиска' }], principles: ['Качество RAG = качество данных + качество поиска + качество генерации', 'Чанки должны быть оптимального размера (200-500 токенов)', 'Ранжирование результатов поиска критично для качества ответа', 'RAG не заменяет fine-tuning, а дополняет его'], architecture: 'Query → Embed → Vector Search → Top-K Chunks → Prompt + Context → LLM → Answer', connections: ['Embeddings хранятся в Knowledge Base', 'Поиск реализуется через RAG Engine', 'Результаты фильтруются через Security Engine'] },
        diagramType: 'flow', diagramData: { type: 'flow', nodes: [{ id: '1', label: 'Запрос пользователя', type: 'start' }, { id: '2', label: 'Embedding запроса', type: 'process' }, { id: '3', label: 'Векторный поиск', type: 'process' }, { id: '4', label: 'Top-K фрагментов', type: 'process' }, { id: '5', label: 'Промпт + контекст', type: 'process' }, { id: '6', label: 'LLM генерация', type: 'process' }, { id: '7', label: 'Ответ', type: 'end' }], edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4' }, { from: '4', to: '5' }, { from: '5', to: '6' }, { from: '6', to: '7' }] },
        examples: [{ title: 'Базовый RAG пайплайн', code: 'async function ragQuery(question: string) {\n  // 1. Embed запрос\n  const queryEmbedding = await embed(question);\n  \n  // 2. Поиск релевантных чанков\n  const chunks = await vectorSearch(queryEmbedding, { topK: 5 });\n  \n  // 3. Формируем промпт с контекстом\n  const context = chunks.map(c => c.text).join(\'\\n---\\n\');\n  const prompt = `На основе контекста ответь на вопрос.\\nКонтекст: ${context}\\nВопрос: ${question}`;\n  \n  // 4. Генерация ответа\n  return await llm.generate(prompt);\n}', language: 'typescript', explanation: 'Полный RAG пайплайн: embed → search → augment → generate. Простейшая, но рабочая реализация.' }],
        sandboxType: 'rag',
        sandboxConfig: { presets: [{ name: 'Понимание RAG', description: 'Разбери, как работает RAG', payload: 'Объясни, чем RAG лучше обычного промпта для вопросно-ответных систем', systemPrompt: 'Ты — эксперт по RAG. Объясни преимущества retrieval-augmented generation.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Слишком большие чанки', explanation: 'В контекст не помещается нужная информация, теряется точность', correct: 'Оптимальный размер чанка: 200-500 токенов с перекрытием 50-100' }, { error: 'Нет ранжирования результатов', explanation: 'Нерелевантные чанки в контексте ухудшают ответ', correct: 'Используй re-ranking или скоринг для отбора лучших результатов' }]
      },
      {
        id: 'st-rag-2',
        topicId: 't-rag',
        slug: 'document-processing',
        title: 'Обработка документов',
        order: 1,
        introduction: { what: 'Обработка документов для RAG — это процесс подготовки текста: извлечение, разбиение на чанки, создание эмбеддингов и индексация для быстрого поиска.', why: 'Качество обработки документов напрямую влияет на качество RAG: плохие чанки = плохой поиск = плохие ответы.', where: 'Обработка применяется к PDF, Markdown, HTML, DOCX — любым источникам знаний для RAG-системы.', problem: 'Необработанный документ — это сплошной текст. Без разбиения и индексации поиск по нему невозможен.' },
        theory: { terms: [{ name: 'Chunking', definition: 'Разбиение документа на мелкие фрагменты для индексации и поиска' }, { name: 'Overlap', definition: 'Перекрытие между чанками для сохранения контекста на границах' }, { name: 'Indexing', definition: 'Создание векторного индекса для быстрого семантического поиска' }], principles: ['Чанки должны быть семантически цельными', 'Overlap предотвращает потерю контекста на границах', 'Метаданные (источник, страница) помогают фильтровать', 'Разные типы документов требуют разных стратегий chunking-а'], architecture: 'Document → Extract Text → Chunk → Embed → Index → Ready for Search', connections: ['Чанки хранятся в Knowledge Base', 'Embeddings создаются через Model System', 'Поиск реализуется через RAG Engine'] },
        diagramType: 'flow', diagramData: { type: 'flow', nodes: [{ id: '1', label: 'Загрузить документ', type: 'start' }, { id: '2', label: 'Извлечь текст', type: 'process' }, { id: '3', label: 'Разбить на чанки', type: 'process' }, { id: '4', label: 'Создать эмбеддинги', type: 'process' }, { id: '5', label: 'Индексировать', type: 'process' }, { id: '6', label: 'Готово к поиску', type: 'end' }], edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4' }, { from: '4', to: '5' }, { from: '5', to: '6' }] },
        examples: [{ title: 'Chunking с перекрытием', code: `function chunkText(text: string, chunkSize = 500, overlap = 50) {\n  const chunks: string[] = [];\n  let start = 0;\n  while (start < text.length) {\n    chunks.push(text.slice(start, start + chunkSize));\n    start += chunkSize - overlap;\n  }\n  return chunks;\n}`, language: 'typescript', explanation: 'Простейший chunking: текст разбивается на фрагменты по 500 символов с перекрытием 50.' }],
        sandboxType: 'rag',
        sandboxConfig: { presets: [{ name: 'Стратегия chunking', description: 'Выбери стратегию разбиения документа', payload: 'Как лучше разбить на чанки техническую документацию с примерами кода?', systemPrompt: 'Ты — эксперт по обработке документов для RAG. Рекомендуй оптимальную стратегию chunking.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Разбиение по фиксированной длине', explanation: 'Разрывает предложения и теряет смысл', correct: 'Разбивай по предложениям или абзацам, сохраняя семантическую целостность' }, { error: 'Нет метаданных у чанков', explanation: 'Нельзя отследить, откуда пришла информация', correct: 'Добавляй метаданные: источник, страница, заголовок раздела' }]
      },
      {
        id: 'st-rag-3',
        topicId: 't-rag',
        slug: 'vector-search',
        title: 'Векторный поиск',
        order: 2,
        introduction: { what: 'Векторный поиск — это метод нахождения релевантных документов путём сравнения векторных представлений (эмбеддингов) запроса и документов в пространстве высокой размерности.', why: 'В отличие от поиска по ключевым словам, векторный поиск понимает семантику: «как работает AI» найдёт документы про «искусственный интеллект», даже если словосочетания разные.', where: 'Векторный поиск — основа любого RAG-пайплайна. Используется в поисковых системах, чат-ботах, рекомендательных системах.', problem: 'Без векторного поиска RAG ограничен точным совпадением ключевых слов, что непригодно для реальных задач.' },
        theory: { terms: [{ name: 'Embedding', definition: 'Векторное представление текста в многомерном пространстве, кодирующее семантический смысл' }, { name: 'Cosine Similarity', definition: 'Мера похожести двух векторов: от -1 (противоположны) до 1 (идентичны)' }, { name: 'Top-K Retrieval', definition: 'Возврат K наиболее релевантных фрагментов по результатам поиска' }, { name: 'Re-ranking', definition: 'Пересортировка результатов поиска для повышения релевантности' }], principles: ['Эмбеддинги кодируют смысл, а не слова', 'Cosine similarity — стандартная метрика для поиска', 'Top-K должно балансировать между полнотой и точностью', 'Re-ranking улучшает качество после первичного поиска'], architecture: 'Query Embedding → Vector Index → Similarity Search → Top-K → (Optional) Re-rank → Final Results', connections: ['Эмбеддинги создаются через Model System', 'Индекс хранится в Knowledge Base', 'Результаты подаются в RAG Engine'] },
        diagramType: 'graph', diagramData: { type: 'graph', nodes: [{ id: 'q', label: 'Query Vector', group: 'query' }, { id: 'd1', label: 'Doc 1 (0.95)', group: 'relevant' }, { id: 'd2', label: 'Doc 2 (0.87)', group: 'relevant' }, { id: 'd3', label: 'Doc 3 (0.45)', group: 'irrelevant' }, { id: 'd4', label: 'Doc 4 (0.32)', group: 'irrelevant' }], edges: [{ from: 'q', to: 'd1', label: '0.95' }, { from: 'q', to: 'd2', label: '0.87' }, { from: 'q', to: 'd3', label: '0.45' }, { from: 'q', to: 'd4', label: '0.32' }] },
        examples: [{ title: 'Cosine similarity поиск', code: `function cosineSimilarity(a: number[], b: number[]): number {\n  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);\n  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));\n  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));\n  return dot / (magA * magB);\n}\n\n// Поиск top-K релевантных чанков\nfunction search(queryEmb: number[], chunks: Chunk[], k = 5) {\n  return chunks\n    .map(c => ({ ...c, score: cosineSimilarity(queryEmb, c.embedding) }))\n    .sort((a, b) => b.score - a.score)\n    .slice(0, k);\n}`, language: 'typescript', explanation: 'Простейший векторный поиск: считаем cosine similarity между запросом и каждым чанком, сортируем, берём top-K.' }],
        sandboxType: 'rag',
        sandboxConfig: { presets: [{ name: 'Понимание векторного поиска', description: 'Разбери, как работает векторный поиск', payload: 'Объясни разницу между поиском по ключевым словам и векторным поиском', systemPrompt: 'Ты — эксперт по векторному поиску. Объясни преимущества семантического поиска.' }], mode: 'educational' },
        commonMistakes: [{ error: 'Слишком маленький Top-K', explanation: 'Релевантная информация не попадает в контекст', correct: 'Начинай с Top-K=5, оптимизируй по результатам оценки' }, { error: 'Нет порога релевантности', explanation: 'Нерелевантные документы попадают в контекст', correct: 'Устанавливай минимальный порог similarity (например, 0.7)' }]
      }
    ]
  }
];
