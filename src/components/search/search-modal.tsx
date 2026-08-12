"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { RecentSearches } from "@/components/search/recent-searches";
import { SearchResultCard } from "@/components/search/search-result-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChat } from "@/context/chat-context";
import { MOCK_MESSAGES_MAP } from "@/repositories/mock/mock-messages";
import { searchAll } from "@/services/search-service";
import type { SearchCategoryTab, SearchResultItem } from "@/types/search";

export function SearchModal() {
  const {
    conversations,
    searchModalOpen,
    setSearchModalOpen,
    searchScopeConversationId,
    navigateToSearchResult,
  } = useChat();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchCategoryTab>("all");
  const [recentQueries, setRecentQueries] = useState<string[]>([
    "Sarah",
    "architecture",
    "Next.js",
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName ?? "");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === "/" && !isInput) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [setSearchModalOpen]);

  const rawResults = useMemo(() => {
    return searchAll(
      query,
      conversations,
      MOCK_MESSAGES_MAP,
      searchScopeConversationId ?? undefined,
    );
  }, [query, conversations, searchScopeConversationId]);

  const filteredResults = useMemo(() => {
    if (tab === "conversations") {
      return rawResults.filter((r) => r.type === "conversation");
    }
    if (tab === "messages") {
      return rawResults.filter((r) => r.type === "message");
    }
    return rawResults;
  }, [rawResults, tab]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        setSelectedIndex(0);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [query, tab]);

  const handleSelectResult = (item: SearchResultItem) => {
    if (query.trim() && !recentQueries.includes(query.trim())) {
      setRecentQueries((prev) => [query.trim(), ...prev.slice(0, 4)]);
    }
    setSearchModalOpen(false);
    navigateToSearchResult(item);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev === 0 ? Math.max(0, filteredResults.length - 1) : prev - 1));
    } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(filteredResults[selectedIndex]);
    }
  };

  return (
    <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Search Messages & Contacts</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Press <kbd className="rounded-xs border bg-muted px-1">ESC</kbd> to exit
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Input Bar */}
        <div className="p-3 border-b bg-muted/20 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDownInput}
              placeholder={
                searchScopeConversationId
                  ? "Search in current conversation..."
                  : "Search messages, people, topics..."
              }
              className="pl-9 pr-9 h-9 text-xs sm:text-sm bg-background"
              aria-label="Search input"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b bg-background">
          <Tabs value={tab} onValueChange={(val) => setTab(val as SearchCategoryTab)}>
            <TabsList className="grid grid-cols-3 h-8 w-full">
              <TabsTrigger value="all" className="text-xs">
                All ({rawResults.length})
              </TabsTrigger>
              <TabsTrigger value="messages" className="text-xs">
                Messages ({rawResults.filter((r) => r.type === "message").length})
              </TabsTrigger>
              <TabsTrigger value="conversations" className="text-xs">
                Chats ({rawResults.filter((r) => r.type === "conversation").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Recent Searches (when query is empty) */}
        {!query && (
          <RecentSearches
            recentQueries={recentQueries}
            onSelectQuery={setQuery}
            onRemoveQuery={(q) => setRecentQueries((prev) => prev.filter((item) => item !== q))}
            onClearAll={() => setRecentQueries([])}
          />
        )}

        {/* Results Container */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {query.trim() && filteredResults.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {!query.trim() && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Type to search conversations and messages across your workspace.
            </div>
          )}

          {filteredResults.map((item, index) => (
            <SearchResultCard
              key={item.id}
              item={item}
              query={query}
              isSelected={index === selectedIndex}
              onSelect={() => handleSelectResult(item)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
