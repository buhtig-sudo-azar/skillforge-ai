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
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useModelStore, useSelectedModel, useApiToken, useRateLimits } from '@/store/model-store';

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
  const currentModel = useSelectedModel();
  const apiToken = useApiToken();
  const rateLimits = useRateLimits();
  const { setCurrentModel, setApiToken, clearApiToken, checkModel, fetchAvailableModels, availableModels, isLoadingModels } = useModelStore();

  const [tokenInput, setTokenInput] = useState(apiToken ?? '');
  const [showToken, setShowToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'valid' | 'invalid' | null>(null);

  useEffect(() => {
    if (availableModels.length === 0) {
      fetchAvailableModels();
    }
  }, [availableModels.length, fetchAvailableModels]);

  const handleSaveToken = () => {
    setApiToken(tokenInput);
  };

  const handleRemoveToken = () => {
    clearApiToken();
    setTokenInput('');
    setVerifyResult(null);
  };

  const handleVerify = async () => {
    if (!apiToken) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const result = await checkModel(currentModel);
      const isValid = result.available || result.reason === 'rate_limited' || result.reason === 'insufficient_credits';
      setVerifyResult(isValid ? 'valid' : 'invalid');
    } catch {
      setVerifyResult('invalid');
    } finally {
      setIsVerifying(false);
    }
  };

  const maskedToken = apiToken ? apiToken.slice(0, 6) + '...' + apiToken.slice(-4) : '';

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
            onClick={fetchAvailableModels}
            disabled={isLoadingModels}
          >
            {isLoadingModels ? (
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
                  OpenRouter API-токен
                </CardTitle>
              </CardHeader>
              <CardContent>
                {apiToken ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/30 text-sm">
                        <span className="font-mono text-muted-foreground truncate flex-1">
                          {maskedToken}
                        </span>
                        {verifyResult === 'valid' && (
                          <Wifi className="size-4 text-green-500 shrink-0" />
                        )}
                        {verifyResult === 'invalid' && (
                          <WifiOff className="size-4 text-red-500 shrink-0" />
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className="gap-1.5"
                      >
                        {isVerifying ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                        Проверить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveToken}
                        className="gap-1.5"
                      >
                        <X className="size-3.5" />
                        Удалить
                      </Button>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      ✓ Токен сохранён в localStorage
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showToken ? 'text' : 'password'}
                          placeholder="sk-or-v1-..."
                          value={tokenInput}
                          onChange={(e) => setTokenInput(e.target.value)}
                          className="pr-10"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveToken();
                            }
                          }}
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
                      <Button onClick={handleSaveToken} disabled={!tokenInput.trim()} className="gap-1.5">
                        <Check className="size-3.5" />
                        Сохранить
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Бесплатный ключ:{' '}
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        openrouter.ai/keys
                      </a>
                    </p>
                  </div>
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
                          {entry.available ? (
                            <Wifi className="size-4 text-green-500" />
                          ) : (
                            <X className="size-4 text-rose-500" />
                          )}
                          <span className="text-sm font-medium">{slug}</span>
                          {entry.reason && (
                            <Badge variant={entry.reason === 'rate_limited' ? 'secondary' : 'destructive'} className="text-xs">
                              {entry.reason === 'rate_limited' ? 'Лимит' : entry.reason}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.available && entry.remaining !== null && (
                            <span>{entry.remaining}/{entry.limit || '?'}</span>
                          )}
                          {entry.latency && (
                            <span className="ml-2">{entry.latency}ms</span>
                          )}
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

          {/* Available Models */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Доступные модели</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {availableModels.map((model) => {
                    const isSelected = currentModel === model.id;
                    const info = rateLimits[model.id];
                    const isRateLimited = info?.reason === 'rate_limited';
                    const isUnavailable = info?.available === false;
                    return (
                      <div
                        key={model.id}
                        onClick={() => setCurrentModel(model.id)}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : isRateLimited
                              ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10'
                              : isUnavailable
                                ? 'border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-900/10 opacity-60'
                                : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium">{model.name}</h3>
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <Zap className="mr-1 size-3" />
                                Бесплатно
                              </Badge>
                              {isRateLimited && (
                                <Badge variant="secondary" className="text-xs">Лимит</Badge>
                              )}
                              {isUnavailable && info?.reason === 'not_found' && (
                                <Badge variant="destructive" className="text-xs">Недоступна</Badge>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground font-mono">
                              {model.id}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {info?.available && info.remaining !== null && info.remaining !== undefined && (
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                info.remaining < 5 ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'
                              }`}>
                                {info.remaining}/{info.limit || '?'}
                              </span>
                            )}
                            {isSelected && (
                              <Badge variant="default" className="shrink-0">
                                ✓ Активна
                              </Badge>
                            )}
                          </div>
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
