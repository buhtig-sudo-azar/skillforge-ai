'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Wrench,
  Activity,
  MessageSquare,
  Clock,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { mockAdminStats, mockRecentActivity, mockSystemConfig } from '@/data/view-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const activityTypeConfig: Record<string, { icon: typeof BookOpen; color: string }> = {
  skill: { icon: Wrench, color: 'text-amber-500' },
  sandbox: { icon: Activity, color: 'text-emerald-500' },
  agent: { icon: ShieldCheck, color: 'text-blue-500' },
  topic: { icon: BookOpen, color: 'text-violet-500' },
  achievement: { icon: ShieldCheck, color: 'text-amber-500' },
  rag: { icon: BookOpen, color: 'text-cyan-500' },
};

export function AdminView() {
  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-white">
              <Settings className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Администрирование</h1>
              <p className="text-sm text-muted-foreground">
                Статистика и управление платформой
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
          {/* Stats Cards */}
          <motion.div variants={sectionVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Users className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{mockAdminStats.totalUsers.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Всего пользователей</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Wrench className="size-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{mockAdminStats.totalSkills}</div>
                    <div className="text-xs text-muted-foreground">Всего навыков</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <BookOpen className="size-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{mockAdminStats.totalTopics}</div>
                    <div className="text-xs text-muted-foreground">Всего тем</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Activity className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{mockAdminStats.totalSandboxRuns.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Запусков песочницы</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                    <MessageSquare className="size-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{mockAdminStats.totalChatSessions.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Чат-сессий</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                    <Clock className="size-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{mockAdminStats.activeUsersToday}</div>
                    <div className="text-xs text-muted-foreground">Активных сегодня</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator />

          {/* Recent Activity */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-4" />
                  Последняя активность
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {mockRecentActivity.map((activity, i) => {
                    const config = activityTypeConfig[activity.type] ?? activityTypeConfig.skill;
                    const ActivityIcon = config.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className={`flex size-8 items-center justify-center rounded-md bg-muted ${config.color}`}>
                          <ActivityIcon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <span className="font-medium">{activity.user}</span>{' '}
                            <span className="text-muted-foreground">{activity.action}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {activity.time}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Config */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="size-4" />
                  Конфигурация системы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
                      <TableHead>Значение</TableHead>
                      <TableHead className="hidden sm:table-cell">Описание</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSystemConfig.map((config) => (
                      <TableRow key={config.key}>
                        <TableCell className="font-mono text-xs">{config.key}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {config.value}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {config.description}
                        </TableCell>
                      </TableRow>
                    ))}
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
