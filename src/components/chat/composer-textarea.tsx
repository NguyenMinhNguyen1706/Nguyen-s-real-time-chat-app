import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

interface ComposerTextareaProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ComposerTextarea = forwardRef<HTMLTextAreaElement, ComposerTextareaProps>(
  function ComposerTextarea({ value, onChange, onSend, placeholder, disabled }, ref) {
    const internalRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => internalRef.current!, []);

    useEffect(() => {
      const textarea = internalRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
      }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    };

    return (
      <textarea
        ref={internalRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Write a message..."}
        disabled={disabled}
        rows={1}
        aria-label="Message composer input"
        className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors max-h-36 overflow-y-auto disabled:opacity-50 dark:bg-input/30"
      />
    );
  },
);
