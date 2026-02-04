"use client";

import { useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground"
        >
          Skip to content
        </a>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col">
          <Header onOpenSidebar={() => setSidebarOpen(true)} />
          <main
            id="main-content"
            className="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-10"
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
