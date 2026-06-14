"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { useAppContext } from "@/components/app/appContext";
import Avatar from "@/components/app/Avatar";
import { timeAgo } from "@/lib/format";
import type { DmConversation, DmMessage, Profile } from "@/lib/types";
import { uiBtnPrimary } from "@/lib/uiClasses";

function MessagesContent() {
  const api = useApi();
  const { me } = useAppContext();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("c");
  const toCodename = searchParams.get("to");
  const showThread = Boolean(activeId || toCodename);

  const [conversations, setConversations] = useState<DmConversation[]>([]);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [other, setOther] = useState<Profile | null>(null);
  const [text, setText] = useState("");
  const [newTo, setNewTo] = useState(toCodename ?? "");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
        await loadConversations();
        if (activeId) await loadThread(activeId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load your chats.");
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
    <div className="mx-auto flex h-[calc(100dvh-9rem)] max-w-5xl flex-col gap-4 px-3 py-4 max-lg:min-h-0 lg:h-[calc(100vh-8rem)] lg:flex-row lg:px-5 lg:py-6">
      <aside
        className={`glass flex w-full flex-col rounded-2xl border border-line lg:w-80 lg:max-w-xs ${
          showThread ? "max-lg:hidden" : "flex"
        }`}
      >
        <div className="border-b border-line px-4 py-3">
          <h1 className="font-display text-lg font-extrabold">Chat</h1>
          <p className="mt-0.5 text-[11px] text-faint">Direct messages</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="px-4 py-8 text-[12px] text-faint">
              You haven&apos;t chatted with anyone — yet. When you do, they&apos;ll show up here.
            </p>
          ) : (
            conversations.map((c) => (
              <a
                key={c.id}
                href={`/app/messages?c=${c.id}`}
                className={`flex min-h-[60px] items-center gap-3 border-b border-line px-4 py-3 transition-colors hover:bg-black/[0.03] ${
                  activeId === c.id ? "bg-black/[0.04]" : ""
                }`}
              >
                <Avatar
                  seed={c.other?.avatar_seed}
                  avatarUrl={c.other?.avatar_url}
                  label={c.other?.codename}
                  size={40}
                  verified={c.other?.is_verified || c.other?.codename === "vexora_official"}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{c.other?.codename ?? "…"}</p>
                  <p className="truncate text-[11px] text-faint">{c.last_body ?? "…"}</p>
                </div>
                {c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-bull" />}
              </a>
            ))
          )}
        </div>
      </aside>

      <section
        className={`glass flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-line ${
          showThread ? "flex" : "max-lg:hidden lg:flex"
        }`}
      >
        {error && (
          <p className="border-b border-line px-4 py-3 text-[12px] text-bear">{error}</p>
        )}
        {showThread ? (
          <>
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Link
                href="/app/messages"
                className="ui-nav rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-semibold text-muted lg:hidden"
              >
                ← Back
              </Link>
              {other ? (
                <p className="font-semibold">@{other.codename}</p>
              ) : (
                <input
                  value={newTo}
                  onChange={(e) => setNewTo(e.target.value)}
                  placeholder="@codename"
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                />
              )}
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2.5 text-[13px] sm:max-w-[80%] ${
                    m.sender_id === me?.profile.id
                      ? "ml-auto bg-bull/15 text-foreground"
                      : "bg-surface/60 text-foreground"
                  }`}
                >
                  {m.body}
                  <p className="mt-1 text-[10px] text-faint">{timeAgo(m.created_at)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-line p-3 sm:p-4">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Start a new message"
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-[13px] outline-none"
              />
              <button
                onClick={send}
                disabled={busy}
                className={`${uiBtnPrimary} min-h-11 shrink-0 rounded-xl px-4 py-2.5 text-[12px] font-bold disabled:opacity-60`}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center sm:p-8">
            <p className="text-[14px] font-semibold">Select a message</p>
            <p className="mt-2 text-[13px] text-faint">
              Choose from your existing conversations, or start a new one.
            </p>
            <div className="mt-4 flex w-full max-w-sm gap-2">
              <input
                value={newTo}
                onChange={(e) => setNewTo(e.target.value)}
                placeholder="@codename"
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-[13px] outline-none"
              />
            </div>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start a new message"
              className="mt-2 min-h-11 w-full max-w-sm rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-[13px] outline-none"
            />
            <button
              onClick={send}
              disabled={busy}
              className={`${uiBtnPrimary} mt-3 min-h-11 rounded-xl px-6 py-2.5 text-[12px] font-bold`}
            >
              Send
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
