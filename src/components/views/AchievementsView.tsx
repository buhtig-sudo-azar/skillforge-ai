'use client';

import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Flame,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { useProgressStore } from '@/store/progress-store';
import { mockAchievements } from '@/data/view-data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const categoryLabels: Record<string, string> = {
  skills: 'Навыки',
  agents: 'Агенты',
  sandbox: 'Песочница',
  workflows: 'Воркфлоу',
  mcp: 'MCP',
  rag: 'RAG',
  streak: 'Серия',
  general: 'Общие',
  security: 'Безопасность',
};

export function AchievementsView() {
  const totalXP = useProgressStore((s) => s.totalXP);
  const level = useProgressStore((s) => s.level);
  const streak = useProgressStore((s) => s.streak);
  const earnedSlugs = useProgressStore((s) => s.achievements);

  const nextLevelXP = ((level) * (level)) * 100;
  const currentLevelXP = ((level - 1) * (level - 1)) * 100;
  const progressInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercent = xpNeeded > 0 ? Math.min((progressInLevel / xpNeeded) * 100, 100) : 0;

  const earnedCount = mockAchievements.filter((a) => a.earned || earnedSlugs.includes(a.slug)).length;
  const totalXPFromAchievements = mockAchievements
    .filter((a) => a.earned || earnedSlugs.includes(a.slug))
    .reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 text-white">
              <Trophy className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Достижения</h1>
              <p className="text-sm text-muted-foreground">
                Ваш прогресс и награды в AI Engineering
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-1.5">
                <Star className="size-4 text-amber-500" />
                <span className="text-2xl font-bold">{totalXP}</span>
              </div>
              <div className="text-xs text-muted-foreground">Опыт (XP)</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-1.5">
                <Zap className="size-4 text-primary" />
                <span className="text-2xl font-bold">{level}</span>
              </div>
              <div className="text-xs text-muted-foreground">Уровень</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-1.5">
                <Flame className="size-4 text-orange-500" />
                <span className="text-2xl font-bold">{streak}</span>
              </div>
              <div className="text-xs text-muted-foreground">Серия дней</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-1.5">
                <Trophy className="size-4 text-emerald-500" />
                <span className="text-2xl font-bold">{earnedCount}/{mockAchievements.length}</span>
              </div>
              <div className="text-xs text-muted-foreground">Достижения</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Прогресс до уровня {level + 1}</span>
                <span className="font-medium">{progressInLevel} / {xpNeeded} XP</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="mb-6" />

        {/* Achievement Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {mockAchievements.map((achievement) => {
            const isEarned = achievement.earned || earnedSlugs.includes(achievement.slug);
            return (
              <motion.div key={achievement.id} variants={itemVariants}>
                <Card
                  className={`transition-all ${
                    isEarned
                      ? 'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-900/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'opacity-60'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 items-center justify-center rounded-lg text-xl ${
                          isEarned
                            ? 'bg-amber-100 dark:bg-amber-900/30'
                            : 'bg-muted'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <CardTitle className="text-sm">{achievement.title}</CardTitle>
                          <Badge
                            variant="outline"
                            className="mt-0.5 text-[10px]"
                          >
                            {categoryLabels[achievement.category] ?? achievement.category}
                          </Badge>
                        </div>
                      </div>
                      {isEarned && (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                          ✓ Получено
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="size-3 text-amber-500" />
                        <span className="font-medium">{achievement.xpReward} XP</span>
                      </div>
                      {isEarned && achievement.earnedAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {achievement.earnedAt.toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {totalXPFromAchievements > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-muted-foreground pb-8"
          >
            Получено {totalXPFromAchievements} XP за достижения
          </motion.div>
        )}
    </div>
  );
}
