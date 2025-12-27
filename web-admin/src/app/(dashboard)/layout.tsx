/**
 * Dashboard Layout - With sidebar and header
 */

'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useSidebarStore } from '@/stores/sidebar-store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Header />
        <main
          className={cn(
            'min-h-screen pt-16 transition-all duration-300',
            isCollapsed ? 'pl-16' : 'pl-64'
          )}
        >
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
