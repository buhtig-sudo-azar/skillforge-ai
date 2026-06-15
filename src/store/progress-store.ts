import { create } from 'zustand';

// Ключ для хранения прогресса в localStorage
const STORAGE_KEY = 'ai-platform-progress';

// XP-пороги для уровней: level = floor(sqrt(totalXP / 100)) + 1
function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

interface ProgressActions {
  addXP: (amount: number) => void;
  completeTopic: (slug: string) => void;
  completeSkill: (slug: string) => void;
  earnAchievement: (slug: string) => void;
  calculateLevel: () => number;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

interface ProgressStoreState {
  totalXP: number;
  level: number;
  streak: number;
  longestStreak: number;
  completedTopics: string[];
  completedSkills: string[];
  achievements: string[];
  actions: ProgressActions;
}

function loadFromLocalStorage(): Partial<ProgressStoreState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<ProgressStoreState>;
  } catch {
    return {};
  }
}

function persistToStorage(state: ProgressStoreState): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave = {
      totalXP: state.totalXP,
      level: state.level,
      streak: state.streak,
      longestStreak: state.longestStreak,
      completedTopics: state.completedTopics,
      completedSkills: state.completedSkills,
      achievements: state.achievements,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Игнорируем ошибки записи
  }
}

export const useProgressStore = create<ProgressStoreState>()((set, get) => ({
  totalXP: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  completedTopics: [],
  completedSkills: [],
  achievements: [],

  actions: {
    addXP: (amount) => {
      set((state) => {
        const totalXP = state.totalXP + amount;
        const level = calculateLevel(totalXP);
        const newState = { totalXP, level };
        persistToStorage({ ...state, ...newState });
        return newState;
      });
    },

    completeTopic: (slug) => {
      set((state) => {
        if (state.completedTopics.includes(slug)) return state;
        const completedTopics = [...state.completedTopics, slug];
        // Начисляем XP за прохождение темы
        const totalXP = state.totalXP + 50;
        const level = calculateLevel(totalXP);
        const newState = { completedTopics, totalXP, level };
        persistToStorage({ ...state, ...newState });
        return newState;
      });
    },

    completeSkill: (slug) => {
      set((state) => {
        if (state.completedSkills.includes(slug)) return state;
        const completedSkills = [...state.completedSkills, slug];
        // Начисляем XP за освоение навыка
        const totalXP = state.totalXP + 30;
        const level = calculateLevel(totalXP);
        const newState = { completedSkills, totalXP, level };
        persistToStorage({ ...state, ...newState });
        return newState;
      });
    },

    earnAchievement: (slug) => {
      set((state) => {
        if (state.achievements.includes(slug)) return state;
        const achievements = [...state.achievements, slug];
        // Бонус XP за достижение
        const totalXP = state.totalXP + 100;
        const level = calculateLevel(totalXP);
        const newState = { achievements, totalXP, level };
        persistToStorage({ ...state, ...newState });
        return newState;
      });
    },

    calculateLevel: () => {
      const { totalXP } = get();
      return calculateLevel(totalXP);
    },

    loadFromStorage: () => {
      const saved = loadFromLocalStorage();
      if (Object.keys(saved).length > 0) {
        set({
          totalXP: saved.totalXP ?? 0,
          level: saved.level ?? 1,
          streak: saved.streak ?? 0,
          longestStreak: saved.longestStreak ?? 0,
          completedTopics: saved.completedTopics ?? [],
          completedSkills: saved.completedSkills ?? [],
          achievements: saved.achievements ?? [],
        });
      }
    },

    saveToStorage: () => {
      persistToStorage(get());
    },
  },
}));

// Селекторы
export const useTotalXP = () => useProgressStore((s) => s.totalXP);
export const useLevel = () => useProgressStore((s) => s.level);
export const useStreak = () => useProgressStore((s) => s.streak);
export const useLongestStreak = () => useProgressStore((s) => s.longestStreak);
export const useCompletedTopics = () => useProgressStore((s) => s.completedTopics);
export const useCompletedSkills = () => useProgressStore((s) => s.completedSkills);
export const useAchievements = () => useProgressStore((s) => s.achievements);
export const useProgressActions = () => useProgressStore((s) => s.actions);
