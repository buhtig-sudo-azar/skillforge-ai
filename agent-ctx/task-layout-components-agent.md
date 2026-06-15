# Task: Layout Components for AI Engineering Platform

## Summary
Created the main layout components for an AI Engineering educational platform ("AI Skills Lab") with Russian UI text, client-side routing via Zustand, and Framer Motion animations.

## Files Created

### Layout Components
- `/home/z/my-project/src/components/layout/AppShell.tsx` — Main layout orchestrator with sidebar, header, content area, footer, and view router
- `/home/z/my-project/src/components/layout/Sidebar.tsx` — Collapsible navigation sidebar with categories, subtopics, XP/level display
- `/home/z/my-project/src/components/layout/Header.tsx` — Top header with breadcrumbs, search, model selector, XP badge, theme toggle
- `/home/z/my-project/src/components/layout/Breadcrumbs.tsx` — Breadcrumb navigation component using shadcn/ui Breadcrumb
- `/home/z/my-project/src/components/layout/Footer.tsx` — Sticky footer with copyright and "ALL IS SKILL" tagline

### View Components
- `/home/z/my-project/src/components/views/HomeView.tsx` — Full home view with hero section, stats cards, category grid
- `/home/z/my-project/src/components/views/CategoryView.tsx` — Category detail view with topic listing
- `/home/z/my-project/src/components/views/TopicView.tsx` — Topic detail view with introduction, terms, principles, examples, common mistakes
- `/home/z/my-project/src/components/views/PlaceholderView.tsx` — Placeholder for views not yet implemented
- `/home/z/my-project/src/components/views/index.ts` — Barrel export

### Updated Files
- `/home/z/my-project/src/app/page.tsx` — Renders AppShell
- `/home/z/my-project/src/app/layout.tsx` — Added ThemeProvider from next-themes, changed lang to "ru"

## Key Architecture Decisions
- Zustand navigation store controls all routing (no Next.js router for views)
- View router in AppShell maps ViewType to React components
- Framer Motion animations on sidebar collapse/expand, view transitions, and hover states
- shadcn/ui components used throughout (Button, Badge, Card, Tooltip, Breadcrumb, etc.)
- Responsive design: sidebar overlay on mobile, fixed on desktop
- All user-facing text in Russian
