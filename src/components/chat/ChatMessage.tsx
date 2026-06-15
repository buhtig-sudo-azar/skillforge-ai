'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ChatMessage as ChatMessageType } from '@/types';

// ============================================================
// Copy button for code blocks
// ============================================================
function CodeCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback для старых браузеров
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-2 top-2 size-7 rounded-md bg-white/10 text-white/70 opacity-0 backdrop-blur-sm transition-opacity hover:bg-white/20 hover:text-white group-hover/code:opacity-100"
      onClick={handleCopy}
      aria-label={copied ? 'Скопировано' : 'Скопировать код'}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}

// ============================================================
// Inline code renderer
// ============================================================
function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
      {children}
    </code>
  );
}

// ============================================================
// Code block renderer with syntax highlighting + copy
// ============================================================
function CodeBlock({
  language,
  children,
}: {
  language: string | undefined;
  children: string;
}) {
  const code = String(children).replace(/\n$/, '');

  // Если язык не указан — показываем простой блок
  if (!language) {
    return (
      <div className="group/code relative my-3 overflow-hidden rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-1.5">
          <span className="text-xs text-muted-foreground">код</span>
        </div>
        <pre className="overflow-x-auto bg-muted/30 p-4 text-sm">
          <code className="font-mono">{code}</code>
        </pre>
        <CodeCopyButton text={code} />
      </div>
    );
  }

  return (
    <div className="group/code relative my-3 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-1.5">
        <span className="text-xs text-muted-foreground">{language}</span>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.8125rem',
          lineHeight: '1.6',
          padding: '1rem',
          background: 'rgb(30, 30, 30)',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
      <CodeCopyButton text={code} />
    </div>
  );
}

// ============================================================
// Markdown components mapping
// ============================================================
const markdownComponents = {
  code({
    className,
    children,
    ...rest
  }: React.HTMLAttributes<HTMLElement> & { children?: ReactNode }) {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match && !String(children).includes('\n');

    if (isInline) {
      return <InlineCode>{children}</InlineCode>;
    }

    return (
      <CodeBlock language={match?.[1]}>{String(children)}</CodeBlock>
    );
  },
  p({ children }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
  },
  ul({ children }: React.HTMLAttributes<HTMLUListElement>) {
    return <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>;
  },
  ol({ children }: React.HTMLAttributes<HTMLOListElement>) {
    return <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>;
  },
  li({ children }: React.HTMLAttributes<HTMLLIElement>) {
    return <li className="leading-relaxed">{children}</li>;
  },
  h1({ children }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h1 className="mb-2 mt-4 text-lg font-bold first:mt-0">{children}</h1>;
  },
  h2({ children }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h2 className="mb-2 mt-3 text-base font-bold first:mt-0">{children}</h2>;
  },
  h3({ children }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className="mb-1.5 mt-2 text-sm font-bold first:mt-0">{children}</h3>;
  },
  blockquote({ children }: React.HTMLAttributes<HTMLQuoteElement>) {
    return (
      <blockquote className="my-3 border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    );
  },
  a({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {children}
      </a>
    );
  },
  table({ children }: React.HTMLAttributes<HTMLTableElement>) {
    return (
      <div className="my-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">{children}</table>
      </div>
    );
  },
  thead({ children }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <thead className="bg-muted/50">{children}</thead>;
  },
  th({ children }: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return (
      <th className="border-b border-border px-3 py-2 text-left font-semibold">
        {children}
      </th>
    );
  },
  td({ children }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return (
      <td className="border-b border-border px-3 py-2 last:border-b-0">
        {children}
      </td>
    );
  },
  hr() {
    return <hr className="my-4 border-border" />;
  },
  strong({ children }: React.HTMLAttributes<HTMLElement>) {
    return <strong className="font-bold">{children}</strong>;
  },
  em({ children }: React.HTMLAttributes<HTMLElement>) {
    return <em className="italic">{children}</em>;
  },
};

// ============================================================
// Timestamp formatter
// ============================================================
function formatTimestamp(date: Date): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}

// ============================================================
// ChatMessage Component
// ============================================================
interface ChatMessageProps {
  message: ChatMessageType;
  agentAvatar?: string;
}

export function ChatMessage({ message, agentAvatar }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('group/msg flex gap-2.5 px-4 py-1.5', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      {isAssistant && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
          {agentAvatar || '🤖'}
        </div>
      )}
      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          Вы
        </div>
      )}

      {/* Message bubble */}
      <div className={cn('relative max-w-[85%] min-w-0', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm',
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm bg-muted text-foreground',
            // Для системных сообщений — простой стиль
            message.role === 'system' && 'rounded-sm bg-secondary text-secondary-foreground italic',
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp — показывается при наведении */}
        {message.timestamp && (
          <span
            className={cn(
              'mt-0.5 px-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover/msg:opacity-100',
              isUser ? 'text-right' : 'text-left',
            )}
          >
            {formatTimestamp(message.timestamp)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
