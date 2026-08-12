"use client";

import { useTheme } from "next-themes";
import { Check, Laptop, Moon, Sun } from "lucide-react";

import { Label } from "@/components/ui/label";
import { useChat } from "@/context/chat-context";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const { userPreferences, updateUserPreferences } = useChat();

  const themes: { id: "light" | "dark" | "system"; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Cards */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-3 shadow-2xs">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Theme Mode
          </h4>
          <p className="text-xs text-muted-foreground">
            Choose your preferred color theme for Nguyen&apos;s Real-time Chat App.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  updateUserPreferences("appearance", { theme: t.id });
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground ring-2 ring-primary"
                    : "border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                }`}
                aria-label={`Select ${t.label} theme`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold">{t.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interface Density */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-3 shadow-2xs">
        <div className="space-y-0.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Layout Density
          </Label>
          <p className="text-xs text-muted-foreground">
            Adjust list spacing and component padding for comfortable or compact viewing.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {[
            { id: "comfortable", label: "Comfortable", desc: "Standard spacing & padding" },
            { id: "compact", label: "Compact", desc: "Tighter spacing for more content" },
          ].map((d) => {
            const isSelected = userPreferences.appearance.density === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() =>
                  updateUserPreferences("appearance", {
                    density: d.id as "comfortable" | "compact",
                  })
                }
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                }`}
                aria-label={`Select ${d.label} density`}
              >
                <span className="text-xs font-semibold">{d.label}</span>
                <span className="text-[10px] text-muted-foreground">{d.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Motion Preference */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 flex items-center justify-between shadow-2xs">
        <div className="space-y-0.5">
          <Label htmlFor="reduced-motion-toggle" className="text-xs font-semibold text-foreground">
            Reduce Motion
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Minimize UI animations and transitions across the application shell.
          </p>
        </div>
        <input
          id="reduced-motion-toggle"
          type="checkbox"
          checked={userPreferences.appearance.reducedMotion}
          onChange={(e) => updateUserPreferences("appearance", { reducedMotion: e.target.checked })}
          className="h-4 w-4 rounded-xs border-primary text-primary focus:ring-primary cursor-pointer"
          aria-label="Toggle reduce motion"
        />
      </div>
    </div>
  );
}
