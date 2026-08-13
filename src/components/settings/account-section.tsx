"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, LogOut, Mail, ShieldCheck, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";

export function AccountSection() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { userProfile } = useChat();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const activeUserId = profile?.id || user?.id || userProfile.id;
  const activeEmail = profile?.email || user?.email || userProfile.email;
  const isRealAuth = Boolean(user);

  const handleLogout = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Account Overview Card */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Account Details
          </h4>
          <p className="text-xs text-muted-foreground">
            Overview of your current account identity and security settings.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-foreground">User ID</p>
                <p className="text-[11px] text-muted-foreground font-mono">{activeUserId}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {isRealAuth ? "Supabase Auth" : "Local Mock"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-foreground">Primary Email Address</p>
                <p className="text-[11px] text-muted-foreground">{activeEmail}</p>
              </div>
            </div>
            <Badge variant="default" className="text-[10px] bg-emerald-500">
              Verified
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-foreground">Two-Factor Authentication</p>
                <p className="text-[11px] text-muted-foreground">
                  Security layer enabled for session protection.
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              Active Session
            </Badge>
          </div>
        </div>
      </div>

      {/* Security Actions Card */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Security Controls
          </h4>
          <p className="text-xs text-muted-foreground">
            Manage credentials and active authentication session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border bg-background">
          <div className="flex items-center gap-3">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-xs font-semibold text-foreground">Password & Security</Label>
              <p className="text-[11px] text-muted-foreground">
                Managed securely via Supabase Authentication.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            Change Password
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border bg-background">
          <div className="flex items-center gap-3">
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-xs font-semibold text-foreground">Session Logout</Label>
              <p className="text-[11px] text-muted-foreground">
                Sign out of current active session.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="text-xs gap-1.5"
            aria-label="Logout button"
          >
            {isSigningOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
