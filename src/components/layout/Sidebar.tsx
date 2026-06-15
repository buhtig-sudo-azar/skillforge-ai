'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Wrench,
  Bot,
  MessageSquare,
  FlaskConical,
  Workflow,
  Plug,
  BookOpen,
  Trophy,
  Zap,
  Shield,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useNavigationStore } from '@/store/navigation-store';
import { useProgressStore } from '@/store/progress-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { topics } from '@/data/topics';
import type { ViewType } from '@/types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  view?: ViewType;
  category?: string;
}

/** Основные навигационные пункты */
const mainNavItems: NavItem[] = [
  { id: 'home', label: 'Главная', icon: Home, view: 'home' },
  { id: 'skills', label: 'Навыки', icon: Wrench, category: 'skills' },
  { id: 'agents', label: 'Агенты', icon: Bot, category: 'agents' },
  { id: 'chatbots', label: 'Чат-боты', icon: MessageSquare, category: 'chatbots' },
  { id: 'sandboxes', label: 'Песочницы', icon: FlaskConical, category: 'sandboxes' },
  { id: 'workflows', label: 'Воркфлоу', icon: Workflow, category: 'workflows' },
  { id: 'mcp', label: 'MCP', icon: Plug, category: 'mcp' },
  { id: 'rag', label: 'RAG', icon: BookOpen, category: 'rag' },
];

/** Нижние навигационные пункты */
const bottomNavItems: NavItem[] = [
  { id: 'achievements', label: 'Достижения', icon: Trophy, view: 'achievements' },
  { id: 'models', label: 'Модели', icon: Zap, view: 'models' },
  { id: 'security', label: 'Безопасность', icon: Shield, view: 'security' },
  { id: 'admin', label: 'Админ', icon: Settings, view: 'admin' },
];

export function Sidebar() {
  const isMobile = useIsMobile();
  const sidebarOpen = useNavigationStore((s) => s.sidebarOpen);
  const toggleSidebar = useNavigationStore((s) => s.actions.toggleSidebar);
  const setSidebarOpen = useNavigationStore((s) => s.actions.setSidebarOpen);
  const navigate = useNavigationStore((s) => s.actions.navigate);
  const currentView = useNavigationStore((s) => s.currentView);
  const currentCategory = useNavigationStore((s) => s.currentCategory);

  const level = useProgressStore((s) => s.level);
  const totalXP = useProgressStore((s) => s.totalXP);

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const collapsed = !sidebarOpen;

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavClick = (item: NavItem) => {
    if (item.view) {
      navigate(item.view);
    } else if (item.category) {
      navigate('category', item.category);
    }
    // На мобильных закрываем сайдбар после навигации
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const isActive = (item: NavItem): boolean => {
    if (item.view && currentView === item.view && !currentCategory) return true;
    if (item.category && currentCategory === item.category) return true;
    return false;
  };

  // Подкатегории загружаются из реальных данных topics.ts
  const subtopicMap: Record<string, { slug: string; title: string }[]> = {};
  for (const topic of topics) {
    subtopicMap[topic.slug] = topic.subtopics.map((st) => ({
      slug: st.slug,
      title: st.title,
    }));
  }

  const sidebarWidth = collapsed ? 'w-16' : 'w-64';

  return (
    <>
      {/* Overlay для мобильных устройств */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Сайдбар */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'relative z-50 flex flex-col border-r bg-sidebar text-sidebar-foreground',
          isMobile && sidebarOpen && 'fixed inset-y-0 left-0 shadow-xl',
          isMobile && !sidebarOpen && 'hidden',
        )}
      >
        {/* Логотип и кнопка сворачивания */}
        <div className={cn(
          'flex h-14 items-center border-b px-3',
          collapsed ? 'justify-center' : 'justify-between',
        )}>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-sm font-bold tracking-tight">AI Skills Lab</span>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
          )}

          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={toggleSidebar}
                >
                  {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {collapsed ? 'Развернуть' : 'Свернуть'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Навигационные пункты */}
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 p-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              const hasSubtopics = item.category && subtopicMap[item.category];
              const isExpanded = expandedCategories[item.id];

              return (
                <div key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={active ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3 h-9 px-3',
                          collapsed && 'justify-center px-0',
                          active && 'font-medium',
                        )}
                        onClick={() => {
                          handleNavClick(item);
                          if (hasSubtopics && !collapsed) {
                            toggleCategory(item.id);
                          }
                        }}
                      >
                        <Icon className="size-4 shrink-0" />
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 text-left text-sm"
                          >
                            {item.label}
                          </motion.span>
                        )}
                        {!collapsed && hasSubtopics && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="size-3.5 text-muted-foreground" />
                          </motion.div>
                        )}
                      </Button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    )}
                  </Tooltip>

                  {/* Подкатегории */}
                  <AnimatePresence>
                    {!collapsed && hasSubtopics && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-5 flex flex-col gap-0.5 border-l pl-2 py-1">
                          {subtopicMap[item.category!]?.map((sub) => (
                            <Button
                              key={sub.slug}
                              variant="ghost"
                              size="sm"
                              className="h-7 justify-start px-2 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                navigate('topic', item.category, sub.slug);
                                if (isMobile) setSidebarOpen(false);
                              }}
                            >
                              {sub.title}
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          <Separator className="mx-2" />

          {/* Нижние пункты */}
          <nav className="flex flex-col gap-1 p-2">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={active ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3 h-9 px-3',
                        collapsed && 'justify-center px-0',
                        active && 'font-medium',
                      )}
                      onClick={() => handleNavClick(item)}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Футер сайдбара — XP / Уровень */}
        <div className={cn(
          'border-t p-3',
          collapsed && 'flex justify-center p-2',
        )}>
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="size-3" />
                Ур. {level}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {totalXP} XP
              </span>
            </motion.div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="gap-1">
                  {level}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="right">
                Уровень {level} · {totalXP} XP
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.aside>
    </>
  );
}
