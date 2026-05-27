"use client";

import { use, useEffect, useRef, useState } from "react";
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
 *
 * Two distinct loading modes:
 *  - `loading`      — initial page load (full-screen spinner; sidebar not yet available)
 *  - `chatLoading`  — switching between chats (sidebar stays visible; only content area shows spinner)
 */
export default function ChatPage({ params }: Props) {
  const { id: chatId } = use(params);
  const ready = useAuthGuard();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<ChatDetail | null>(null);
  const [loading, setLoading] = useState(true);        // initial page load
  const [chatLoading, setChatLoading] = useState(false); // per-chat switch
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track whether this is the first load (initial page visit) vs. a chat switch
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (!ready || !chatId) return;

    if (isFirstLoadRef.current) {
      // ── Initial load ──────────────────────────────────────────────────
      isFirstLoadRef.current = false;
      setLoading(true);
      Promise.all([
        chatsApi.list(),
        chatsApi.get(chatId).catch(() => null),
      ])
        .then(([listRes, detail]) => {
          setChats(listRes.items);
          if (!detail) {
            router.replace("/chat");
            return;
          }
          setActiveChat(detail);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      // ── Chat switch ───────────────────────────────────────────────────
      // Clear current chat and show a spinner only in the content area so
      // the sidebar remains visible and navigation feels instantaneous.
      setActiveChat(null);
      setChatLoading(true);
      chatsApi
        .get(chatId)
        .then((detail) => {
          if (!detail) {
            router.replace("/chat");
            return;
          }
          setActiveChat(detail);
        })
        .catch(() => router.replace("/chat"))
        .finally(() => setChatLoading(false));
    }
  }, [ready, chatId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTitleChange = (title: string) => {
    if (!activeChat) return;
    setActiveChat((prev) => (prev ? { ...prev, title } : prev));
    setChats((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, title } : c))
    );
  };

  // ── Initial full-screen load ──────────────────────────────────────────
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
        {chatLoading ? (
          /* Switching chats — keep sidebar, show content-area spinner */
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : activeChat ? (
          <ChatInterface
            key={activeChat.id}
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
