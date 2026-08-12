import { describe, expect, it } from "vitest";

import { MOCK_CONVERSATIONS } from "@/repositories/mock/mock-data";
import { MOCK_MESSAGES_MAP } from "@/repositories/mock/mock-messages";
import { searchAll, splitTextByMatches } from "@/services/search-service";

describe("SearchService Pure Logic", () => {
  it("splits text by search query matches without mutating case", () => {
    const text = "Hello Sarah! How is the architecture project?";
    const query = "sarah";
    const parts = splitTextByMatches(text, query);

    expect(parts.length).toBe(3);
    expect(parts[0]).toEqual({ text: "Hello ", isMatch: false });
    expect(parts[1]).toEqual({ text: "Sarah", isMatch: true });
    expect(parts[2]).toEqual({ text: "! How is the architecture project?", isMatch: false });
  });

  it("returns empty results for whitespace query", () => {
    const results = searchAll("   ", MOCK_CONVERSATIONS, MOCK_MESSAGES_MAP);
    expect(results).toEqual([]);
  });

  it("ranks exact title match higher than content matches", () => {
    const results = searchAll("Sarah Chen", MOCK_CONVERSATIONS, MOCK_MESSAGES_MAP);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe("Sarah Chen");
    expect(results[0].type).toBe("conversation");
  });

  it("filters search results by conversation scope", () => {
    const scoped = searchAll("architecture", MOCK_CONVERSATIONS, MOCK_MESSAGES_MAP, "conv_1");
    expect(scoped.every((r) => r.conversationId === "conv_1")).toBe(true);
  });
});
