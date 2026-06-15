'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
} from 'lucide-react';
import { useNavigationStore } from '@/store/navigation-store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { topics, categoryGradients } from '@/data/topics';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function CategoryView() {
  const currentCategory = useNavigationStore((s) => s.currentCategory);
  const navigate = useNavigationStore((s) => s.actions.navigate);

  const topic = currentCategory
    ? topics.find((t) => t.slug === currentCategory)
    : null;

  if (!topic) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Категория не найдена</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('home')}>
            На главную
          </Button>
        </div>
      </div>
    );
  }

  const gradient = topic.gradient ?? categoryGradients[topic.slug] ?? 'from-gray-500 to-gray-600';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Заголовок категории */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 gap-1 text-muted-foreground"
          onClick={() => navigate('home')}
        >
          <ArrowLeft className="size-3.5" />
          Назад
        </Button>

        <div className="mb-6 flex items-center gap-4">
          <div className={`flex size-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            <span className="text-2xl">{topic.icon ?? '📁'}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{topic.title}</h1>
            <p className="text-sm text-muted-foreground">{topic.description}</p>
          </div>
        </div>
      </motion.div>

      <Separator className="mb-6" />

      {/* Список подтем */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {topic.subtopics.map((subtopic, index) => (
          <motion.div key={subtopic.slug} variants={itemVariants}>
            <Card
              className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20"
              onClick={() => navigate('topic', currentCategory, subtopic.slug)}
            >
              <CardHeader className="py-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                        {subtopic.title}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {subtopic.examples.length} примеров
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
