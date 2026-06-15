'use client';

import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  Search,
  Sun,
  Moon,
  Menu,
  Sparkles,
} from 'lucide-react';
import { useNavigationStore } from '@/store/navigation-store';
import { useProgressStore } from '@/store/progress-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { AppBreadcrumbs } from './Breadcrumbs';
import { ModelSelector } from '@/components/settings/ModelSelector';
import { useIsMobile } from '@/hooks/use-mobile';

export function Header() {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const toggleSidebar = useNavigationStore((s) => s.actions.toggleSidebar);
  const level = useProgressStore((s) => s.level);
  const totalXP = useProgressStore((s) => s.totalXP);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 sm:gap-3 sm:px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Кнопка меню для мобильных */}
      {isMobile && (
        <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={toggleSidebar}>
          <Menu className="size-4" />
        </Button>
      )}

      {/* Хлебные крошки */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <AppBreadcrumbs />
      </div>

      {/* Поиск — скрыт на мобильных */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex size-9 shrink-0">
            <Search className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Поиск</TooltipContent>
      </Tooltip>

      {/* Селектор модели — скрыт на мобильных */}
      <div className="hidden sm:block shrink-0">
        <ModelSelector />
      </div>

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
