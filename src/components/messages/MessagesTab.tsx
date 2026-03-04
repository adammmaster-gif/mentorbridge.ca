"use client";
import { useState, useEffect, useRef } from "react";
import { AV_COLORS } from "@/lib/constants";
import type { Conversation, Message, UserProfile } from "@/types";

interface Props {
  profile: UserProfile;
  userId: number;
}

export default function MessagesTab({ profile, userId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load conversations
  useEffect(() => {
    fetchConversations();
  }, [userId]);

  // Poll for new messages every 10s when a conversation is open
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      pollRef.current = setInterval(() => fetchMessages(activeConvId), 10000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    setLoadingConvs(true);
    const res = await fetch(`/api/conversations?userId=${userId}`);
    if (res.ok) setConversations(await res.json());
    setLoadingConvs(false);
  }

  async function fetchMessages(convId: number) {
    const res = await fetch(`/api/conversations/${convId}/messages?userId=${userId}`);
    if (res.ok) {
      setMessages(await res.json());
      fetchConversations(); // refresh unread counts
    }
  }

  async function openConversation(convId: number) {
    setActiveConvId(convId);
  }

  async function sendMessage() {
    if (!input.trim() || !activeConvId || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    await fetch(`/api/conversations/${activeConvId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: userId, text }),
    });
    setSending(false);
    fetchMessages(activeConvId);
  }

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="msg-shell">
      {/* Left: conversation list */}
      <div className="msg-list">
        <div className="msg-list-hd">Messages</div>
        {loadingConvs ? (
          <div className="empty-state" style={{ padding: "24px 16px", fontSize: "0.82rem", color: "#637088" }}>
            Loading…
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-state" style={{ padding: "24px 16px", fontSize: "0.82rem" }}>
            No messages yet. Book a session to start a conversation.
          </div>
        ) : (
          conversations.map((c) => {
            const color = AV_COLORS[c.otherUser.avatarColor] ?? "#22D4C0";
            return (
              <div
                key={c.id}
                className={`msg-row ${activeConvId === c.id ? "active" : ""}`}
                onClick={() => openConversation(c.id)}
              >
                <div className="msg-av" style={{ background: color }}>{c.otherUser.initials}</div>
                <div className="msg-meta">
                  <div className="msg-name">{c.otherUser.name}</div>
                  <div className="msg-last">{c.lastMessage || "No messages yet"}</div>
                </div>
                {c.unreadCount > 0 && (
                  <div className="msg-badge">{c.unreadCount}</div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Right: thread */}
      <div className="msg-thread">
        {!activeConvId ? (
          <div className="msg-empty">Select a conversation to read messages</div>
        ) : (
          <>
            <div className="msg-thread-hd">
              {activeConv && (
                <>
                  <div
                    className="msg-av"
                    style={{ background: AV_COLORS[activeConv.otherUser.avatarColor] ?? "#22D4C0", width: 32, height: 32, fontSize: "0.72rem" }}
                  >
                    {activeConv.otherUser.initials}
                  </div>
                  <span>{activeConv.otherUser.name}</span>
                  <span style={{ color: "#637088", fontSize: "0.72rem" }}>
                    · {activeConv.otherUser.role === "mentor" ? "Mentor" : "Student"}
                  </span>
                </>
              )}
            </div>

            <div className="msg-bubbles">
              {messages.map((m) => {
                if (m.isSystem) {
                  return (
                    <div key={m.id} className="msg-system">{m.text}</div>
                  );
                }
                const mine = m.senderId === userId;
                return (
                  <div key={m.id} className={`msg-bubble ${mine ? "mine" : "theirs"}`}>
                    {m.text}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="msg-input-row">
              <input
                className="msg-input"
                placeholder={`Message ${activeConv?.otherUser.name ?? ""}…`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
              />
              <button className="btn btn-primary btn-sm" onClick={sendMessage} disabled={!input.trim() || sending}>
                {sending ? "…" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
