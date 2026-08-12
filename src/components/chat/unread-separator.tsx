import { ArrowDown } from "lucide-react";

export function UnreadSeparator() {
  return (
    <div
      role="separator"
      aria-label="New messages separator"
      className="relative my-4 flex items-center justify-center"
    >
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-primary/40" />
      </div>
      <div className="relative flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-0.5 text-[11px] font-semibold text-primary shadow-2xs">
        <span>NEW MESSAGES</span>
        <ArrowDown className="h-3 w-3 animate-bounce" />
      </div>
    </div>
  );
}
