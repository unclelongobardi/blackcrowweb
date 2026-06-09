"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import Avatar from "@/components/app/Avatar";
import { timeAgo } from "@/lib/format";
import type { DmConversation, DmMessage, Profile } from "@/lib/types";

function MessagesContent() {
  const api = useApi();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("c");
  const toCodename = searchParams.get("to");

  const [conversations, setConversations] = useState<DmConversation[]>([]);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [other, setOther] = useState<Profile | null>(null);
  const [text, setText] = useState("");
  const [newTo, setNewTo] = useState(toCodename ?? "");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadConversations = useCallback(async () => {
    const data = await api<{ conversations: DmConversation[] }>("/api/messages");
    setConversations(data.conversations);
  }, [api]);

  const loadThread = useCallback(async (id: string) => {
    const data = await api<{ messages: DmMessage[]; other: Profile }>(`/api/messages/${id}`);
    setMessages(data.messages);
    setOther(data.other);
  }, [api]);

  useEffect(() => {
    (async () => {
      try {
        await loadConversations();
        if (activeId) await loadThread(activeId);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadConversations, loadThread, activeId]);

  async function send() {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      if (activeId) {
        await api(`/api/messages/${activeId}`, {
          method: "POST",
          body: JSON.stringify({ body: text }),
        });
        await loadThread(activeId);
      } else if (newTo.trim()) {
        const res = await api<{ conversation_id: string }>("/api/messages", {
          method: "POST",
          body: JSON.stringify({ to_codename: newTo, body: text }),
        });
        window.history.replaceState(null, "", `/app/messages?c=${res.conversation_id}`);
        await loadThread(res.conversation_id);
        await loadConversations();
      }
      setText("");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-5xl gap-4 px-5 py-6">
      <aside className="glass flex w-full max-w-xs flex-col rounded-2xl border border-line lg:w-80">
        <div className="border-b border-line px-4 py-3">
          <h1 className="font-display text-lg font-extrabold">MESSAGES</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="px-4 py-8 text-[12px] text-faint">No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <a
                key={c.id}
                href={`/app/messages?c=${c.id}`}
                className={`flex items-center gap-3 border-b border-line px-4 py-3 transition-colors hover:bg-white/[0.02] ${
                  activeId === c.id ? "bg-white/[0.04]" : ""
                }`}
              >
                <Avatar seed={c.other.avatar_seed} label={c.other.codename} size={36} verified={c.other.is_verified} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{c.other.codename}</p>
                  <p className="truncate text-[11px] text-faint">{c.last_body ?? "…"}</p>
                </div>
                {c.unread && <span className="h-2 w-2 rounded-full bg-bull" />}
              </a>
            ))
          )}
        </div>
      </aside>

      <section className="glass flex min-w-0 flex-1 flex-col rounded-2xl border border-line">
        {activeId || toCodename ? (
          <>
            <div className="border-b border-line px-4 py-3">
              {other ? (
                <p className="font-semibold">@{other.codename}</p>
              ) : (
                <input
                  value={newTo}
                  onChange={(e) => setNewTo(e.target.value)}
                  placeholder="@codename"
                  className="w-full bg-transparent text-[13px] outline-none"
                />
              )}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] ${
                    m.sender_id === other?.id
                      ? "bg-surface/60 text-foreground"
                      : "ml-auto bg-bull/15 text-foreground"
                  }`}
                >
                  {m.body}
                  <p className="mt-1 text-[10px] text-faint">{timeAgo(m.created_at)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-line p-4">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Write a message…"
                className="flex-1 rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-[13px] outline-none"
              />
              <button
                onClick={send}
                disabled={busy}
                className="rounded-xl bg-foreground px-4 py-2.5 text-[12px] font-bold text-black disabled:opacity-60"
              >
                SEND
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <p className="text-[14px] font-semibold">Start a conversation</p>
            <p className="mt-2 text-[13px] text-faint">Message someone from their profile, or enter a codename below.</p>
            <div className="mt-4 flex w-full max-w-sm gap-2">
              <input
                value={newTo}
                onChange={(e) => setNewTo(e.target.value)}
                placeholder="@codename"
                className="flex-1 rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-[13px] outline-none"
              />
            </div>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="First message…"
              className="mt-2 w-full max-w-sm rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-[13px] outline-none"
            />
            <button onClick={send} disabled={busy} className="mt-3 rounded-xl bg-foreground px-6 py-2.5 text-[12px] font-bold text-black">
              SEND
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-faint">Loading…</div>}>
      <MessagesContent />
    </Suspense>
  );
}
