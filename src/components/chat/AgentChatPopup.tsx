'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Square,
  ChevronDown,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { agentPersonas } from '@/data/agent-data';
import { useChatStore, useChatActions, useChatMessages, useChatIsLoading, useChatError } from '@/store/chat-store';
import { useModelStore, useSelectedModel, useApiToken, useModelActions } from '@/store/model-store';
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
// Suggested questions chips
// ============================================================
function SuggestedQuestions({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (question: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      <p className="w-full text-xs font-medium text-muted-foreground mb-1">
        💡 Попробуйте спросить:
      </p>
      {suggestions.map((question, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.2 }}
          onClick={() => onSelect(question)}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {question}
        </motion.button>
      ))}
    </div>
  );
}

// ============================================================
// Agent selector popover
// ============================================================
function AgentSelector({
  currentAgent,
  onSelectAgent,
}: {
  currentAgent: (typeof agentPersonas)[number];
  onSelectAgent: (agent: (typeof agentPersonas)[number]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2 text-xs font-normal h-7"
        >
          <span>{currentAgent.avatar}</span>
          <span className="max-w-[100px] truncate">{currentAgent.name}</span>
          <ChevronDown className="size-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start" sideOffset={8}>
        <Command>
          <CommandInput placeholder="Поиск агента..." />
          <CommandList>
            <CommandEmpty>Агент не найден</CommandEmpty>
            <CommandGroup heading="Агенты-наставники">
              {agentPersonas.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={agent.slug}
                  onSelect={() => {
                    onSelectAgent(agent);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-base">{agent.avatar}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{agent.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {agent.role}
                    </span>
                  </div>
                  {currentAgent.id === agent.id && (
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                      ✓
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================
// Main AgentChatPopup Component
// ============================================================
export function AgentChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeAgent, setActiveAgent] = useState(agentPersonas[0]);

  // Store hooks
  const messages = useChatMessages();
  const isLoading = useChatIsLoading();
  const chatError = useChatError();
  const chatActions = useChatActions();
  const selectedModel = useSelectedModel();
  const apiToken = useApiToken();

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // При смене агента — показать приветствие и обновить стейт
  const handleAgentChange = useCallback(
    (agent: (typeof agentPersonas)[number]) => {
      setActiveAgent(agent);
      chatActions.setAgent(agent.slug);
      chatActions.clearChat();
    },
    [chatActions],
  );

  // При первом открытии — установить агента и показать приветствие
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      chatActions.setAgent(activeAgent.slug);
    }
  }, [isOpen, chatActions, activeAgent.slug, messages.length]);

  // Отправка сообщения
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    chatActions.sendMessage(trimmed, activeAgent.systemPrompt, selectedModel, apiToken ?? '');
    setInputValue('');

    // Возвращаем фокус на поле ввода
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [inputValue, isLoading, chatActions, activeAgent.systemPrompt, selectedModel, apiToken]);

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
      chatActions.sendMessage(question, activeAgent.systemPrompt, selectedModel, apiToken ?? '');
    },
    [chatActions, activeAgent.systemPrompt, selectedModel, apiToken],
  );

  // Остановка генерации
  const handleStopGeneration = useCallback(() => {
    chatActions.stopGeneration();
  }, [chatActions]);

  // Очистка чата
  const handleClearChat = useCallback(() => {
    chatActions.clearChat();
  }, [chatActions]);

  // Проверка, пустой ли чат (только приветствие или нет сообщений)
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
            className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-shadow hover:shadow-xl active:scale-95 sm:bottom-8 sm:right-8"
            aria-label="Открыть чат с AI-наставником"
          >
            <MessageSquare className="size-6" />
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
              // Мобильная версия: полный экран
              'fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto',
              // Десктопная версия: плавающая панель
              'sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto sm:h-[500px] sm:w-[400px] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl',
              // Позиция для десктопа
              'sm:bottom-8 sm:right-8',
            )}
          >
            {/* ===== Header ===== */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              {/* Аватар и имя */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg',
                    activeAgent.gradient,
                  )}
                >
                  {activeAgent.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold leading-tight">
                    {activeAgent.name}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {activeAgent.role}
                  </p>
                </div>
              </div>

              {/* Действия */}
              <div className="flex items-center gap-1">
                <AgentSelector
                  currentAgent={activeAgent}
                  onSelectAgent={handleAgentChange}
                />
                {hasRealMessages && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={handleClearChat}
                    aria-label="Очистить чат"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  onClick={() => setIsOpen(false)}
                  aria-label="Закрыть чат"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* ===== Messages Area ===== */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-1 py-4">
                  {/* Приветственное сообщение агента (если чат пустой) */}
                  {!hasRealMessages && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Greeting message */}
                      <ChatMessage
                        message={{
                          id: 'greeting',
                          role: 'assistant',
                          content: activeAgent.greeting,
                          model: 'system',
                          timestamp: new Date(),
                        }}
                        agentAvatar={activeAgent.avatar}
                      />
                      {/* Suggested questions */}
                      <SuggestedQuestions
                        suggestions={activeAgent.suggestions}
                        onSelect={handleSuggestionClick}
                      />
                    </motion.div>
                  )}

                  {/* Реальные сообщения */}
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      agentAvatar={activeAgent.avatar}
                    />
                  ))}

                  {/* Индикатор загрузки */}
                  {isLoading && messages[messages.length - 1]?.content === '' && (
                    <LoadingDots />
                  )}

                  {/* Ошибка */}
                  {chatError && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-4 my-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                    >
                      <p className="text-xs text-destructive">{chatError}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1.5 h-7 gap-1 text-xs text-muted-foreground"
                        onClick={() => chatActions.retryLastMessage()}
                      >
                        Попробовать снова
                      </Button>
                    </motion.div>
                  )}

                  {/* Якорь для автоскролла */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* ===== Input Area ===== */}
            <div className="border-t border-border px-4 py-3">
              {/* Кнопка остановки генерации */}
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
