import { create } from 'zustand';
import type { Skill, SkillCategory, SkillLevel } from '@/types';

interface SkillActions {
  loadSkills: (data: Skill[]) => void;
  selectSkill: (slug: string) => void;
  setSearch: (query: string) => void;
  setFilter: (filters: { category?: SkillCategory | null; level?: SkillLevel | null }) => void;
  getFilteredSkills: () => Skill[];
}

interface SkillStoreState {
  skills: Skill[];
  currentSkill: Skill | null;
  searchQuery: string;
  filterCategory: SkillCategory | null;
  filterLevel: SkillLevel | null;
  actions: SkillActions;
}

export const useSkillStore = create<SkillStoreState>()((set, get) => ({
  skills: [],
  currentSkill: null,
  searchQuery: '',
  filterCategory: null,
  filterLevel: null,

  actions: {
    loadSkills: (data) => set({ skills: data }),

    selectSkill: (slug) => {
      const { skills } = get();
      const skill = skills.find((s) => s.slug === slug) ?? null;
      set({ currentSkill: skill });
    },

    setSearch: (query) => set({ searchQuery: query }),

    setFilter: ({ category, level }) => {
      set((state) => ({
        filterCategory: category !== undefined ? category : state.filterCategory,
        filterLevel: level !== undefined ? level : state.filterLevel,
      }));
    },

    getFilteredSkills: () => {
      const { skills, searchQuery, filterCategory, filterLevel } = get();

      return skills.filter((skill) => {
        // Фильтр по категории
        if (filterCategory && skill.category !== filterCategory) {
          return false;
        }

        // Фильтр по уровню
        if (filterLevel && skill.level !== filterLevel) {
          return false;
        }

        // Поиск по названию, описанию и тегам
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesName = skill.name.toLowerCase().includes(query);
          const matchesDescription = skill.description.toLowerCase().includes(query);
          const matchesTags = skill.tags.some((tag) => tag.toLowerCase().includes(query));
          const matchesSlug = skill.slug.toLowerCase().includes(query);

          if (!matchesName && !matchesDescription && !matchesTags && !matchesSlug) {
            return false;
          }
        }

        return true;
      });
    },
  },
}));

// Селекторы
export const useSkills = () => useSkillStore((s) => s.skills);
export const useCurrentSkill = () => useSkillStore((s) => s.currentSkill);
export const useSkillSearchQuery = () => useSkillStore((s) => s.searchQuery);
export const useSkillFilterCategory = () => useSkillStore((s) => s.filterCategory);
export const useSkillFilterLevel = () => useSkillStore((s) => s.filterLevel);
export const useSkillActions = () => useSkillStore((s) => s.actions);

// Мемоизированный селектор для отфильтрованных навыков
// Используется в компонентах, где нужна производительность
export const useFilteredSkills = () =>
  useSkillStore((s) =>
    s.skills.filter((skill) => {
      if (s.filterCategory && skill.category !== s.filterCategory) return false;
      if (s.filterLevel && skill.level !== s.filterLevel) return false;
      if (s.searchQuery.trim()) {
        const query = s.searchQuery.toLowerCase().trim();
        const matches =
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          skill.slug.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    }),
  );
