'use client';

import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  Search,
  Sun,
  Moon,
  Menu,
  Sparkles,
  Cpu,
} from 'lucide-react';
import { useNavigationStore } from '@/store/navigation-store';
import { useModelStore } from '@/store/model-store';
import { useProgressStore } from '@/store/progress-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { AppBreadcrumbs } from './Breadcrumbs';
import { useIsMobile } from '@/hooks/use-mobile';

const availableModels = [
  { slug: 'auto', name: 'Авто', description: 'Автоматический выбор модели' },
  { slug: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Быстрая и экономичная' },
  { slug: 'gpt-4o', name: 'GPT-4o', description: 'Мощная модель OpenAI' },
  { slug: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Модель Anthropic' },
  { slug: 'llama-3.1-70b', name: 'Llama 3.1 70B', description: 'Открытая модель Meta' },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const toggleSidebar = useNavigationStore((s) => s.actions.toggleSidebar);
  const selectedModel = useModelStore((s) => s.selectedModel);
  const setModel = useModelStore((s) => s.actions.setModel);
  const level = useProgressStore((s) => s.level);
  const totalXP = useProgressStore((s) => s.totalXP);

  const currentModelName = availableModels.find((m) => m.slug === selectedModel)?.name ?? selectedModel;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Кнопка меню для мобильных */}
      {isMobile && (
        <Button variant="ghost" size="icon" className="size-9" onClick={toggleSidebar}>
          <Menu className="size-4" />
        </Button>
      )}

      {/* Хлебные крошки */}
      <div className="flex-1 min-w-0">
        <AppBreadcrumbs />
      </div>

      {/* Поиск */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9 shrink-0">
            <Search className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Поиск</TooltipContent>
      </Tooltip>

      {/* Селектор модели */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="hidden gap-2 sm:flex">
            <Cpu className="size-3.5" />
            <span className="max-w-[100px] truncate">{currentModelName}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Выберите модель</div>
          <div className="flex flex-col gap-1">
            {availableModels.map((model) => (
              <Button
                key={model.slug}
                variant={selectedModel === model.slug ? 'secondary' : 'ghost'}
                size="sm"
                className="justify-start gap-2"
                onClick={() => setModel(model.slug)}
              >
                <Cpu className="size-3.5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm">{model.name}</span>
                  <span className="text-[10px] text-muted-foreground">{model.description}</span>
                </div>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="hidden h-6 sm:block" />

      {/* XP / Уровень */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="hidden gap-1 sm:flex">
            <Sparkles className="size-3" />
            Ур. {level}
            <span className="text-muted-foreground">· {totalXP} XP</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          Уровень {level} · {totalXP} XP
        </TooltipContent>
      </Tooltip>

      {/* Переключатель темы */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </TooltipContent>
      </Tooltip>
    </header>
  );
}
