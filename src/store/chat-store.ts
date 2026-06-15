import { create } from 'zustand';
import type { ChatMessage } from '@/types';
import { agents } from '@/data/agent-data';

// Утилита для генерации уникальных идентификаторов
const uid = () => crypto.randomUUID();

interface ChatActions {
  sendMessage: (
    content: string,
    systemPrompt: string,
    model: string,
    apiToken: string,
  ) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearChat: () => void;
  setActiveCategory: (category: string | null) => void;
  stopGeneration: () => void;
}

interface ChatStoreState {
  messages: ChatMessage[];
  isLoading: boolean;
  activeCategory: string | null;
  currentModel: string;
  error: string | null;
  abortController: AbortController | null;
  actions: ChatActions;
}

// Вспомогательная функция: парсинг SSE потока
async function parseSSEStream(
  response: Response,
  onToken: (token: string) => void,
  onModelInfo: (model: string, rateLimited: string[]) => void,
  signal: AbortSignal,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Нет тела ответа от сервера');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal.aborted) break;

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data: ')) {
          const payload = trimmed.slice(6);

          if (payload === '[DONE]') return;

          try {
            const parsed = JSON.parse(payload);

            // Обработка события model_info
            if (parsed.type === 'model_info' && parsed.model) {
              onModelInfo(parsed.model, parsed.rateLimited ?? []);
              continue;
            }

            // Обработка токена генерации
            const token =
              parsed.choices?.[0]?.delta?.content ??
              parsed.content ??
              parsed.text ??
              '';

            if (token) {
              onToken(token);
            }
          } catch {
            onToken(payload);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export const useChatStore = create<ChatStoreState>()((set, get) => ({
  messages: [],
  isLoading: false,
  activeCategory: null,
  currentModel: 'auto',
  error: null,
  abortController: null,

  actions: {
    sendMessage: async (content, systemPrompt, model, apiToken) => {
      const { messages, abortController } = get();

      // Прерываем предыдущую генерацию при новом запросе
      if (abortController) {
        abortController.abort();
      }

      // Создаём сообщение пользователя
      const userMessage: ChatMessage = {
        id: uid(),
        role: 'user',
        content,
        model: model || 'auto',
        timestamp: new Date(),
      };

      // Создаём пустое сообщение ассистента для стриминга
      const assistantMessage: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: '',
        model,
        timestamp: new Date(),
      };

      const controller = new AbortController();

      set({
        messages: [...messages, userMessage, assistantMessage],
        isLoading: true,
        error: null,
        abortController: controller,
      });

      try {
        // Формируем историю сообщений для API
        const apiMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...[...messages, userMessage].map((m) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
          })),
        ];

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: apiMessages,
            model,
            stream: true,
            apiToken,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          throw new Error(
            `Ошибка сервера: ${response.status} ${response.statusText}${errorText ? ` — ${errorText}` : ''}`,
          );
        }

        // Парсим SSE-поток
        await parseSSEStream(
          response,
          // onToken: добавляем токен к сообщению ассистента
          (token) => {
            set((state) => {
              const updated = [...state.messages];
              const lastMsg = updated[updated.length - 1];
              if (lastMsg?.role === 'assistant') {
                updated[updated.length - 1] = {
                  ...lastMsg,
                  content: lastMsg.content + token,
                };
              }
              return { messages: updated };
            });
          },
          // onModelInfo: обновляем информацию о модели
          (modelName) => {
            set((state) => {
              const updated = [...state.messages];
              const lastMsg = updated[updated.length - 1];
              if (lastMsg?.role === 'assistant') {
                updated[updated.length - 1] = {
                  ...lastMsg,
                  model: modelName,
                };
              }
              return { messages: updated, currentModel: modelName };
            });
          },
          controller.signal,
        );
      } catch (err: unknown) {
        // Игнорируем ошибку прерывания — это штатная ситуация
        if (err instanceof DOMException && err.name === 'AbortError') return;

        const errorMessage =
          err instanceof Error ? err.message : 'Произошла неизвестная ошибка при генерации ответа';

        set({ error: errorMessage });
      } finally {
        set({ isLoading: false, abortController: null });
      }
    },

    retryLastMessage: async () => {
      const { messages, actions, activeCategory } = get();
      if (messages.length === 0) return;

      // Находим последнее сообщение пользователя
      let lastUserContent = '';
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          lastUserContent = messages[i].content;
          break;
        }
      }

      if (!lastUserContent) return;

      // Удаляем последнее сообщение ассистента (ошибочное)
      const trimmed = [...messages];
      if (trimmed.length > 0 && trimmed[trimmed.length - 1].role === 'assistant') {
        trimmed.pop();
      }
      // Удаляем последнее сообщение пользователя
      if (trimmed.length > 0 && trimmed[trimmed.length - 1].role === 'user') {
        trimmed.pop();
      }

      set({ messages: trimmed, error: null });

      // Получаем системный промпт текущего активного агента
      const agent = activeCategory ? agents[activeCategory] : null;
      const systemPrompt = agent?.systemPrompt || 'Ты — ИИ-наставник по AI-инженерии. Помогай ученикам разобраться в сложных темах, давай понятные объяснения на русском языке.';

      // Повторяем отправку с токеном из model-store
      const { useModelStore } = await import('@/store/model-store');
      const modelStore = useModelStore.getState();

      await actions.sendMessage(
        lastUserContent,
        systemPrompt,
        modelStore.currentModel,
        modelStore.apiToken,
      );
    },

    clearChat: () =>
      set({
        messages: [],
        isLoading: false,
        error: null,
        abortController: null,
      }),

    setActiveCategory: (category) => set({ activeCategory: category }),

    stopGeneration: () => {
      const { abortController } = get();
      if (abortController) {
        abortController.abort();
        set({ isLoading: false, abortController: null });
      }
    },
  },
}));

// Селекторы
export const useChatMessages = () => useChatStore((s) => s.messages);
export const useChatIsLoading = () => useChatStore((s) => s.isLoading);
export const useChatError = () => useChatStore((s) => s.error);
export const useActiveCategory = () => useChatStore((s) => s.activeCategory);
export const useCurrentModel = () => useChatStore((s) => s.currentModel);
export const useChatActions = () => useChatStore((s) => s.actions);
