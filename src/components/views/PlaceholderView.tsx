'use client';

import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  description?: string;
}

export function PlaceholderView({ title, description }: PlaceholderViewProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
          <Construction className="size-8 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">Раздел в разработке</p>
      </motion.div>
    </div>
  );
}
