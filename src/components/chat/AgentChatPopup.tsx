'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Square,
  Sparkles,
  Trash2,
  Minimize2,
  Maximize2,
  Shrink,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { agents } from '@/data/agent-data';
import { useChatStore, useChatActions, useChatMessages, useChatIsLoading, useChatError, useActiveCategory } from '@/store/chat-store';
import { useNavigationStore, useCurrentCategory } from '@/store/navigation-store';
import { useModelStore } from '@/store/model-store';
import { ChatMessage } from './ChatMessage';

// ============================================================
// Loading dots animation
// ============================================================
function LoadingDots() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
        🤖
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
        <motion.span
          className="size-2 rounded-full bg-muted-foreground/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="size-2 rounded-full bg-muted-foreground/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="size-2 rounded-full bg-muted-foreground/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  );
}

// ============================================================
// Main AgentChatPopup — как в llm-red-team-lab:
// Агент определяется текущей категорией, ВЫПАДАЮЩИЙ СПИСОК УБРАН
// ============================================================
export function AgentChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Store hooks
  const messages = useChatMessages();
  const isLoading = useChatIsLoading();
  const chatError = useChatError();
  const activeCategory = useActiveCategory();
  const chatActions = useChatActions();
  const currentNavCategory = useCurrentCategory();

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Агент определяется текущей категорией — как в llm-red-team-lab
  const agent = activeCategory
    ? agents[activeCategory]
    : (currentNavCategory ? agents[currentNavCategory] : null);
  const currentAgent = agent || Object.values(agents)[0];
  const systemPrompt = agent?.systemPrompt || currentAgent.systemPrompt || '';

  // Когда чат открывается, установить активного агента по текущей категории
  useEffect(() => {
    if (isOpen && currentNavCategory && currentNavCategory !== activeCategory) {
      chatActions.setActiveCategory(currentNavCategory);
      chatActions.clearChat();
    }
  }, [isOpen, currentNavCategory, activeCategory, chatActions]);

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Фокус на поле ввода при открытии
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Отправка сообщения
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const modelStore = useModelStore.getState();
    chatActions.sendMessage(trimmed, systemPrompt, modelStore.currentModel, modelStore.apiToken);
    setInputValue('');

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [inputValue, isLoading, chatActions, systemPrompt]);

  // Обработка нажатия Enter
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Клик по suggested question
  const handleSuggestionClick = useCallback(
    (question: string) => {
      const modelStore = useModelStore.getState();
      chatActions.sendMessage(question, systemPrompt, modelStore.currentModel, modelStore.apiToken);
    },
    [chatActions, systemPrompt],
  );

  // Остановка генерации
  const handleStopGeneration = useCallback(() => {
    chatActions.stopGeneration();
  }, [chatActions]);

  // Очистка чата
  const handleClearChat = useCallback(() => {
    chatActions.clearChat();
  }, [chatActions]);

  // Закрытие чата
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsExpanded(false);
    chatActions.clearChat();
  }, [chatActions]);

  // Проверка, является ли последнее сообщение ошибкой
  const lastAssistantMessage = messages.length > 0
    ? [...messages].reverse().find(m => m.role === 'assistant')
    : null;
  const lastMessageIsError = lastAssistantMessage
    ? (lastAssistantMessage.content.includes('Не удалось получить ответ') ||
       lastAssistantMessage.content.includes('Ошибка') ||
       lastAssistantMessage.content.includes('Все модели') ||
       lastAssistantMessage.content.includes('ошибка сети'))
    : false;

  const hasRealMessages = messages.length > 0;

  return (
    <>
      {/* ====== Floating Action Button ====== */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[84px] right-6 z-50 flex flex-col items-end gap-2"
            aria-label="Открыть чат с AI-наставником"
          >
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 animate-pulse">
              AI-наставник
            </span>
            <div className="relative group">
              <span className={`absolute -inset-1.5 rounded-full bg-gradient-to-br ${currentAgent.gradient} opacity-40 group-hover:opacity-70 transition-opacity`} />
              <span className="relative flex size-14 items-center justify-center rounded-full border-2 border-background shadow-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                <MessageCircle className="size-6" />
              </span>
              <span className="absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-2 border-background" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ====== Chat Panel ====== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={cn(
              'fixed z-50 flex flex-col bg-background border border-border shadow-2xl rounded-2xl overflow-hidden transition-all duration-300',
              isExpanded
                ? 'sm:bottom-6 sm:right-6 sm:top-6 sm:w-[calc(100vw-3rem)] sm:max-h-[calc(100vh-3rem)] max-sm:inset-3 max-sm:max-h-[calc(100vh-1.5rem)]'
                : 'sm:bottom-6 sm:right-6 sm:w-[420px] sm:max-h-[600px] max-sm:inset-0 max-sm:max-h-full',
            )}
          >
            {/* ===== Header ===== */}
            <div className="relative flex items-center gap-3 px-4 py-3 border-b border-border">
              <div className={`absolute inset-0 bg-gradient-to-r ${currentAgent.gradient} opacity-[0.08]`} />
              <div className="relative flex items-center gap-3 w-full">
                {/* Аватар */}
                <div className="relative size-10 rounded-full overflow-hidden border-2 border-white/20 shadow-sm shrink-0 flex items-center justify-center bg-primary/10">
                  <Sparkles className="size-5 text-primary" />
                </div>
                {/* Имя и роль */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground truncate">{currentAgent.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{currentAgent.role}</p>
                </div>
                {/* Действия */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="size-7 hover:bg-muted" onClick={() => setIsExpanded(prev => !prev)}>
                    {isExpanded ? <Shrink className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7 hover:bg-muted" onClick={handleClose}>
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* ===== Messages Area ===== */}
            <div ref={messagesEndRef} className="flex-1 overflow-y-auto p-3 min-h-0">
              {!hasRealMessages ? (
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                  <div className="relative size-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-md mb-3 flex items-center justify-center bg-primary/10">
                    <Sparkles className="size-8 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="size-3.5 text-primary" />
                    <p className="text-base font-semibold">{currentAgent.name}</p>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-[280px] mb-4">
                    {currentAgent.greeting}
                  </p>
                  <div className="w-full max-w-[280px] space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Попробуйте спросить</p>
                    {currentAgent.suggestions?.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(s)}
                        disabled={isLoading}
                        className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      agentAvatar={currentAgent.avatar}
                    />
                  ))}
                  {isLoading && (
                    <LoadingDots />
                  )}
                  {!isLoading && lastMessageIsError && (
                    <div className="flex justify-center pt-1">
                      <Button variant="outline" size="sm" onClick={() => chatActions.retryLastMessage()} className="gap-1.5 text-xs">
                        <RefreshCw className="size-3" />
                        Попробовать снова
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ===== Input Area ===== */}
            <div className="border-t border-border px-4 py-3">
              {isLoading && (
                <div className="mb-2 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStopGeneration}
                    className="gap-1.5 text-xs"
                  >
                    <Square className="size-3 fill-current" />
                    Остановить генерацию
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Напишите сообщение..."
                  disabled={isLoading}
                  className="flex-1 text-sm"
                  aria-label="Поле ввода сообщения"
                />
                {hasRealMessages && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={handleClearChat}
                    aria-label="Очистить чат"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Отправить сообщение"
                  className="shrink-0"
                >
                  {isLoading ? (
                    <Sparkles className="size-4 animate-pulse" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>

              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                AI-наставник может допускать ошибки. Проверяйте важную информацию.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
