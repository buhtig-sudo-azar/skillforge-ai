'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationStore } from '@/store/navigation-store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  HomeView,
  CategoryView,
  TopicView,
  SkillView,
  SandboxView,
  AgentBuilderView,
  WorkflowBuilderView,
  MCPManagerView,
  RAGManagerView,
  ModelsView,
  AchievementsView,
  AdminView,
  SecurityView,
  PlaceholderView,
} from '@/components/views';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { ViewType } from '@/types';

/** Роутер видов — отображает текущий вид на основе navigation store */
function ViewRouter() {
  const currentView = useNavigationStore((s) => s.currentView);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'category':
        return <CategoryView />;
      case 'topic':
        return <TopicView />;
      case 'skill':
        return <SkillView />;
      case 'sandbox':
        return <SandboxView />;
      case 'agent-builder':
        return <AgentBuilderView />;
      case 'workflow-builder':
        return <WorkflowBuilderView />;
      case 'mcp-manager':
        return <MCPManagerView />;
      case 'rag-manager':
        return <RAGManagerView />;
      case 'models':
        return <ModelsView />;
      case 'security':
        return <SecurityView />;
      case 'admin':
        return <AdminView />;
      case 'achievements':
        return <AchievementsView />;
      default:
        return (
          <PlaceholderView
            title={currentView}
          />
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="flex-1"
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
}

export function AppShell() {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <Header />
          <div className="flex-1 overflow-auto">
            <ViewRouter />
          </div>
          <Footer />
        </main>
      </div>
    </TooltipProvider>
  );
}
