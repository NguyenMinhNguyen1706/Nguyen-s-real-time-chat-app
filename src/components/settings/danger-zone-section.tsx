"use client";

import { useState } from "react";
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChat } from "@/context/chat-context";

export function DangerZoneSection() {
  const { resetUserProfile, resetUserPreferences } = useChat();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionType: "profile" | "preferences" | null;
  }>({
    open: false,
    title: "",
    description: "",
    actionType: null,
  });

  const [actionDone, setActionDone] = useState<string | null>(null);

  const handleExecuteAction = () => {
    if (confirmDialog.actionType === "profile") {
      resetUserProfile();
      setActionDone("Local profile has been reset to defaults.");
    } else if (confirmDialog.actionType === "preferences") {
      resetUserPreferences();
      setActionDone("Local application preferences have been reset to defaults.");
    }
    setConfirmDialog({ open: false, title: "", description: "", actionType: null });
    setTimeout(() => setActionDone(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Destructive actions strictly affect your local frontend state and browser storage.
        </p>

        <div className="space-y-3 pt-1">
          {/* Reset Profile */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border border-destructive/20 bg-background">
            <div>
              <p className="text-xs font-semibold text-foreground">Reset Local Profile</p>
              <p className="text-[11px] text-muted-foreground">
                Revert custom display name, username, bio, and status back to factory defaults.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfirmDialog({
                  open: true,
                  title: "Reset Local Profile?",
                  description:
                    "Are you sure you want to reset your local profile details? All custom changes in browser storage will be reverted.",
                  actionType: "profile",
                })
              }
              className="text-xs gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
              aria-label="Reset local profile"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Profile</span>
            </Button>
          </div>

          {/* Reset Preferences */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border border-destructive/20 bg-background">
            <div>
              <p className="text-xs font-semibold text-foreground">Reset Application Preferences</p>
              <p className="text-[11px] text-muted-foreground">
                Revert notification, privacy, and chat settings to defaults.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfirmDialog({
                  open: true,
                  title: "Reset All Preferences?",
                  description:
                    "Are you sure you want to restore factory default preferences for notifications, privacy, and chat settings?",
                  actionType: "preferences",
                })
              }
              className="text-xs gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
              aria-label="Reset application preferences"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset Preferences</span>
            </Button>
          </div>
        </div>

        {actionDone && <p className="text-xs text-emerald-500 font-medium">{actionDone}</p>}
      </div>

      {/* Confirmation Modal Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setConfirmDialog({ open: false, title: "", description: "", actionType: null })
              }
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleExecuteAction}
              className="text-xs font-semibold"
            >
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
