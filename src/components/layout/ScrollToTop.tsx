'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTop — кнопка «наверх»
 * Появляется при прокрутке вниз, обтекает иконку чата сверху
 * Расположена: fixed, right-6, выше иконки чата
 */
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Показываем кнопку после 400px прокрутки
      setIsVisible(window.scrollY > 400);
    };

    // Используем scroll event на window (для случаев когда контент в main)
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Также проверяем scroll внутри контейнера main
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Проверяем начальное состояние
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (mainEl) {
        mainEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = useCallback(() => {
    // Скроллим main контейнер если он есть
    const mainEl = document.querySelector('main .overflow-auto');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Также скроллим window на всякий случай
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="scroll-to-top"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={scrollToTop}
          className="fixed right-6 z-40 flex size-11 items-center justify-center rounded-full border-2 border-background shadow-lg bg-primary/90 text-primary-foreground hover:bg-primary transition-colors"
          style={{ bottom: '148px' }} // Выше иконки чата (84px + 56px иконка + отступ)
          aria-label="Прокрутить наверх"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
