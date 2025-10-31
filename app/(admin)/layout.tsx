import { ThemeProvider } from '@/components/theme-provider';
import { AdminNav } from '@/components/admin-nav';
import React from 'react';
import "./global.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50">
            <div className="relative">
              <AdminNav />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}