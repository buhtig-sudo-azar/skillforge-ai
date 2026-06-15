'use client';

import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <Separator />
      <div className="flex flex-col items-center gap-1 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <span>AI Skills Lab &copy; 2026 — Платформа для изучения AI Engineering</span>
        <div className="flex items-center gap-3">
          <span className="font-medium tracking-widest text-foreground/60">
            ALL IS SKILL
          </span>
          <Separator orientation="vertical" className="h-3" />
          <span className="font-semibold tracking-wide text-foreground/80">
            создатель AZAR
          </span>
        </div>
      </div>
    </footer>
  );
}
