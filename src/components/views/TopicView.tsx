'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Code, AlertTriangle, Lightbulb, GitBranch, Play } from 'lucide-react';
import { useNavigationStore } from '@/store/navigation-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { topics } from '@/data/topics';
import type { Subtopic, DiagramData } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

function DiagramPlaceholder({ diagramType, diagramData }: { diagramType: string; diagramData?: DiagramData }) {
  const getSummary = () => {
    if (!diagramData) return 'Нет данных';
    switch (diagramData.type) {
      case 'flow':
        return `${diagramData.nodes.length} узлов, ${diagramData.edges.length} связей`;
      case 'tree':
        return `Корень: ${diagramData.root.label}`;
      case 'graph':
        return `${diagramData.nodes.length} узлов, ${diagramData.edges.length} связей`;
      case 'cause-effect':
        return `${diagramData.causes.length} причин, ${diagramData.effects.length} следствий`;
      case 'attack-tree':
        return `Цель: ${diagramData.goal}`;
      case 'knowledge-map':
        return `${diagramData.concepts.length} концепций, ${diagramData.relations.length} связей`;
      default:
        return 'Данные диаграммы';
    }
  };

  const typeLabels: Record<string, string> = {
    flow: 'Блок-схема',
    tree: 'Дерево',
    graph: 'Граф',
    'cause-effect': 'Причина-Следствие',
    'attack-tree': 'Дерево атак',
    'knowledge-map': 'Карта знаний',
  };

  return (
    <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-6 text-center">
      <GitBranch className="mx-auto mb-2 size-8 text-muted-foreground/50" />
      <div className="text-sm font-medium">{typeLabels[diagramType] ?? diagramType}</div>
      <div className="mt-1 text-xs text-muted-foreground">{getSummary()}</div>
      {diagramData && (
        <div className="mt-3 rounded bg-muted p-2">
          <pre className="overflow-x-auto text-left text-[10px] text-muted-foreground">
            {JSON.stringify(diagramData, null, 2).slice(0, 500)}
            {JSON.stringify(diagramData).length > 500 && '...'}
          </pre>
        </div>
      )}
    </div>
  );
}

function findSubtopic(categorySlug: string, subtopicSlug: string): Subtopic | null {
  const topic = topics.find((t) => t.slug === categorySlug);
  if (!topic) return null;
  return topic.subtopics.find((st) => st.slug === subtopicSlug) ?? null;
}

export function TopicView() {
  const currentSubtopic = useNavigationStore((s) => s.currentSubtopic);
  const currentCategory = useNavigationStore((s) => s.currentCategory);
  const navigate = useNavigationStore((s) => s.actions.navigate);

  const topic = currentCategory ? topics.find((t) => t.slug === currentCategory) : null;
  const subtopic = currentCategory && currentSubtopic
    ? findSubtopic(currentCategory, currentSubtopic)
    : null;

  const title = subtopic?.title ?? (currentSubtopic
    ? currentSubtopic.charAt(0).toUpperCase() + currentSubtopic.slice(1).replace(/-/g, ' ')
    : 'Тема урока');

  const intro = subtopic?.introduction ?? {
    what: 'Описание того, что изучается в данной теме.',
    why: 'Объяснение, почему эта тема важна для AI Engineering.',
    where: 'Где применяются знания из этой темы на практике.',
    problem: 'Какую проблему решает изучаемый подход или технология.',
  };

  const terms = subtopic?.theory.terms ?? [
    { name: 'Термин 1', definition: 'Определение первого ключевого термина' },
    { name: 'Термин 2', definition: 'Определение второго ключевого термина' },
  ];

  const principles = subtopic?.theory.principles ?? [
    'Принцип 1: описание первого ключевого принципа',
    'Принцип 2: описание второго ключевого принципа',
  ];

  const examples = subtopic?.examples ?? [
    {
      title: 'Пример использования',
      code: '// Пример кода будет добавлен\nconsole.log("Hello, AI Engineering!");',
      language: 'javascript',
      explanation: 'Пояснение к примеру кода.',
    },
  ];

  const commonMistakes = subtopic?.commonMistakes ?? [
    {
      error: 'Типичная ошибка',
      explanation: 'Почему эта ошибка возникает и к каким последствиям приводит.',
      correct: 'Правильный подход к решению задачи.',
    },
  ];

  const diagramType = subtopic?.diagramType;
  const diagramData = subtopic?.diagramData;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Навигация назад */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 gap-1 text-muted-foreground"
          onClick={() => navigate('category', currentCategory)}
        >
          <ArrowLeft className="size-3.5" />
          Назад к списку тем
        </Button>

        <h1 className="mb-2 text-2xl font-bold tracking-tight">{title}</h1>
        <div className="flex items-center gap-2 mb-6">
          {topic && (
            <Badge variant="secondary" className="gap-1">
              <span>{topic.icon}</span>
              {topic.title}
            </Badge>
          )}
          {currentCategory && (
            <Badge variant="outline">{currentCategory}</Badge>
          )}
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        {/* Введение */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="size-5 text-primary" />
                Введение
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground">Что это</span>
                <p className="mt-0.5 text-sm">{intro.what}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground">Зачем это нужно</span>
                <p className="mt-0.5 text-sm">{intro.why}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground">Где применяется</span>
                <p className="mt-0.5 text-sm">{intro.where}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground">Проблема</span>
                <p className="mt-0.5 text-sm">{intro.problem}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ключевые термины */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="size-5 text-amber-500" />
                Ключевые термины
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {terms.map((term) => (
                  <div key={term.name} className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">{term.name}</Badge>
                    <span className="text-sm text-muted-foreground">{term.definition}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Принципы */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Принципы</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {principles.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Диаграмма */}
        {diagramType && (
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GitBranch className="size-5 text-violet-500" />
                  Диаграмма
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DiagramPlaceholder diagramType={diagramType} diagramData={diagramData} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Примеры */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="size-5 text-emerald-500" />
                Примеры
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {examples.map((ex) => (
                <div key={ex.title}>
                  <h4 className="mb-2 text-sm font-medium">{ex.title}</h4>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                    <code>{ex.code}</code>
                  </pre>
                  <p className="mt-2 text-xs text-muted-foreground">{ex.explanation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Ссылка на песочницу */}
        {subtopic?.sandboxType && (
          <motion.div variants={sectionVariants}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Play className="size-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Попробовать в песочнице</div>
                    <div className="text-xs text-muted-foreground">
                      Тип: {subtopic.sandboxType}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate('sandbox')}
                  className="gap-1.5"
                >
                  <Play className="size-3.5" />
                  Открыть
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Частые ошибки */}
        <motion.div variants={sectionVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="size-5 text-destructive" />
                Частые ошибки
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {commonMistakes.map((m, i) => (
                <div key={i} className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <div className="mb-1 text-sm font-medium text-destructive">❌ {m.error}</div>
                  <p className="mb-2 text-xs text-muted-foreground">{m.explanation}</p>
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✅ {m.correct}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
