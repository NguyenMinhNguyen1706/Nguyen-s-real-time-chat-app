import { describe, expect, it } from "vitest";

import { badgeVariants } from "@/components/ui/badge";

describe("badgeVariants", () => {
  it("generates default variant class names", () => {
    const classes = badgeVariants({ variant: "default" });
    expect(classes).toContain("bg-primary");
    expect(classes).toContain("text-primary-foreground");
  });

  it("generates success variant class names", () => {
    const classes = badgeVariants({ variant: "success" });
    expect(classes).toContain("bg-success/10");
    expect(classes).toContain("text-success");
  });

  it("generates warning variant class names", () => {
    const classes = badgeVariants({ variant: "warning" });
    expect(classes).toContain("bg-warning/10");
    expect(classes).toContain("text-warning");
  });

  it("generates destructive variant class names", () => {
    const classes = badgeVariants({ variant: "destructive" });
    expect(classes).toContain("text-destructive");
  });
});
