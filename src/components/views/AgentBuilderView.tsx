'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Plus,
  Trash2,
  Play,
  ChevronRight,
  Wrench,
  Save,
  Zap,
  GraduationCap,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { availableSkills, mockAgentTemplate } from '@/data/view-data';
import type { ToolDefinition } from '@/types';

type AgentMode = 'educational' | 'advanced';

interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  selectedSkills: string[];
  tools: ToolDefinition[];
  mode: AgentMode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export function AgentBuilderView() {
  const [agent, setAgent] = useState<AgentConfig>({
    name: mockAgentTemplate.name,
    description: mockAgentTemplate.description,
    systemPrompt: mockAgentTemplate.systemPrompt,
    selectedSkills: mockAgentTemplate.skills,
    tools: mockAgentTemplate.tools,
    mode: mockAgentTemplate.mode as AgentMode,
  });

  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const toggleSkill = (slug: string) => {
    setAgent((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(slug)
        ? prev.selectedSkills.filter((s) => s !== slug)
        : [...prev.selectedSkills, slug],
    }));
  };

  const addTool = () => {
    if (!newToolName.trim()) return;
    setAgent((prev) => ({
      ...prev,
      tools: [
        ...prev.tools,
        {
          name: newToolName.trim(),
          description: newToolDesc.trim(),
          parameters: {},
        },
      ],
    }));
    setNewToolName('');
    setNewToolDesc('');
  };

  const removeTool = (name: string) => {
    setAgent((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t.name !== name),
    }));
  };

  const categoryGradients: Record<string, string> = {
    prompt: 'from-amber-500/20 to-orange-500/20',
    tool: 'from-emerald-500/20 to-teal-500/20',
    mcp: 'from-sky-500/20 to-cyan-500/20',
    rag: 'from-violet-500/20 to-purple-500/20',
    agent: 'from-blue-500/20 to-indigo-500/20',
  };

  const selectedSkillNames = agent.selectedSkills.map((slug) => {
    const skill = availableSkills.find((s) => s.slug === slug);
    return skill ? skill.name : slug;
  });

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <Bot className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Конструктор агентов</h1>
              <p className="text-sm text-muted-foreground">
                Создайте AI-агента, выбрав навыки и инструменты
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Left: Agent Config Form */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Конфигурация агента</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="agent-name" className="mb-1.5 block text-sm">
                    Название
                  </Label>
                  <Input
                    id="agent-name"
                    placeholder="Мой AI-агент"
                    value={agent.name}
                    onChange={(e) => setAgent((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="agent-desc" className="mb-1.5 block text-sm">
                    Описание
                  </Label>
                  <Textarea
                    id="agent-desc"
                    placeholder="Краткое описание агента..."
                    value={agent.description}
                    onChange={(e) => setAgent((prev) => ({ ...prev, description: e.target.value }))}
                    className="min-h-[80px] resize-y"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-system" className="mb-1.5 block text-sm">
                    Системный промпт
                  </Label>
                  <Textarea
                    id="agent-system"
                    placeholder="Опишите роль, поведение и ограничения агента..."
                    value={agent.systemPrompt}
                    onChange={(e) => setAgent((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                    className="min-h-[150px] resize-y"
                  />
                </div>
                <Separator />
                {/* Mode Toggle */}
                <div>
                  <Label className="mb-2 block text-sm">Режим агента</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={agent.mode === 'educational' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAgent((prev) => ({ ...prev, mode: 'educational' }))}
                      className="gap-1.5"
                    >
                      <GraduationCap className="size-3.5" />
                      Обучающий
                    </Button>
                    <Button
                      variant={agent.mode === 'advanced' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAgent((prev) => ({ ...prev, mode: 'advanced' }))}
                      className="gap-1.5"
                    >
                      <Zap className="size-3.5" />
                      Продвинутый
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {agent.mode === 'educational'
                      ? 'Агент объясняет каждый шаг и даёт подсказки'
                      : 'Агент выполняет задачи без пояснений'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Center: Skill Selector */}
          <motion.div variants={sectionVariants}>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">Выберите навыки</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="max-h-96">
                  <div className="flex flex-col gap-2">
                    {availableSkills.map((skill) => {
                      const isSelected = agent.selectedSkills.includes(skill.slug);
                      return (
                        <button
                          key={skill.slug}
                          onClick={() => toggleSkill(skill.slug)}
                          className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex size-6 items-center justify-center rounded bg-gradient-to-br ${
                                categoryGradients[skill.category] ?? 'from-gray-500/20 to-gray-600/20'
                              }`}
                            >
                              <ChevronRight className="size-3" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{skill.name}</div>
                              <Badge variant="outline" className="mt-0.5 text-[10px]">
                                {skill.category}
                              </Badge>
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">
                              ✓
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
                {agent.selectedSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedSkillNames.map((name, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Tools Editor */}
          <motion.div variants={sectionVariants}>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="size-4" />
                  Инструменты
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <ScrollArea className="max-h-48">
                  <div className="flex flex-col gap-2">
                    <AnimatePresence>
                      {agent.tools.map((tool) => (
                        <motion.div
                          key={tool.name}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <div className="text-sm font-medium">{tool.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {tool.description || 'Без описания'}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-rose-500"
                            onClick={() => removeTool(tool.name)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {agent.tools.length === 0 && (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        Нет добавленных инструментов
                      </p>
                    )}
                  </div>
                </ScrollArea>

                <Separator />

                <div>
                  <Label className="mb-1.5 block text-sm">Добавить инструмент</Label>
                  <Input
                    placeholder="Название инструмента"
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Описание"
                    value={newToolDesc}
                    onChange={(e) => setNewToolDesc(e.target.value)}
                    className="mb-2"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTool}
                    disabled={!newToolName.trim()}
                    className="w-full gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    Добавить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Bottom: Agent Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="size-4" />
                  Предпросмотр агента
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Скрыть' : 'Показать'}
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-muted p-4">
                        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Конфигурация агента
                        </div>
                        <div className="flex flex-col gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Название:</span>{' '}
                            <span className="font-medium">{agent.name || '(без названия)'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Режим:</span>{' '}
                            <Badge variant={agent.mode === 'educational' ? 'default' : 'secondary'} className="text-xs">
                              {agent.mode === 'educational' ? 'Обучающий' : 'Продвинутый'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Навыки:</span>{' '}
                            <span>{agent.selectedSkills.length > 0 ? selectedSkillNames.join(', ') : 'не выбраны'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Инструменты:</span>{' '}
                            <span>{agent.tools.length > 0 ? agent.tools.map((t) => t.name).join(', ') : 'нет'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Системный промпт
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
                          {agent.systemPrompt
                            ? agent.systemPrompt.substring(0, 200) + (agent.systemPrompt.length > 200 ? '...' : '')
                            : '(не задан)'}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex gap-3 pb-8"
        >
          <Button className="gap-2">
            <Play className="size-4" />
            Тестировать агента
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="size-4" />
            Сохранить
          </Button>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
