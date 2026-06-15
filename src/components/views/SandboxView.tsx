'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FlaskConical,
  ToggleLeft,
  ToggleRight,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sandboxPresets } from '@/data/view-data';
import type { SandboxPreset } from '@/types';

type SandboxMode = 'educational' | 'advanced';
type ResultStatus = 'success' | 'warning' | 'error' | null;

interface SandboxResult {
  status: ResultStatus;
  output: string;
  tokens?: number;
  model?: string;
  latency?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const statusConfig: Record<NonNullable<ResultStatus>, { icon: typeof CheckCircle2; color: string; label: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Успешно' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', label: 'Предупреждение' },
  error: { icon: XCircle, color: 'text-rose-500', label: 'Ошибка' },
};

export function SandboxView() {
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [mode, setMode] = useState<SandboxMode>('educational');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SandboxResult | null>(null);

  const handlePresetClick = (preset: SandboxPreset) => {
    setInput(preset.payload);
    setSystemPrompt(preset.systemPrompt);
  };

  const handleRun = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, systemPrompt, mode }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setResult({
          status: 'error',
          output: data.error ?? `Ошибка сервера: ${response.status}`,
        });
        return;
      }

      const data = await response.json();
      setResult({
        status: 'success',
        output: data.output ?? data.result ?? 'Результат получен',
        tokens: data.tokens,
        model: data.model,
        latency: data.latency,
      });
    } catch {
      setResult({
        status: 'error',
        output: 'Не удалось подключиться к серверу. Проверьте соединение.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatusIcon = result?.status ? statusConfig[result.status].icon : null;

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <FlaskConical className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Песочница</h1>
              <p className="text-sm text-muted-foreground">
                Экспериментируйте с промптами и AI-моделями в безопасной среде
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="text-sm text-muted-foreground">Режим:</span>
          <Button
            variant={mode === 'educational' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('educational')}
            className="gap-1.5"
          >
            <Zap className="size-3.5" />
            Обучающий
          </Button>
          <Button
            variant={mode === 'advanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('advanced')}
            className="gap-1.5"
          >
            режим Продвинутый
          </Button>
        </motion.div>

        {/* Presets */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Label className="mb-2 block text-sm font-medium">Пресеты</Label>
          <div className="flex flex-wrap gap-2">
            {sandboxPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="gap-1.5"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Left Panel: Input */}
          <motion.div variants={sectionVariants} className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Входные данные</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="system-prompt" className="mb-1.5 block text-sm">
                    Системный промпт
                  </Label>
                  <Input
                    id="system-prompt"
                    placeholder="Задайте роль и контекст для модели..."
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sandbox-input" className="mb-1.5 block text-sm">
                    Запрос
                  </Label>
                  <Textarea
                    id="sandbox-input"
                    placeholder="Введите промпт для тестирования..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[200px] resize-y"
                  />
                </div>
                <Button
                  onClick={handleRun}
                  disabled={isLoading || !input.trim()}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  {isLoading ? 'Выполнение...' : 'Запустить'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Panel: Output */}
          <motion.div variants={sectionVariants} className="flex flex-col gap-4">
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  Результат
                  {result?.status && StatusIcon && (
                    <StatusIcon className={`size-5 ${statusConfig[result.status].color}`} />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <Loader2 className="mb-3 size-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Обработка запроса...</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            result.status === 'success'
                              ? 'border-emerald-300 text-emerald-600'
                              : result.status === 'warning'
                                ? 'border-amber-300 text-amber-600'
                                : 'border-rose-300 text-rose-600'
                          }
                        >
                          {result.status && statusConfig[result.status].label}
                        </Badge>
                        {result.model && (
                          <Badge variant="secondary" className="text-xs">
                            {result.model}
                          </Badge>
                        )}
                        {result.tokens && (
                          <Badge variant="secondary" className="text-xs">
                            {result.tokens} токенов
                          </Badge>
                        )}
                        {result.latency && (
                          <Badge variant="secondary" className="text-xs">
                            {result.latency}мс
                          </Badge>
                        )}
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <pre className="whitespace-pre-wrap text-sm">{result.output}</pre>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <FlaskConical className="mb-3 size-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        Введите запрос и нажмите «Запустить»
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
