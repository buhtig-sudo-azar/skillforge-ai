'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  RefreshCw,
  Check,
  X,
  Zap,
  Clock,
  Key,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useModelStore, useModelActions } from '@/store/model-store';
import { mockModels } from '@/data/view-data';
import type { ModelConfig } from '@/types';

const providerLabels: Record<string, string> = {
  openrouter: 'OpenRouter',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  local: 'Локальная',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export function ModelsView() {
  const selectedModel = useModelStore((s) => s.selectedModel);
  const apiToken = useModelStore((s) => s.apiToken);
  const freeModels = useModelStore((s) => s.freeModels);
  const isLoading = useModelStore((s) => s.isLoading);
  const rateLimits = useModelStore((s) => s.rateLimits);
  const { setModel, setApiToken, fetchFreeModels, isRateLimited } = useModelActions();

  const [tokenInput, setTokenInput] = useState(apiToken ?? '');
  const [showToken, setShowToken] = useState(false);
  const [models] = useState<ModelConfig[]>(mockModels);

  useEffect(() => {
    if (freeModels.length === 0) {
      fetchFreeModels();
    }
  }, [freeModels.length, fetchFreeModels]);

  const handleSaveToken = () => {
    setApiToken(tokenInput || null);
  };

  const formatContext = (tokens?: number) => {
    if (!tokens) return '—';
    if (tokens >= 1000) return `${tokens / 1000}K`;
    return String(tokens);
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <Cpu className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Модели</h1>
              <p className="text-sm text-muted-foreground">
                Управление AI-моделями и API-ключами
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={fetchFreeModels}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Обновить список моделей
          </Button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* API Token */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Key className="size-4" />
                  API-токен
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showToken ? 'text' : 'password'}
                      placeholder="Введите API-токен (OpenRouter, OpenAI, и т.д.)"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </Button>
                  </div>
                  <Button onClick={handleSaveToken} className="gap-1.5">
                    <Check className="size-3.5" />
                    Сохранить
                  </Button>
                </div>
                {apiToken && (
                  <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                    ✓ Токен сохранён в localStorage
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Rate Limit Status */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-4" />
                  Статус лимитов
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(rateLimits).length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {Object.entries(rateLimits).map(([slug, entry]) => (
                      <div
                        key={slug}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <X className="size-4 text-rose-500" />
                          <span className="text-sm font-medium">{slug}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Лимит до{' '}
                          {new Date(entry.until).toLocaleTimeString('ru-RU')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-900/20">
                    <Check className="size-4 text-emerald-500" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">
                      Нет активных ограничений
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Model List */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Доступные модели</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {models.map((model) => {
                    const isSelected = selectedModel === model.slug;
                    const rateLimited = isRateLimited(model.slug);
                    return (
                      <div
                        key={model.id}
                        onClick={() => setModel(model.slug)}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : rateLimited
                              ? 'border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-900/10'
                              : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium">{model.name}</h3>
                              {model.isFree ? (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  <Zap className="mr-1 size-3" />
                                  Бесплатно
                                </Badge>
                              ) : (
                                <Badge variant="outline">Платная</Badge>
                              )}
                              {rateLimited && (
                                <Badge variant="destructive" className="text-xs">
                                  Лимит
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{providerLabels[model.provider] ?? model.provider}</span>
                              <span>·</span>
                              <span>
                                Контекст: {formatContext(model.contextWindow)}
                              </span>
                              <span>·</span>
                              <span>
                                Макс. токенов: {formatContext(model.maxTokens)}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              ID: {model.modelId}
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="shrink-0">
                              ✓ Активна
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
