'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  BookOpen,
  Code,
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useNavigationStore } from '@/store/navigation-store';
import { useProgressStore } from '@/store/progress-store';
import { useSkillStore } from '@/store/skill-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockSkill } from '@/data/view-data';
import type { Skill, SkillCategory, SkillLevel } from '@/types';

const categoryLabels: Record<SkillCategory, string> = {
  prompt: 'Промпт',
  agent: 'Агент',
  tool: 'Инструмент',
  mcp: 'MCP',
  rag: 'RAG',
  workflow: 'Воркфлоу',
  architecture: 'Архитектура',
  security: 'Безопасность',
};

const levelConfig: Record<SkillLevel, { label: string; color: string }> = {
  beginner: { label: 'Начинающий', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  intermediate: { label: 'Средний', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  advanced: { label: 'Продвинутый', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

function TemplateBlock({ template }: { template: Skill['templates'][0] }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-muted/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Code className="size-4 text-primary" />
          <span className="text-sm font-medium">{template.name}</span>
          {template.language && (
            <Badge variant="outline" className="text-xs">
              {template.language}
            </Badge>
          )}
        </div>
        {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative border-t px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 size-7"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </Button>
              <pre className="overflow-x-auto text-xs">
                <code>{template.content}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExamplePair({ example }: { example: Skill['examples'][0] }) {
  return (
    <div className="rounded-lg border">
      <div className="border-b px-4 py-2">
        <h4 className="text-sm font-medium">{example.title}</h4>
      </div>
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="border-b p-4 sm:border-b-0 sm:border-r">
          <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Ввод</span>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{example.input}</pre>
        </div>
        <div className="p-4">
          <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Вывод</span>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-emerald-600 dark:text-emerald-400">{example.output}</pre>
        </div>
      </div>
    </div>
  );
}

export function SkillView() {
  const currentSkillSlug = useNavigationStore((s) => s.currentSkill);
  const navigate = useNavigationStore((s) => s.actions.navigate);
  const skills = useSkillStore((s) => s.skills);
  const completeSkill = useProgressStore((s) => s.actions.completeSkill);
  const completedSkills = useProgressStore((s) => s.completedSkills);

  const skill = currentSkillSlug
    ? skills.find((s) => s.slug === currentSkillSlug) ?? mockSkill
    : mockSkill;

  const isCompleted = completedSkills.includes(skill.slug);

  const handleComplete = () => {
    completeSkill(skill.slug);
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* YAML Frontmatter Card */}
          <motion.div variants={sectionVariants}>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-6 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{skill.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{skill.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={levelConfig[skill.level].color}>
                      {levelConfig[skill.level].label}
                    </Badge>
                    <Badge variant="outline">{categoryLabels[skill.category]}</Badge>
                  </div>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="size-3.5 text-muted-foreground" />
                  {skill.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">
                    v{skill.version}
                  </Badge>
                </div>
                {skill.yamlFront && (
                  <div className="mt-4 rounded-lg bg-muted p-3">
                    <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">
                      YAML Frontmatter
                    </span>
                    <SyntaxHighlighter language="yaml" style={oneDark} customStyle={{ margin: 0, padding: '0.75rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}>
                      {skill.yamlFront}
                    </SyntaxHighlighter>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Markdown Body */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="size-5 text-primary" />
                  Содержание навыка
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const inline = !match;
                      if (inline) {
                        return (
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs" {...props}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, fontSize: '0.75rem', borderRadius: '0.5rem' }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      );
                    },
                  }}
                >
                  {skill.body}
                </ReactMarkdown>
              </CardContent>
            </Card>
          </motion.div>

          {/* Templates Section */}
          {skill.templates.length > 0 && (
            <motion.div variants={sectionVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code className="size-5 text-violet-500" />
                    Шаблоны
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {skill.templates.map((template) => (
                    <TemplateBlock key={template.id} template={template} />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Examples Section */}
          {skill.examples.length > 0 && (
            <motion.div variants={sectionVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="size-5 text-amber-500" />
                    Примеры
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {skill.examples.map((example) => (
                    <ExamplePair key={example.id} example={example} />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Separator />

          {/* Action Buttons */}
          <motion.div variants={sectionVariants} className="flex flex-wrap gap-3 pb-8">
            <Button
              onClick={() => navigate('sandbox', null, null, null, skill.slug)}
              className="gap-2"
            >
              <Play className="size-4" />
              Попробовать в песочнице
            </Button>
            <Button
              variant={isCompleted ? 'outline' : 'default'}
              onClick={handleComplete}
              disabled={isCompleted}
              className="gap-2"
            >
              <CheckCircle2 className="size-4" />
              {isCompleted ? 'Навык освоен' : 'Завершить навык (+30 XP)'}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
