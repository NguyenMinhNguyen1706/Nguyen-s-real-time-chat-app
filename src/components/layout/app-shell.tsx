"use client";

import { useState } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar, SidebarEmptyState, SidebarMobile } from "@/components/layout/sidebar";

export function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col">
      <Header onOpenSidebar={() => setMobileSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar onNavigate={() => {}} />
        </div>
        <main className="flex flex-1 flex-col overflow-hidden">
          <SidebarEmptyState />
        </main>
      </div>
      <SidebarMobile open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
    </div>
  );
}
