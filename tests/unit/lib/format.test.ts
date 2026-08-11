import { describe, expect, it } from "vitest";

import { formatRelativeTime, formatTime } from "@/lib/format";

describe("formatTime", () => {
  it("formats an ISO timestamp as UTC HH:MM", () => {
    expect(formatTime("2026-08-12T09:05:00.000Z")).toBe("09:05");
  });

  it("returns an empty string for an invalid timestamp", () => {
    expect(formatTime("not-a-date")).toBe("");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-08-12T12:00:00.000Z");

  it("returns 'Just now' for recent timestamps", () => {
    expect(formatRelativeTime("2026-08-12T11:59:30.000Z", now)).toBe("Just now");
  });

  it("returns minutes for timestamps within the hour", () => {
    expect(formatRelativeTime("2026-08-12T11:55:00.000Z", now)).toBe("5m ago");
  });

  it("returns hours for timestamps within the day", () => {
    expect(formatRelativeTime("2026-08-12T09:00:00.000Z", now)).toBe("3h ago");
  });

  it("returns 'Yesterday' for 24–48h old timestamps", () => {
    expect(formatRelativeTime("2026-08-11T08:00:00.000Z", now)).toBe("Yesterday");
  });

  it("returns days for timestamps within the week", () => {
    expect(formatRelativeTime("2026-08-08T12:00:00.000Z", now)).toBe("4d ago");
  });

  it("returns the date for older timestamps", () => {
    expect(formatRelativeTime("2026-07-01T12:00:00.000Z", now)).toBe("2026-07-01");
  });

  it("returns an empty string for an invalid timestamp", () => {
    expect(formatRelativeTime("not-a-date", now)).toBe("");
  });
});
