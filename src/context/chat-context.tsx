"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/context/auth-context";
import {
  loadUserProfile,
  loadUserSettings,
  resetUserProfileStorage,
  resetUserSettingsStorage,
  saveUserProfile,
  saveUserSettings,
} from "@/lib/settings-storage";
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
import type { SearchResultItem } from "@/types/search";
import type { UserProfile, UserSettings } from "@/types/settings";

export type NavTab = "chats" | "favorites" | "archived" | "settings";
export type SettingsCategoryTab =
  "profile" | "appearance" | "notifications" | "privacy" | "chat" | "account" | "danger";

interface ChatContextType {
  currentUser: UserSummary | null;
  userProfile: UserProfile;
  userPreferences: UserSettings;
  conversations: ConversationPreview[];
  selectedConversationId: string | null;
  selectedConversation: ConversationPreview | null;
  messages: Message[];
  typingUsers: string[];
  replyingToMessage: Message | null;
  searchQuery: string;
  categoryFilter: ConversationCategory;
  sortBy: ConversationSortOption;
  navTab: NavTab;
  activeSettingsTab: SettingsCategoryTab;
  mobileSidebarOpen: boolean;
  mobileView: "list" | "chat";
  isLoading: boolean;
  isMessagesLoading: boolean;
  searchModalOpen: boolean;
  searchScopeConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: ConversationCategory) => void;
  setSortBy: (sort: ConversationSortOption) => void;
  setNavTab: (tab: NavTab) => void;
  setActiveSettingsTab: (tab: SettingsCategoryTab) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setMobileView: (view: "list" | "chat") => void;
  setReplyingToMessage: (msg: Message | null) => void;
  setSearchModalOpen: (open: boolean) => void;
  openSearchModal: (conversationIdScope?: string) => void;
  navigateToSearchResult: (item: SearchResultItem) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateUserPreferences: (
    section: keyof UserSettings,
    updates: Partial<UserSettings[keyof UserSettings]>,
  ) => void;
  resetUserProfile: () => void;
  resetUserPreferences: () => void;
  togglePinConversation: (id: string) => Promise<void>;
  toggleMuteConversation: (id: string) => Promise<void>;
  clearSelectedConversation: () => void;
  sendMessage: (content: string, attachment?: AttachmentPreview) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { profile: authProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile);
  const [userPreferences, setUserPreferences] = useState<UserSettings>(loadUserSettings);
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ConversationCategory>("all");
  const [sortBy, setSortBy] = useState<ConversationSortOption>("newest");
  const [navTab, setNavTab] = useState<NavTab>("chats");
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsCategoryTab>("profile");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchScopeConversationId, setSearchScopeConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (authProfile) {
      setUserProfile(authProfile);
    }
  }, [authProfile]);

  const fetchLatestData = async (filter = categoryFilter, query = searchQuery, sort = sortBy) => {
    const [user, list] = await Promise.all([
      conversationRepository.getCurrentUser(),
      conversationRepository.getConversations(filter, query, sort),
    ]);
    const activeProfile = authProfile || userProfile;
    const mergedUser: UserSummary = {
      ...user,
      id: activeProfile.id || user.id,
      name: activeProfile.name || user.name,
      username: activeProfile.username || user.username,
      avatarUrl: activeProfile.avatarUrl || user.avatarUrl,
      statusMessage: activeProfile.statusMessage || user.statusMessage,
      presenceStatus: activeProfile.presenceStatus || user.presenceStatus,
    };
    setCurrentUser(mergedUser);
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
        const activeProfile = authProfile || userProfile;
        const mergedUser: UserSummary = {
          ...user,
          id: activeProfile.id || user.id,
          name: activeProfile.name || user.name,
          username: activeProfile.username || user.username,
          avatarUrl: activeProfile.avatarUrl || user.avatarUrl,
          statusMessage: activeProfile.statusMessage || user.statusMessage,
          presenceStatus: activeProfile.presenceStatus || user.presenceStatus,
        };
        setCurrentUser(mergedUser);
        setConversations(list);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [categoryFilter, searchQuery, sortBy, userProfile, authProfile]);

  useEffect(() => {
    let isMounted = true;

    if (!selectedConversationId) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setMessages([]);
          setTypingUsers([]);
          setReplyingToMessage(null);
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
        setReplyingToMessage(null);
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

  const openSearchModal = (conversationIdScope?: string) => {
    setSearchScopeConversationId(conversationIdScope ?? null);
    setSearchModalOpen(true);
  };

  const navigateToSearchResult = (item: SearchResultItem) => {
    setSelectedConversationId(item.conversationId);
    setMobileView("chat");

    if (item.messageId) {
      setTimeout(() => {
        const targetEl = document.getElementById(`message-${item.messageId}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          targetEl.classList.add("ring-2", "ring-primary", "transition-all", "duration-500");
          setTimeout(() => {
            targetEl.classList.remove("ring-2", "ring-primary");
          }, 2000);
        }
      }, 100);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...updates };
      saveUserProfile(updated);
      return updated;
    });
  };

  const updateUserPreferences = (
    section: keyof UserSettings,
    updates: Partial<UserSettings[keyof UserSettings]>,
  ) => {
    setUserPreferences((prev) => {
      const updated: UserSettings = {
        ...prev,
        [section]: { ...prev[section], ...updates },
      };
      saveUserSettings(updated);
      return updated;
    });
  };

  const resetUserProfile = () => {
    const defaultProf = resetUserProfileStorage();
    setUserProfile(defaultProf);
  };

  const resetUserPreferences = () => {
    const defaultSettings = resetUserSettingsStorage();
    setUserPreferences(defaultSettings);
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

    const replyMetadata = replyingToMessage
      ? {
          replyToMessageId: replyingToMessage.id,
          replyToMessagePreview: {
            senderName: replyingToMessage.senderName,
            content: replyingToMessage.content,
          },
        }
      : {};

    const optimisticMsg: Message = {
      id: `client_msg_${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: currentUser?.id ?? "usr_current",
      senderName: userProfile.name,
      content: trimmed,
      timestamp: new Date().toISOString(),
      status: "pending",
      attachment,
      ...replyMetadata,
      reactions: [],
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyingToMessage(null);

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
      ...replyMetadata,
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

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    const userId = currentUser?.id ?? "usr_current";
    const userName = userProfile.name;

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = m.reactions ?? [];
        const existingIdx = reactions.findIndex((r) => r.emoji === emoji && r.userId === userId);
        let updatedReactions;
        if (existingIdx !== -1) {
          updatedReactions = reactions.filter((_, i) => i !== existingIdx);
        } else {
          updatedReactions = [
            ...reactions,
            { id: `react_${Date.now()}`, messageId, emoji, userId, userName },
          ];
        }
        return { ...m, reactions: updatedReactions };
      }),
    );

    await messageRepository.toggleReaction(messageId, emoji, userId, userName);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, content: newContent, isEdited: true } : m)),
    );
    await messageRepository.editMessage(messageId, newContent);
  };

  const handleDeleteMessage = async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    await messageRepository.deleteMessage(messageId);
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        userProfile,
        userPreferences,
        conversations,
        selectedConversationId,
        selectedConversation,
        messages,
        typingUsers,
        replyingToMessage,
        searchQuery,
        categoryFilter,
        sortBy,
        navTab,
        activeSettingsTab,
        mobileSidebarOpen,
        mobileView,
        isLoading,
        isMessagesLoading,
        searchModalOpen,
        searchScopeConversationId,
        setSelectedConversationId: handleSelectConversation,
        setSearchQuery,
        setCategoryFilter,
        setSortBy,
        setNavTab: handleSetNavTab,
        setActiveSettingsTab,
        setMobileSidebarOpen,
        setMobileView,
        setReplyingToMessage,
        setSearchModalOpen,
        openSearchModal,
        navigateToSearchResult,
        updateUserProfile,
        updateUserPreferences,
        resetUserProfile,
        resetUserPreferences,
        togglePinConversation: handleTogglePin,
        toggleMuteConversation: handleToggleMute,
        clearSelectedConversation: handleClearSelectedConversation,
        sendMessage: handleSendMessage,
        toggleReaction: handleToggleReaction,
        editMessage: handleEditMessage,
        deleteMessage: handleDeleteMessage,
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
