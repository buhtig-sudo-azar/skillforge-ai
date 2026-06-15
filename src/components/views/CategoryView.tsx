'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  GitBranch,
  Layers,
  Signal,
  Zap,
} from 'lucide-react';
import { useNavigationStore } from '@/store/navigation-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { topics, categoryGradients } from '@/data/topics';
import type { Subtopic, DiagramType } from '@/types';

// ── helpers ──────────────────────────────────────────────────

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '…';
}

const difficultyLabel = (order: number): { label: string; color: string } => {
  if (order === 0) return { label: 'Начальный', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' };
  if (order === 1) return { label: 'Базовый', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' };
  if (order === 2) return { label: 'Средний', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' };
  return { label: 'Продвинутый', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' };
};

const diagramTypeLabel: Record<DiagramType, string> = {
  flow: 'Блок-схема',
  tree: 'Дерево',
  graph: 'Граф',
  'cause-effect': 'Причина-следствие',
  'attack-tree': 'Дерево атак',
  'knowledge-map': 'Карта знаний',
};

const diagramIcon: Record<DiagramType, React.ReactNode> = {
  flow: <GitBranch className="size-3" />,
  tree: <Layers className="size-3" />,
  graph: <Signal className="size-3" />,
  'cause-effect': <Zap className="size-3" />,
  'attack-tree': <Zap className="size-3" />,
  'knowledge-map': <BookOpen className="size-3" />,
};

// ── animation variants ───────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

// ── component ────────────────────────────────────────────────

export function CategoryView() {
  const currentCategory = useNavigationStore((s) => s.currentCategory);
  const navigate = useNavigationStore((s) => s.actions.navigate);

  const topic = currentCategory
    ? topics.find((t) => t.slug === currentCategory)
    : null;

  // ── no matching topic ──
  if (!topic) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="size-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Категория не найдена</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Запрашиваемая категория не существует или была удалена.
          </p>
          <Button variant="outline" onClick={() => navigate('home')}>
            <ArrowLeft className="mr-2 size-4" />
            На главную
          </Button>
        </motion.div>
      </div>
    );
  }

  const gradient =
    topic.gradient ?? categoryGradients[topic.slug] ?? 'from-gray-500 to-gray-600';

  const subtopics = [...topic.subtopics].sort((a, b) => a.order - b.order);

  // ── render ──
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Hero header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('home')}
        >
          <ArrowLeft className="size-3.5" />
          Назад
        </Button>

        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg sm:p-8`}
        >
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full bg-white/10" />

          <div className="relative flex items-start gap-4 sm:items-center">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm sm:size-16">
              <span className="text-3xl sm:text-4xl">{topic.icon ?? '📁'}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {topic.title}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-white/80 sm:text-base">
                {topic.description}
              </p>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap gap-3 sm:mt-5">
            <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
              {subtopics.length}{' '}
              {subtopics.length === 1
                ? 'тема'
                : subtopics.length < 5
                  ? 'темы'
                  : 'тем'}
            </Badge>

            {subtopics.some((s) => s.diagramType) && (
              <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                <GitBranch className="mr-1 size-3" />
                Диаграммы
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      <Separator className="my-6" />

      {/* ── Subtopic grid ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5"
      >
        {subtopics.map((subtopic, index) => (
          <SubtopicCard
            key={subtopic.id}
            subtopic={subtopic}
            index={index}
            gradient={gradient}
            categorySlug={currentCategory!}
            onNavigate={() =>
              navigate('topic', currentCategory, subtopic.slug)
            }
          />
        ))}
      </motion.div>

      {/* ── Bottom info ── */}
      {subtopics.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground">
            В этой категории пока нет тем. Загляните позже!
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ── Subtopic card ────────────────────────────────────────────

interface SubtopicCardProps {
  subtopic: Subtopic;
  index: number;
  gradient: string;
  categorySlug: string;
  onNavigate: () => void;
}

function SubtopicCard({
  subtopic,
  index,
  gradient,
  categorySlug,
  onNavigate,
}: SubtopicCardProps) {
  const diff = difficultyLabel(subtopic.order);
  const hasDiagram = !!subtopic.diagramType;
  return (
    <motion.div variants={cardVariants}>
      <Card
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
        onClick={onNavigate}
      >
        {/* top accent bar */}
        <div
          className={`h-1 w-full bg-gradient-to-r ${gradient} opacity-60 transition-opacity group-hover:opacity-100`}
        />

        <CardHeader className="pb-2 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                {index + 1}
              </div>
              <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                {subtopic.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3 pb-4">
          {/* introduction preview */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {truncate(subtopic.introduction.what, 100)}
          </p>

          {/* badges row */}
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
            {/* difficulty */}
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${diff.color}`}
            >
              {diff.label}
            </span>

            {/* diagram type */}
            {hasDiagram && subtopic.diagramType && (
              <Badge
                variant="outline"
                className="gap-1 text-[11px] font-normal"
              >
                {diagramIcon[subtopic.diagramType]}
                {diagramTypeLabel[subtopic.diagramType]}
              </Badge>
            )}

            {/* examples count */}
            {subtopic.examples.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-auto text-[11px] font-normal"
              >
                {subtopic.examples.length}{' '}
                {subtopic.examples.length === 1
                  ? 'пример'
                  : subtopic.examples.length < 5
                    ? 'примера'
                    : 'примеров'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
