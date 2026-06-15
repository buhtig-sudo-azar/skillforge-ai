'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AgentChatPopup } from '@/components/chat/AgentChatPopup';

export default function Home() {
  return (
    <>
      <AppShell />
      <AgentChatPopup />
    </>
  );
}
