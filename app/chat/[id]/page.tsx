"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatInterface from "@/components/chat/ChatInterface";
import { chatsApi } from "@/lib/api/chats";
import { Chat, ChatDetail } from "@/lib/types/chat";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * /chat/[id] — Full chat page with sidebar + chat interface.
 */
export default function ChatPage({ params }: Props) {
  const { id: chatId } = use(params);
  const ready = useAuthGuard();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<ChatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load sidebar list + active chat detail in parallel
  useEffect(() => {
    if (!ready || !chatId) return;

    setLoading(true);
    Promise.all([
      chatsApi.list(),
      chatsApi.get(chatId).catch(() => null),
    ])
      .then(([listRes, detail]) => {
        setChats(listRes.items);
        if (!detail) {
          // Chat not found or access denied — redirect to chat index
          router.replace("/chat");
          return;
        }
        setActiveChat(detail);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ready, chatId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTitleChange = (title: string) => {
    if (!activeChat) return;
    setActiveChat((prev) => (prev ? { ...prev, title } : prev));
    setChats((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, title } : c))
    );
  };

  if (!ready || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ChatSidebar
        activeChatId={chatId}
        chats={chats}
        onChatsChange={setChats}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
        {activeChat ? (
          <ChatInterface
            chat={activeChat}
            onTitleChange={handleTitleChange}
            mobileMenuOpen={mobileOpen}
            onMobileMenuOpen={() => setMobileOpen(true)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            Chat not found.
          </div>
        )}
      </div>
    </div>
  );
}
