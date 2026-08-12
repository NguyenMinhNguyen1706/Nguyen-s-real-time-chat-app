"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { conversationRepository } from "@/repositories/conversation-repository";
import { messageRepository } from "@/repositories/message-repository";
import type {
  AttachmentPreview,
  ConversationCategory,
  ConversationPreview,
  ConversationSortOption,
  Message,
  UserSummary,
} from "@/types/chat";

export type NavTab = "chats" | "favorites" | "archived" | "settings";

interface ChatContextType {
  currentUser: UserSummary | null;
  conversations: ConversationPreview[];
  selectedConversationId: string | null;
  selectedConversation: ConversationPreview | null;
  messages: Message[];
  typingUsers: string[];
  searchQuery: string;
  categoryFilter: ConversationCategory;
  sortBy: ConversationSortOption;
  navTab: NavTab;
  mobileSidebarOpen: boolean;
  mobileView: "list" | "chat";
  isLoading: boolean;
  isMessagesLoading: boolean;
  setSelectedConversationId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: ConversationCategory) => void;
  setSortBy: (sort: ConversationSortOption) => void;
  setNavTab: (tab: NavTab) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setMobileView: (view: "list" | "chat") => void;
  togglePinConversation: (id: string) => Promise<void>;
  toggleMuteConversation: (id: string) => Promise<void>;
  clearSelectedConversation: () => void;
  sendMessage: (content: string, attachment?: AttachmentPreview) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ConversationCategory>("all");
  const [sortBy, setSortBy] = useState<ConversationSortOption>("newest");
  const [navTab, setNavTab] = useState<NavTab>("chats");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const fetchLatestData = async (filter = categoryFilter, query = searchQuery, sort = sortBy) => {
    const [user, list] = await Promise.all([
      conversationRepository.getCurrentUser(),
      conversationRepository.getConversations(filter, query, sort),
    ]);
    setCurrentUser(user);
    setConversations(list);
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      conversationRepository.getCurrentUser(),
      conversationRepository.getConversations(categoryFilter, searchQuery, sortBy),
    ]).then(([user, list]) => {
      if (isMounted) {
        setCurrentUser(user);
        setConversations(list);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [categoryFilter, searchQuery, sortBy]);

  useEffect(() => {
    let isMounted = true;

    if (!selectedConversationId) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setMessages([]);
          setTypingUsers([]);
          setIsMessagesLoading(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }

    Promise.all([
      messageRepository.getMessagesByConversationId(selectedConversationId),
      messageRepository.getTypingUsers(selectedConversationId),
    ]).then(([msgs, typers]) => {
      if (isMounted) {
        setMessages(msgs);
        setTypingUsers(typers);
        setIsMessagesLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedConversationId]);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) ?? null;

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

  const handleTogglePin = async (id: string) => {
    await conversationRepository.togglePinConversation(id);
    await fetchLatestData();
  };

  const handleToggleMute = async (id: string) => {
    await conversationRepository.toggleMuteConversation(id);
    await fetchLatestData();
  };

  const handleSendMessage = async (content: string, attachment?: AttachmentPreview) => {
    if (!selectedConversationId) return;
    const trimmed = content.trim();
    if (!trimmed && !attachment) return;

    const optimisticMsg: Message = {
      id: `client_msg_${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: currentUser?.id ?? "usr_current",
      senderName: currentUser?.name ?? "Nguyen Minh",
      content: trimmed,
      timestamp: new Date().toISOString(),
      status: "pending",
      attachment,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId
          ? {
              ...c,
              lastMessage: {
                id: optimisticMsg.id,
                senderId: optimisticMsg.senderId,
                senderName: optimisticMsg.senderName,
                content:
                  optimisticMsg.content ||
                  (attachment ? `Sent attachment: ${attachment.name}` : ""),
                timestamp: optimisticMsg.timestamp,
                isUnread: false,
              },
              updatedAt: optimisticMsg.timestamp,
            }
          : c,
      ),
    );

    const created = await messageRepository.sendMessage({
      conversationId: selectedConversationId,
      content: trimmed,
      attachment,
    });

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? { ...m, id: created.id, status: "sent" } : m)),
      );
    }, 300);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === created.id ? { ...m, status: "delivered" } : m)),
      );
    }, 600);
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        conversations,
        selectedConversationId,
        selectedConversation,
        messages,
        typingUsers,
        searchQuery,
        categoryFilter,
        sortBy,
        navTab,
        mobileSidebarOpen,
        mobileView,
        isLoading,
        isMessagesLoading,
        setSelectedConversationId: handleSelectConversation,
        setSearchQuery,
        setCategoryFilter,
        setSortBy,
        setNavTab: handleSetNavTab,
        setMobileSidebarOpen,
        setMobileView,
        togglePinConversation: handleTogglePin,
        toggleMuteConversation: handleToggleMute,
        clearSelectedConversation: handleClearSelectedConversation,
        sendMessage: handleSendMessage,
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
