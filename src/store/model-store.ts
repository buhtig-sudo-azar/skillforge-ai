import { create } from 'zustand';

// Ключи для localStorage
const STORAGE_MODEL = 'skillforge-ai-model';
const STORAGE_TOKEN = 'skillforge-ai-api-token';
const STORAGE_RATE_LIMITS = 'skillforge-ai-rate-limits';

// Время жизни записи о лимите: 10 минут
const RATE_LIMIT_TTL_MS = 10 * 60 * 1000;

const DEFAULT_MODEL = 'google/gemma-3-27b-it:free';

export interface ModelRateLimit {
  available: boolean;
  reason?: 'rate_limited' | 'not_found' | 'invalid_token' | 'insufficient_credits' | 'error' | null;
  remaining?: number | null;
  limit?: number | null;
  reset?: string | null;
  latency?: number | null;
  checkedAt?: number;
}

export interface FreeModel {
  id: string;
  name: string;
  label: string;
}

interface ModelState {
  currentModel: string;
  apiToken: string;
  availableModels: FreeModel[];
  isLoadingModels: boolean;
  modelsError: string | null;
  isApplying: boolean;
  isCheckingAll: boolean;
  rateLimits: Record<string, ModelRateLimit>;
  setCurrentModel: (model: string) => void;
  setApiToken: (token: string) => void;
  clearApiToken: () => void;
  fetchAvailableModels: () => Promise<void>;
  checkModel: (modelId: string) => Promise<ModelRateLimit>;
  checkAllModels: () => Promise<void>;
  markModelRateLimited: (modelId: string) => void;
  setIsApplying: (applying: boolean) => void;
  getModelForRequest: () => string;
  getTokenForRequest: () => string;
  getRateLimit: (modelId: string) => ModelRateLimit | undefined;
  _hydrate: () => void;
}

// ============================================================
// localStorage helpers
// ============================================================

function loadModelFromStorage(): string {
  if (typeof window === 'undefined') return DEFAULT_MODEL;
  try {
    const data = localStorage.getItem(STORAGE_MODEL);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.currentModel || DEFAULT_MODEL;
    }
  } catch {}
  return DEFAULT_MODEL;
}

function saveModelToStorage(model: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_MODEL, JSON.stringify({ currentModel: model }));
  } catch {}
}

function loadTokenFromStorage(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_TOKEN) || '';
  } catch {}
  return '';
}

function saveTokenToStorage(token: string) {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_TOKEN);
    }
  } catch {}
}

function loadRateLimitsFromStorage(): Record<string, ModelRateLimit> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_RATE_LIMITS);
    if (data) {
      const parsed = JSON.parse(data);
      const now = Date.now();
      const cleaned: Record<string, ModelRateLimit> = {};
      for (const [key, val] of Object.entries(parsed)) {
        const rl = val as ModelRateLimit;
        if (rl.checkedAt && now - rl.checkedAt < RATE_LIMIT_TTL_MS) {
          cleaned[key] = rl;
        }
      }
      return cleaned;
    }
  } catch {}
  return {};
}

function saveRateLimitsToStorage(limits: Record<string, ModelRateLimit>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_RATE_LIMITS, JSON.stringify(limits));
  } catch {}
}

// ============================================================
// Store
// ============================================================

export const useModelStore = create<ModelState>((set, get) => ({
  currentModel: DEFAULT_MODEL,
  apiToken: '',
  availableModels: [],
  isLoadingModels: false,
  modelsError: null,
  isApplying: false,
  isCheckingAll: false,
  rateLimits: {},

  setCurrentModel: (model) => {
    saveModelToStorage(model);
    set({ currentModel: model });
  },

  setApiToken: (token) => {
    saveTokenToStorage(token);
    set({ apiToken: token });
  },

  clearApiToken: () => {
    saveTokenToStorage('');
    set({ apiToken: '' });
  },

  fetchAvailableModels: async () => {
    if (get().isLoadingModels) return;
    // Позволяем принудительное обновление — не блокируем если уже есть данные

    set({ isLoadingModels: true, modelsError: null });

    try {
      const res = await fetch('/api/models');

      if (!res.ok) {
        throw new Error('Не удалось загрузить список моделей');
      }

      const data = await res.json();
      const models: FreeModel[] = data.models || [];

      set({ availableModels: models, isLoadingModels: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Ошибка загрузки моделей';
      set({ modelsError: msg, isLoadingModels: false });
    }
  },

  checkModel: async (modelId: string): Promise<ModelRateLimit> => {
    try {
      const body: Record<string, string> = { model: modelId };
      const token = get().apiToken;
      if (token) body.apiToken = token;

      const res = await fetch('/api/models/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const info: ModelRateLimit = {
          available: false,
          reason: 'error',
          checkedAt: Date.now(),
        };
        const updated = { ...get().rateLimits, [modelId]: info };
        saveRateLimitsToStorage(updated);
        set({ rateLimits: updated });
        return info;
      }

      const data = await res.json();
      const info: ModelRateLimit = {
        available: data.available,
        reason: data.reason || null,
        remaining: data.rateLimit?.remaining ?? null,
        limit: data.rateLimit?.limit ?? null,
        reset: data.rateLimit?.reset ?? null,
        latency: data.latency ?? null,
        checkedAt: Date.now(),
      };

      const updated = { ...get().rateLimits, [modelId]: info };
      saveRateLimitsToStorage(updated);
      set({ rateLimits: updated });
      return info;
    } catch {
      const info: ModelRateLimit = {
        available: false,
        reason: 'error',
        checkedAt: Date.now(),
      };
      const updated = { ...get().rateLimits, [modelId]: info };
      saveRateLimitsToStorage(updated);
      set({ rateLimits: updated });
      return info;
    }
  },

  checkAllModels: async () => {
    if (get().isCheckingAll) return;
    set({ isCheckingAll: true });

    const models = get().availableModels;
    for (const model of models) {
      await get().checkModel(model.id);
      await new Promise((r) => setTimeout(r, 200));
    }

    set({ isCheckingAll: false });
  },

  markModelRateLimited: (modelId: string) => {
    const info: ModelRateLimit = {
      available: false,
      reason: 'rate_limited',
      checkedAt: Date.now(),
    };
    const updated = { ...get().rateLimits, [modelId]: info };
    saveRateLimitsToStorage(updated);
    set({ rateLimits: updated });
  },

  setIsApplying: (applying) => set({ isApplying: applying }),

  getModelForRequest: () => get().currentModel,

  getTokenForRequest: () => get().apiToken,

  getRateLimit: (modelId: string) => get().rateLimits[modelId],

  _hydrate: () => {
    const model = loadModelFromStorage();
    const rateLimits = loadRateLimitsFromStorage();
    const apiToken = loadTokenFromStorage();
    set({ currentModel: model, rateLimits, apiToken });
  },
}));

// Селекторы
export const useSelectedModel = () => useModelStore((s) => s.currentModel);
export const useApiToken = () => useModelStore((s) => s.apiToken);
export const useFreeModels = () => useModelStore((s) => s.availableModels);
export const useRateLimits = () => useModelStore((s) => s.rateLimits);
