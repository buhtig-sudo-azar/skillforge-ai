'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AgentChatPopup } from '@/components/chat/AgentChatPopup';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

export default function Home() {
  return (
    <>
      <AppShell />
      <AgentChatPopup />
      <ScrollToTop />
    </>
  );
}
