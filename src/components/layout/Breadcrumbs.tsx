'use client';

import { useNavigationStore } from '@/store/navigation-store';
import type { ViewType } from '@/types';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/** Отображение названий видов на русском */
const viewLabels: Record<ViewType, string> = {
  home: 'Главная',
  category: 'Категория',
  topic: 'Тема',
  skill: 'Навык',
  sandbox: 'Песочница',
  chat: 'Чат',
  'agent-builder': 'Конструктор агентов',
  'workflow-builder': 'Конструктор воркфлоу',
  'mcp-manager': 'MCP-менеджер',
  'rag-manager': 'RAG-менеджер',
  models: 'Модели',
  security: 'Безопасность',
  achievements: 'Достижения',
};

/** Отображение slug категории на русском */
const categoryLabels: Record<string, string> = {
  skills: 'Навыки',
  agents: 'Агенты',
  chatbots: 'Чат-боты',
  sandboxes: 'Песочницы',
  workflows: 'Воркфлоу',
  mcp: 'MCP',
  rag: 'RAG',
  models: 'Модели',
  security: 'Безопасность',
};

interface CrumbItem {
  label: string;
  onClick?: () => void;
}

export function AppBreadcrumbs() {
  const currentView = useNavigationStore((s) => s.currentView);
  const currentCategory = useNavigationStore((s) => s.currentCategory);
  const currentSubtopic = useNavigationStore((s) => s.currentSubtopic);
  const currentSkill = useNavigationStore((s) => s.currentSkill);
  const currentSandbox = useNavigationStore((s) => s.currentSandbox);
  const navigate = useNavigationStore((s) => s.actions.navigate);

  const crumbs: CrumbItem[] = [];

  // Главная — всегда первая крошка (если мы не на главной)
  if (currentView !== 'home') {
    crumbs.push({
      label: 'Главная',
      onClick: () => navigate('home'),
    });
  }

  // Категория
  if (currentCategory) {
    crumbs.push({
      label: categoryLabels[currentCategory] ?? currentCategory,
      onClick: () => navigate('category', currentCategory),
    });
  }

  // Подтема / Тема
  if (currentSubtopic) {
    crumbs.push({
      label: currentSubtopic,
      onClick: () => navigate('topic', currentCategory, currentSubtopic),
    });
  }

  // Навык
  if (currentSkill) {
    crumbs.push({
      label: currentSkill,
      onClick: () => navigate('skill', currentCategory, currentSubtopic, currentSkill),
    });
  }

  // Песочница
  if (currentSandbox) {
    crumbs.push({
      label: currentSandbox,
      onClick: () => navigate('sandbox', currentCategory, null, null, currentSandbox),
    });
  }

  // Для видов без категории, показываем просто название вида
  if (
    !currentCategory &&
    currentView !== 'home' &&
    !currentSubtopic &&
    !currentSkill &&
    !currentSandbox
  ) {
    crumbs.push({
      label: viewLabels[currentView],
    });
  }

  if (crumbs.length === 0) {
    // На главной — просто показываем «Главная»
    crumbs.push({ label: 'Главная' });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast || !crumb.onClick ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="cursor-pointer"
                    onClick={crumb.onClick}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
