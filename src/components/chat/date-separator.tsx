interface DateSeparatorProps {
  label: string;
}

export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="relative my-4 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/50" />
      </div>
      <div className="relative rounded-full border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-2xs">
        {label}
      </div>
    </div>
  );
}
