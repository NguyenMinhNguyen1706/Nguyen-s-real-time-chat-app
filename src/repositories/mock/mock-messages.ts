import type { Message } from "@/types/chat";

const NOW = new Date();

const makeIso = (daysAgo: number, hoursAgo: number, minutesAgo: number): string => {
  const d = new Date(NOW.getTime());
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
};

export const MOCK_MESSAGES_MAP: Record<string, Message[]> = {
  conv_1: [
    {
      id: "msg_101",
      conversationId: "conv_1",
      senderId: "usr_1",
      senderName: "Sarah Chen",
      senderAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      content: "Hi Nguyen! How is the real-time chat architecture coming along?",
      timestamp: makeIso(1, 4, 30),
      status: "read",
    },
    {
      id: "msg_102",
      conversationId: "conv_1",
      senderId: "usr_1",
      senderName: "Sarah Chen",
      senderAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      content: "We need to ensure the design tokens and layout scale cleanly on mobile devices.",
      timestamp: makeIso(1, 4, 28),
      status: "read",
    },
    {
      id: "msg_103",
      conversationId: "conv_1",
      senderId: "usr_current",
      senderName: "Nguyen Minh",
      content:
        "Hey Sarah! It's going great. The application shell and state plumbing are completely finished.",
      timestamp: makeIso(1, 4, 20),
      status: "read",
    },
    {
      id: "msg_104",
      conversationId: "conv_1",
      senderId: "usr_current",
      senderName: "Nguyen Minh",
      content:
        "Here is the updated documentation link: https://github.com/NguyenMinhNguyen1706/Nguyen-s-real-time-chat-app\n\nIt covers the full spec-driven development workflow and design system guidelines.",
      timestamp: makeIso(1, 4, 18),
      status: "read",
    },
    {
      id: "msg_105",
      conversationId: "conv_1",
      senderId: "usr_1",
      senderName: "Sarah Chen",
      senderAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      content: "Awesome work! Today we should polish the conversation timeline & grouping logic.",
      timestamp: makeIso(0, 1, 15),
      status: "read",
    },
    {
      id: "msg_106",
      conversationId: "conv_1",
      senderId: "usr_1",
      senderName: "Sarah Chen",
      senderAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      content:
        "Can you review the PR for the message component? It includes multiline text support, custom status badges, and accessibility improvements for screen readers.",
      timestamp: makeIso(0, 0, 10),
      status: "read",
      isUnread: true,
    },
    {
      id: "msg_107",
      conversationId: "conv_1",
      senderId: "usr_current",
      senderName: "Nguyen Minh",
      content: "I am reviewing it right now. Everything looks solid!",
      timestamp: makeIso(0, 0, 2),
      status: "delivered",
    },
  ],

  conv_2: [
    {
      id: "msg_201",
      conversationId: "conv_2",
      senderId: "usr_2",
      senderName: "Alex Rivers",
      senderAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      content: "Did you check the Redis pub/sub channels for presence detection?",
      timestamp: makeIso(2, 6, 0),
      status: "read",
    },
    {
      id: "msg_202",
      conversationId: "conv_2",
      senderId: "usr_current",
      senderName: "Nguyen Minh",
      content: "Yes, Redis adapter is ready for TASK 06 real-time integration.",
      timestamp: makeIso(2, 5, 45),
      status: "read",
    },
  ],

  conv_3: [
    {
      id: "msg_301",
      conversationId: "conv_3",
      senderId: "usr_1",
      senderName: "Sarah Chen",
      senderAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      content: "Team, let's sync on the sprint deployment for Next.js 16.",
      timestamp: makeIso(0, 2, 0),
      status: "read",
    },
    {
      id: "msg_302",
      conversationId: "conv_3",
      senderId: "usr_3",
      senderName: "Marcus Vance",
      senderAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      content: "I updated the Turbopack build config. Build times are down to 500ms!",
      timestamp: makeIso(0, 1, 45),
      status: "read",
    },
    {
      id: "msg_303",
      conversationId: "conv_3",
      senderId: "usr_2",
      senderName: "Alex Rivers",
      senderAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      content: "Great! All unit and E2E tests are passing on CI.",
      timestamp: makeIso(0, 0, 30),
      status: "read",
    },
  ],

  conv_empty: [],
};

export const MOCK_TYPING_USERS: Record<string, string[]> = {
  conv_1: ["Sarah Chen"],
};
