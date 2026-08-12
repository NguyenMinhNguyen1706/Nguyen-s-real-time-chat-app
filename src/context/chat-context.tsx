"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { conversationRepository } from "@/repositories/conversation-repository";
import type {
  ConversationCategory,
  ConversationPreview,
  UserSummary,
} from "@/types/chat";

export type NavTab = "chats" | "favorites" | "archived" | "settings";

interface ChatContextType {
  currentUser: UserSummary | null;
  conversations: ConversationPreview[];
  selectedConversationId: string | null;
  selectedConversation: ConversationPreview | null;
  searchQuery: string;
  categoryFilter: ConversationCategory;
  navTab: NavTab;
  mobileSidebarOpen: boolean;
  mobileView: "list" | "chat";
  setSelectedConversationId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: ConversationCategory) => void;
  setNavTab: (tab: NavTab) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setMobileView: (view: "list" | "chat") => void;
  clearSelectedConversation: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ConversationCategory>("all");
  const [navTab, setNavTab] = useState<NavTab>("chats");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  useEffect(() => {
    async function loadData() {
      const user = await conversationRepository.getCurrentUser();
      const list = await conversationRepository.getConversations(categoryFilter, searchQuery);
      setCurrentUser(user);
      setConversations(list);
    }
    loadData();
  }, [categoryFilter, searchQuery]);

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) ?? null;

  const handleSelectConversation = (id: string | null) => {
    setSelectedConversationId(id);
    if (id) {
      setMobileView("chat");
    }
  };

  const handleClearSelectedConversation = () => {
    setSelectedConversationId(null);
    setMobileView("list");
  };

  const handleSetNavTab = (tab: NavTab) => {
    setNavTab(tab);
    if (tab === "favorites") {
      setCategoryFilter("favorites");
    } else if (tab === "archived") {
      setCategoryFilter("archived");
    } else if (tab === "chats") {
      setCategoryFilter("all");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        conversations,
        selectedConversationId,
        selectedConversation,
        searchQuery,
        categoryFilter,
        navTab,
        mobileSidebarOpen,
        mobileView,
        setSelectedConversationId: handleSelectConversation,
        setSearchQuery,
        setCategoryFilter,
        setNavTab: handleSetNavTab,
        setMobileSidebarOpen,
        setMobileView,
        clearSelectedConversation: handleClearSelectedConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
