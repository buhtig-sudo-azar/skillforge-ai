import { create } from 'zustand';

// Ключи для localStorage
const STORAGE_API_TOKEN = 'ai-platform-api-token';
const STORAGE_RATE_LIMITS = 'ai-platform-rate-limits';

// Время жизни записи о лимите: 10 минут
const RATE_LIMIT_TTL_MS = 10 * 60 * 1000;

interface RateLimitEntry {
  limited: boolean;
  until: number; // timestamp ms
}

interface ModelActions {
  setModel: (model: string) => void;
  setApiToken: (token: string | null) => void;
  fetchFreeModels: () => Promise<void>;
  checkRateLimit: (modelSlug: string) => Promise<void>;
  isRateLimited: (modelSlug: string) => boolean;
}

interface ModelStoreState {
  selectedModel: string;
  apiToken: string | null;
  freeModels: string[];
  rateLimits: Record<string, RateLimitEntry>;
  isLoading: boolean;
  actions: ModelActions;
}

// Вспомогательные функции для localStorage
function loadRateLimits(): Record<string, RateLimitEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_RATE_LIMITS);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, RateLimitEntry>;
    // Удаляем устаревшие записи
    const now = Date.now();
    const cleaned: Record<string, RateLimitEntry> = {};
    for (const [key, entry] of Object.entries(parsed)) {
      if (entry.until > now) {
        cleaned[key] = entry;
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

function saveRateLimits(limits: Record<string, RateLimitEntry>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_RATE_LIMITS, JSON.stringify(limits));
  } catch {
    // Игнорируем ошибки записи в localStorage
  }
}

function loadApiToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_API_TOKEN);
  } catch {
    return null;
  }
}

function saveApiToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(STORAGE_API_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_API_TOKEN);
    }
  } catch {
    // Игнорируем ошибки записи
  }
}

export const useModelStore = create<ModelStoreState>()((set, get) => ({
  selectedModel: 'auto',
  apiToken: loadApiToken(),
  freeModels: [],
  rateLimits: loadRateLimits(),
  isLoading: false,

  actions: {
    setModel: (model) => set({ selectedModel: model }),

    setApiToken: (token) => {
      saveApiToken(token);
      set({ apiToken: token });
    },

    fetchFreeModels: async () => {
      set({ isLoading: true });
      try {
        const response = await fetch('/api/models/free');
        if (!response.ok) {
          throw new Error('Не удалось загрузить список бесплатных моделей');
        }
        const data = await response.json();
        const models: string[] = Array.isArray(data)
          ? data.map((m: { slug?: string; modelId?: string; id?: string } | string) =>
              typeof m === 'string' ? m : m.slug ?? m.modelId ?? m.id ?? '',
            ).filter(Boolean)
          : [];
        set({ freeModels: models });
      } catch {
        // При ошибке оставляем пустой список бесплатных моделей
        set({ freeModels: [] });
      } finally {
        set({ isLoading: false });
      }
    },

    checkRateLimit: async (modelSlug) => {
      try {
        const { apiToken } = get();
        const response = await fetch(`/api/models/rate-limit?model=${encodeURIComponent(modelSlug)}`, {
          headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        });

        if (!response.ok) return;

        const data = await response.json();
        const now = Date.now();

        set((state) => {
          const updated = { ...state.rateLimits };
          if (data.limited) {
            // Записываем лимит с TTL 10 минут
            updated[modelSlug] = {
              limited: true,
              until: data.until ?? now + RATE_LIMIT_TTL_MS,
            };
          } else {
            // Если лимита нет — убираем запись
            delete updated[modelSlug];
          }
          saveRateLimits(updated);
          return { rateLimits: updated };
        });
      } catch {
        // Тихо игнорируем ошибку проверки лимита
      }
    },

    isRateLimited: (modelSlug) => {
      const { rateLimits } = get();
      const entry = rateLimits[modelSlug];
      if (!entry) return false;
      // Проверяем, не истёк ли лимит
      if (Date.now() >= entry.until) {
        // Устаревшая запись — удаляем
        set((state) => {
          const updated = { ...state.rateLimits };
          delete updated[modelSlug];
          saveRateLimits(updated);
          return { rateLimits: updated };
        });
        return false;
      }
      return entry.limited;
    },
  },
}));

// Селекторы
export const useSelectedModel = () => useModelStore((s) => s.selectedModel);
export const useApiToken = () => useModelStore((s) => s.apiToken);
export const useFreeModels = () => useModelStore((s) => s.freeModels);
export const useRateLimits = () => useModelStore((s) => s.rateLimits);
export const useModelIsLoading = () => useModelStore((s) => s.isLoading);
export const useModelActions = () => useModelStore((s) => s.actions);
