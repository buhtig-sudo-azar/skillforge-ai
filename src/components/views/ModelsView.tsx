'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  RefreshCw,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const { setCurrentModel, setApiToken, clearApiToken, checkModel, checkAllModels, fetchAvailableModels, availableModels, isLoadingModels, isCheckingAll } = useModelStore();
  const { toast } = useToast();

  const [tokenInput, setTokenInput] = useState(apiToken ?? '');
  const [showToken, setShowToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'valid' | 'invalid' | 'check_error' | null>(null);

  useEffect(() => {
    if (availableModels.length === 0) {
      fetchAvailableModels();
    }
  }, [availableModels.length, fetchAvailableModels]);

  const handleSaveToken = () => {
    setApiToken(tokenInput);
    toast({
      title: 'Токен сохранён',
      description: 'Ваш API-токен будет использоваться для всех запросов к моделям.',
    });
  };

  const handleRemoveToken = () => {
    clearApiToken();
    setTokenInput('');
    setVerifyResult(null);
    toast({
      title: 'Токен удалён',
      description: 'Теперь используется общий токен платформы.',
    });
  };

  const handleVerify = async () => {
    if (!apiToken) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const result = await checkModel(currentModel);

      if (result.available) {
        setVerifyResult('valid');
        toast({ title: 'Токен валиден', description: 'API-ключ работает корректно.' });
      } else if (result.reason === 'rate_limited') {
        setVerifyResult('valid');
        toast({ title: 'Токен валиден', description: 'Токен работает, но достигнут лимит запросов.' });
      } else if (result.reason === 'insufficient_credits') {
        setVerifyResult('valid');
        toast({ title: 'Токен валиден', description: 'Токен работает, но недостаточно кредитов для платной модели.' });
      } else if (result.reason === 'invalid_token') {
        setVerifyResult('invalid');
        toast({ title: 'Токен невалиден', description: 'API-ключ не прошёл проверку. Проверьте правильность ключа.', variant: 'destructive' });
      } else {
        setVerifyResult('check_error');
        toast({ title: 'Не удалось проверить', description: `Модель "${currentModel.split('/').pop()}" недоступна. Попробуйте проверить с другой моделью.`, variant: 'default' });
      }
    } catch {
      setVerifyResult('check_error');
      toast({ title: 'Ошибка проверки', description: 'Не удалось подключиться к OpenRouter.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckAll = async () => {
    await checkAllModels();
    toast({ title: 'Проверка завершена', description: 'Статус всех моделей обновлён.' });
  };

  const maskedToken = apiToken ? apiToken.slice(0, 6) + '...' + apiToken.slice(-4) : '';

  const availableCount = availableModels.filter(m => rateLimits[m.id]?.available).length;
  const rateLimitedCount = availableModels.filter(m => rateLimits[m.id]?.reason === 'rate_limited').length;

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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleCheckAll}
              disabled={isCheckingAll}
            >
              {isCheckingAll ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Zap className="size-3.5" />
              )}
              Проверить все
            </Button>
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
              Обновить
            </Button>
          </div>
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
                        {verifyResult === 'check_error' && (
                          <AlertTriangle className="size-4 text-amber-500 shrink-0" />
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
                      Токен сохранён в localStorage
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

          {/* Model Availability Overview */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {availableCount > 0 ? (
                    <Wifi className="size-4 text-green-500" />
                  ) : (
                    <WifiOff className="size-4 text-muted-foreground" />
                  )}
                  Доступность моделей
                  {Object.keys(rateLimits).length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({availableCount}/{availableModels.length} доступно{rateLimitedCount > 0 ? `, ${rateLimitedCount} лимит` : ''})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isCheckingAll && (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Проверяю доступность моделей...
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {availableModels.map((model) => {
                    const info = rateLimits[model.id];
                    const isSelected = currentModel === model.id;
                    const isRateLimited = info?.reason === 'rate_limited';
                    const isUnavailable = info?.available === false && !isRateLimited;

                    return (
                      <div
                        key={model.id}
                        onClick={() => setCurrentModel(model.id)}
                        className={cn(
                          'cursor-pointer rounded-lg border p-4 transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : isRateLimited
                              ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10'
                              : isUnavailable
                                ? 'border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-900/10 opacity-60'
                                : 'hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {/* Статус иконка */}
                              {!info && (
                                <span className="w-4 h-4 rounded-full bg-muted-foreground/20 inline-block shrink-0" />
                              )}
                              {info?.available && (
                                <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                              )}
                              {info?.reason === 'rate_limited' && (
                                <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                              )}
                              {isUnavailable && info && (
                                <XCircle className="size-4 text-red-500 shrink-0" />
                              )}

                              <h3 className="text-sm font-medium">{model.name || model.label}</h3>

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

                              {isUnavailable && info?.reason === 'invalid_token' && (
                                <Badge variant="destructive" className="text-xs">Токен невалиден</Badge>
                              )}

                              {isUnavailable && info?.reason === 'error' && (
                                <Badge variant="destructive" className="text-xs">Ошибка</Badge>
                              )}

                              {isSelected && (
                                <Badge variant="default" className="shrink-0">
                                  Активна
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground font-mono">
                              {model.id}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Латентность */}
                            {info?.latency && (
                              <span className={cn(
                                'text-[10px] font-mono px-1.5 py-0.5 rounded',
                                info.latency < 2000 ? 'bg-green-500/10 text-green-600' :
                                info.latency < 5000 ? 'bg-amber-500/10 text-amber-600' :
                                'bg-red-500/10 text-red-600'
                              )}>
                                {info.latency < 1000 ? `${info.latency}ms` : `${(info.latency / 1000).toFixed(1)}s`}
                              </span>
                            )}

                            {/* Remaining/Limit */}
                            {info?.available && info.remaining !== null && info.remaining !== undefined && (
                              <span className={cn(
                                'text-[10px] font-mono px-1.5 py-0.5 rounded',
                                info.remaining < 5 ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'
                              )}>
                                {info.remaining}/{info.limit || '?'} ост.
                              </span>
                            )}

                            {/* Кнопка проверки */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                checkModel(model.id);
                              }}
                              className="p-1 rounded hover:bg-muted transition-colors"
                              title="Проверить доступность"
                            >
                              <Zap className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isLoadingModels && (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Загрузка списка моделей...
                  </div>
                )}

                {/* Время последней проверки */}
                {Object.keys(rateLimits).length > 0 && (
                  <div className="text-xs text-muted-foreground pt-3 mt-3 border-t border-border/50 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Последняя проверка: {new Date(Math.max(...Object.values(rateLimits).map(r => r.checkedAt || 0))).toLocaleTimeString('ru-RU')}
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
                            <CheckCircle2 className="size-4 text-green-500" />
                          ) : entry.reason === 'rate_limited' ? (
                            <AlertTriangle className="size-4 text-amber-500" />
                          ) : (
                            <XCircle className="size-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">{slug.split('/').pop()}</span>
                          {entry.reason && (
                            <Badge
                              variant={entry.reason === 'rate_limited' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {entry.reason === 'rate_limited' ? 'Лимит' :
                               entry.reason === 'invalid_token' ? 'Невалидный токен' :
                               entry.reason === 'not_found' ? 'Не найдена' :
                               entry.reason === 'insufficient_credits' ? 'Нет кредитов' :
                               entry.reason}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          {entry.available && entry.remaining !== null && (
                            <span>{entry.remaining}/{entry.limit || '?'} ост.</span>
                          )}
                          {entry.latency && (
                            <span>{entry.latency < 1000 ? `${entry.latency}ms` : `${(entry.latency / 1000).toFixed(1)}s`}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-900/20">
                    <Check className="size-4 text-emerald-500" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">
                      Нет активных ограничений — нажмите «Проверить все» для проверки
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
