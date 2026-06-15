'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Shield,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Ban,
  Eye,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockSecurityRules, mockSecurityLog } from '@/data/view-data';
import type { SecurityRule } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: 'Критический', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  high: { label: 'Высокий', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  medium: { label: 'Средний', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  low: { label: 'Низкий', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

const actionConfig: Record<string, { label: string; icon: typeof Ban; color: string }> = {
  block: { label: 'Блокировка', icon: Ban, color: 'text-rose-500' },
  warn: { label: 'Предупреждение', icon: AlertTriangle, color: 'text-amber-500' },
  log: { label: 'Логирование', icon: Eye, color: 'text-blue-500' },
  sanitize: { label: 'Санитизация', icon: Shield, color: 'text-violet-500' },
};

const categoryLabels: Record<string, string> = {
  'input-validation': 'Валидация ввода',
  'output-filter': 'Фильтр вывода',
  'rate-limit': 'Лимит запросов',
  auth: 'Авторизация',
  'data-protection': 'Защита данных',
};

export function SecurityView() {
  const [rules, setRules] = useState<SecurityRule[]>(mockSecurityRules);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  const enabledCount = rules.filter((r) => r.enabled).length;

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-red-600 text-white">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Безопасность</h1>
              <p className="text-sm text-muted-foreground">
                Правила безопасности и журнал событий
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Status */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="size-5 text-emerald-500" />
                    <span className="text-sm font-medium">
                      Активных правил: {enabledCount} из {rules.length}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      enabledCount === rules.length
                        ? 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400'
                        : ''
                    }
                  >
                    {enabledCount === rules.length ? 'Все правила активны' : 'Есть отключённые'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rules List */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldAlert className="size-4" />
                  Правила безопасности
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {rules.map((rule) => {
                    const severity = severityConfig[rule.severity] ?? severityConfig.medium;
                    const action = actionConfig[rule.action] ?? actionConfig.log;
                    const ActionIcon = action.icon;
                    return (
                      <div
                        key={rule.id}
                        className={`rounded-lg border p-4 transition-colors ${
                          rule.enabled ? '' : 'opacity-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-medium">{rule.name}</h3>
                              <Badge className={severity.color}>
                                {severity.label}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {categoryLabels[rule.category] ?? rule.category}
                              </Badge>
                              <Badge variant="secondary" className="gap-1 text-[10px]">
                                <ActionIcon className={`size-3 ${action.color}`} />
                                {action.label}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {rule.description}
                            </p>
                            {rule.pattern && (
                              <div className="mt-2 rounded bg-muted px-2 py-1">
                                <code className="text-[10px] text-muted-foreground">{rule.pattern}</code>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={() => toggleRule(rule.id)}
                              aria-label={`Включить правило ${rule.name}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator />

          {/* Security Log */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-4" />
                  Журнал безопасности
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Время</TableHead>
                      <TableHead>Правило</TableHead>
                      <TableHead>Действие</TableHead>
                      <TableHead className="hidden sm:table-cell">Детали</TableHead>
                      <TableHead className="w-[100px]">Критичность</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSecurityLog.map((entry, i) => {
                      const severity = severityConfig[entry.severity] ?? severityConfig.medium;
                      return (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {entry.timestamp}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {entry.rule}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {entry.action === 'blocked'
                                ? 'Заблокировано'
                                : entry.action === 'sanitized'
                                  ? 'Санитизировано'
                                  : entry.action === 'warned'
                                    ? 'Предупреждение'
                                    : entry.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-muted-foreground max-w-[300px] truncate">
                            {entry.details}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${severity.color}`}>
                              {severity.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  );
}
