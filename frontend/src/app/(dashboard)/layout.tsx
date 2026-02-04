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
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col">
          <Header onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
