import type { ReactNode } from "react";
import { MessageSquare } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex flex-col justify-between bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Auth Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-bold tracking-tight">Realtime Chat</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Auth Main Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </main>

      {/* Auth Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>© 2026 Nguyen's Real-time Chat App. All rights reserved.</p>
      </footer>
    </div>
  );
}
