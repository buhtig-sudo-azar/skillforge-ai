'use client';

import { motion } from 'framer-motion';
import { Sparkles, Wrench, Bot, MessageSquare, FlaskConical, Workflow, Plug, BookOpen } from 'lucide-react';
import { useNavigationStore } from '@/store/navigation-store';
import { useProgressStore } from '@/store/progress-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const categories = [
  { slug: 'skills', label: 'Навыки', description: 'Промпт-инжиниринг, инструменты, архитектура', icon: Wrench, gradient: 'from-amber-500 to-orange-600' },
  { slug: 'agents', label: 'Агенты', description: 'ReAct, мультиагенты, планирование', icon: Bot, gradient: 'from-emerald-500 to-teal-600' },
  { slug: 'chatbots', label: 'Чат-боты', description: 'Системные промпты, RAG-чат, персоны', icon: MessageSquare, gradient: 'from-cyan-500 to-blue-600' },
  { slug: 'sandboxes', label: 'Песочницы', description: 'Интерактивные среды для экспериментов', icon: FlaskConical, gradient: 'from-violet-500 to-purple-600' },
  { slug: 'workflows', label: 'Воркфлоу', description: 'Триггеры, условия, пайплайны', icon: Workflow, gradient: 'from-rose-500 to-pink-600' },
  { slug: 'mcp', label: 'MCP', description: 'Серверы, инструменты, интеграции', icon: Plug, gradient: 'from-sky-500 to-indigo-600' },
  { slug: 'rag', label: 'RAG', description: 'Базы знаний, чанки, эмбеддинги', icon: BookOpen, gradient: 'from-lime-500 to-green-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function HomeView() {
  const navigate = useNavigationStore((s) => s.actions.navigate);
  const level = useProgressStore((s) => s.level);
  const totalXP = useProgressStore((s) => s.totalXP);
  const streak = useProgressStore((s) => s.streak);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Герой-секция */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          AI Engineering Platform
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Добро пожаловать в <span className="text-primary">AI Skills Lab</span>
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Платформа для изучения AI Engineering. Осваивайте навыки промпт-инжиниринга,
          создавайте агентов, настраивайте RAG и MCP — всё через интерактивные уроки и песочницы.
        </p>
      </motion.div>

      {/* Карточки статистики */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <Card className="text-center">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{level}</div>
            <div className="text-xs text-muted-foreground">Уровень</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{totalXP}</div>
            <div className="text-xs text-muted-foreground">Опыт (XP)</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs text-muted-foreground">Серия дней</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">7</div>
            <div className="text-xs text-muted-foreground">Категорий</div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator className="mb-8" />

      {/* Сетка категорий */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.div key={cat.slug} variants={itemVariants}>
              <Card
                className="group cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => navigate('category', cat.slug)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${cat.gradient} text-white`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{cat.label}</CardTitle>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Быстрые действия */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex flex-wrap items-center gap-3"
      >
        <span className="text-sm font-medium text-muted-foreground">Быстрый старт:</span>
        <Button variant="outline" size="sm" onClick={() => navigate('category', 'skills')}>
          <Wrench className="mr-2 size-3.5" />
          Навыки
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('category', 'agents')}>
          <Bot className="mr-2 size-3.5" />
          Агенты
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('sandbox')}>
          <FlaskConical className="mr-2 size-3.5" />
          Песочница
        </Button>
      </motion.div>
    </div>
  );
}
