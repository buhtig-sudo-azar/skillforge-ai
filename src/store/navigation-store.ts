import { create } from 'zustand';
import type { ViewType } from '@/types';

// Определяем ширину мобильного устройства для сайдбара
const isMobile = () =>
  typeof window !== 'undefined' && window.innerWidth < 768;

interface NavigationActions {
  navigate: (
    view: ViewType,
    category?: string | null,
    subtopic?: string | null,
    skill?: string | null,
    sandbox?: string | null,
  ) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

interface NavigationStoreState {
  currentView: ViewType;
  currentCategory: string | null;
  currentSubtopic: string | null;
  currentSkill: string | null;
  currentSandbox: string | null;
  sidebarOpen: boolean;
  actions: NavigationActions;
}

export const useNavigationStore = create<NavigationStoreState>()((set) => ({
  currentView: 'home',
  currentCategory: null,
  currentSubtopic: null,
  currentSkill: null,
  currentSandbox: null,
  sidebarOpen: !isMobile(),

  actions: {
    navigate: (view, category = null, subtopic = null, skill = null, sandbox = null) =>
      set({
        currentView: view,
        currentCategory: category,
        currentSubtopic: subtopic,
        currentSkill: skill,
        currentSandbox: sandbox,
      }),

    toggleSidebar: () =>
      set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
  },
}));

// Селекторы для удобного доступа к состоянию
export const useCurrentView = () => useNavigationStore((s) => s.currentView);
export const useCurrentCategory = () => useNavigationStore((s) => s.currentCategory);
export const useCurrentSubtopic = () => useNavigationStore((s) => s.currentSubtopic);
export const useCurrentSkill = () => useNavigationStore((s) => s.currentSkill);
export const useCurrentSandbox = () => useNavigationStore((s) => s.currentSandbox);
export const useSidebarOpen = () => useNavigationStore((s) => s.sidebarOpen);
export const useNavigationActions = () => useNavigationStore((s) => s.actions);
