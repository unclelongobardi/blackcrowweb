"use client";

import { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Avatar from "./Avatar";
import { useAppContext } from "./appContext";
import { useApi } from "@/lib/useApi";
import { uiBtnPrimary, uiPress } from "@/lib/uiClasses";
import { lamportsToSol } from "@/lib/solanaFormat";
import { pct } from "@/lib/format";
import SolAmount from "./SolAmount";
import {
  IconGrid,
  IconImage,
  IconPoll,
  IconThread,
  IconChevronDown,
  IconCabal,
} from "@/components/icons";
import type { Bounty, Cabal, Market } from "@/lib/types";

type Sentiment = "bullish" | "bearish" | "neutral";
type PostMode = "text" | "market" | "image" | "poll" | "thread";

export type PostAudience =
  | { scope: "everyone" }
  | { scope: "cabal"; cabal: Cabal };

export type CreatePostPayload = {
  bountyId?: string | null;
  cabalId?: string | null;
  marketId?: string | null;
  market?: Market | null;
  imageUrl?: string | null;
  pollOptions?: string[];
  threadParts?: string[];
};

const MODES: { id: PostMode; label: string; icon: typeof IconGrid }[] = [
  { id: "market", label: "Market", icon: IconGrid },
  { id: "image", label: "Image", icon: IconImage },
  { id: "poll", label: "Poll", icon: IconPoll },
  { id: "thread", label: "Thread", icon: IconThread },
];

const SENTIMENTS: { id: Sentiment; label: string; dot: string }[] = [
  { id: "bullish", label: "Bullish", dot: "bg-bull" },
  { id: "bearish", label: "Bearish", dot: "bg-bear" },
  { id: "neutral", label: "Neutral", dot: "bg-faint" },
];

export default function CreatePost({
  onSubmit,
  attachedBounty,
  onClearBounty,
}: {
  onSubmit: (content: string, sentiment: Sentiment, opts?: CreatePostPayload) => Promise<void>;
  attachedBounty?: Bounty | null;
  onClearBounty?: () => void;
}) {
  const api = useApi();
  const { getAccessToken } = usePrivy();
  const { me } = useAppContext();
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment>("neutral");
  const [loading, setLoading] = useState(false);
  const [audience, setAudience] = useState<PostAudience>({ scope: "everyone" });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<PostMode>("text");
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [marketQuery, setMarketQuery] = useState("");
  const [marketResults, setMarketResults] = useState<Market[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [threadParts, setThreadParts] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (attachedBounty && !content.trim() && mode === "text") {
      setContent(`Bounty: ${attachedBounty.title} — `);
    }
  }, [attachedBounty]); // eslint-disable-line react-hooks/exhaustive-deps

  const myCabals = (me?.member_cabals ?? []) as Cabal[];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  useEffect(() => {
    if (mode !== "market") return;
    const t = setTimeout(async () => {
      setMarketLoading(true);
      try {
        const params = new URLSearchParams({ limit: "12", sort: "volume" });
        if (marketQuery.trim()) params.set("q", marketQuery.trim());
        const data = await api<{ markets: Market[] }>(`/api/markets?${params}`);
        setMarketResults(data.markets);
      } catch {
        setMarketResults([]);
      } finally {
        setMarketLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [api, marketQuery, mode]);

  function selectMode(next: PostMode) {
    setError(null);
    setMode((m) => (m === next ? "text" : next));
    if (next === "image") imageInputRef.current?.click();
  }

  function onImagePick(file: File | null) {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMode("image");
  }

  function clearImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (mode === "image") setMode("text");
  }

  function clearMarket() {
    setSelectedMarket(null);
    if (mode === "market") setMode("text");
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return null;
    setUploadingImage(true);
    try {
      const token = await getAccessToken();
      const form = new FormData();
      form.append("file", imageFile);
      const res = await fetch("/api/posts/image", {
        method: "POST",
        headers: token ? { authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Image upload failed.");
      return data.image_url as string;
    } finally {
      setUploadingImage(false);
    }
  }

  function canSubmit(): boolean {
    if (mode === "thread") {
      return threadParts.filter((p) => p.trim()).length >= 2;
    }
    if (mode === "poll") {
      return content.trim().length > 0 && pollOptions.filter((o) => o.trim()).length >= 2;
    }
    if (mode === "image") {
      return content.trim().length > 0 && !!imageFile;
    }
    if (mode === "market") {
      return content.trim().length > 0 && !!selectedMarket;
    }
    return content.trim().length > 0;
  }

  async function submit() {
    if (!canSubmit() || loading || uploadingImage) return;
    setLoading(true);
    setError(null);
    try {
      let imageUrl: string | null = null;
      if (mode === "image" && imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) throw new Error("Could not upload image.");
      }

      const cleanPoll = pollOptions.map((o) => o.trim()).filter(Boolean);
      const cleanThread = threadParts.map((p) => p.trim()).filter(Boolean);

      await onSubmit(mode === "thread" ? cleanThread[0]! : content.trim(), sentiment, {
        bountyId: attachedBounty?.id ?? null,
        cabalId: audience.scope === "cabal" ? audience.cabal.id : null,
        marketId: selectedMarket?.id ?? null,
        market: selectedMarket,
        imageUrl,
        pollOptions: mode === "poll" ? cleanPoll : undefined,
        threadParts: mode === "thread" ? cleanThread : undefined,
      });

      setContent("");
      setSentiment("neutral");
      setAudience({ scope: "everyone" });
      setMode("text");
      setSelectedMarket(null);
      setMarketQuery("");
      clearImage();
      setPollOptions(["", ""]);
      setThreadParts(["", ""]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post.");
    } finally {
      setLoading(false);
    }
  }

  const active = SENTIMENTS.find((s) => s.id === sentiment)!;
  const audienceLabel = audience.scope === "everyone" ? "Everyone" : audience.cabal.name;

  return (
    <div className="border-b border-line px-4 py-4 sm:px-5">
      <div className="flex gap-3">
        <Avatar seed={me?.profile.avatar_seed} avatarUrl={me?.profile.avatar_url} label={me?.profile.codename} size={42} />
        <div className="min-w-0 flex-1">
          {attachedBounty && (
            <div className="mb-2 flex items-start justify-between gap-2 rounded-xl border border-bull/25 bg-bull/5 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-bull">Attached bounty</p>
                <p className="mt-0.5 truncate text-[13px] font-semibold text-foreground">{attachedBounty.title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted">
                  <SolAmount amount={lamportsToSol(attachedBounty.reward_sol_lamports)} className="font-mono" iconClassName="h-3 w-3" />
                  <span>· {attachedBounty.status}</span>
                </div>
              </div>
              {onClearBounty && (
                <button type="button" onClick={onClearBounty} className="shrink-0 text-[11px] font-semibold text-faint hover:text-foreground">
                  Remove
                </button>
              )}
            </div>
          )}

          {mode === "thread" ? (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-bull">Thread · {threadParts.length} parts</p>
              {threadParts.map((part, i) => (
                <div key={i} className="flex gap-2">
                  <span className="mt-2 font-mono text-[11px] text-faint">{i + 1}.</span>
                  <textarea
                    value={part}
                    onChange={(e) => {
                      const next = [...threadParts];
                      next[i] = e.target.value;
                      setThreadParts(next);
                    }}
                    placeholder={i === 0 ? "Opening take…" : `Part ${i + 1}…`}
                    rows={2}
                    maxLength={600}
                    className="min-w-0 flex-1 resize-none rounded-xl border border-line bg-surface/30 px-3 py-2 text-[14px] text-foreground placeholder:text-faint outline-none focus:border-bull/40"
                  />
                </div>
              ))}
              {threadParts.length < 6 && (
                <button
                  type="button"
                  onClick={() => setThreadParts([...threadParts, ""])}
                  className="text-[11px] font-semibold text-bull hover:underline"
                >
                  + Add part
                </button>
              )}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                mode === "poll"
                  ? "Ask the crew…"
                  : audience.scope === "cabal"
                    ? `Post to ${audience.cabal.name}…`
                    : "What's happening?"
              }
              rows={mode === "poll" || mode === "market" ? 2 : 2}
              maxLength={600}
              className="w-full resize-none bg-transparent pt-1.5 text-[15px] text-foreground placeholder:text-faint outline-none"
            />
          )}

          {mode === "market" && (
            <div className="mt-2 rounded-xl border border-line bg-surface/30 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-faint">Attach Polymarket</p>
              {selectedMarket ? (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-bull/30 bg-bull/5 px-3 py-2">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[13px] font-semibold text-foreground">{selectedMarket.question}</p>
                    {selectedMarket.yes_price != null && (
                      <p className="mt-0.5 font-mono text-[11px] text-bull">YES {pct(selectedMarket.yes_price)}</p>
                    )}
                  </div>
                  <button type="button" onClick={clearMarket} className="shrink-0 text-[11px] text-faint hover:text-foreground">
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={marketQuery}
                    onChange={(e) => setMarketQuery(e.target.value)}
                    placeholder="Search markets…"
                    className="mt-2 w-full rounded-lg border border-line bg-surface/60 px-3 py-2 text-[13px] outline-none focus:border-bull/40"
                  />
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {marketLoading ? (
                      <p className="py-3 text-center text-[12px] text-faint">Loading…</p>
                    ) : marketResults.length === 0 ? (
                      <p className="py-3 text-center text-[12px] text-faint">No markets found</p>
                    ) : (
                      marketResults.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMarket(m)}
                          className="block w-full border-b border-line px-2 py-2 text-left last:border-0 hover:bg-black/[0.05]"
                        >
                          <p className="line-clamp-2 text-[12px] font-medium text-foreground">{m.question}</p>
                          {m.yes_price != null && (
                            <p className="mt-0.5 font-mono text-[10px] text-bull">YES {pct(m.yes_price)}</p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {mode === "poll" && (
            <div className="mt-2 space-y-2 rounded-xl border border-line bg-surface/30 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-faint">Poll options</p>
              {pollOptions.map((opt, i) => (
                <input
                  key={i}
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[i] = e.target.value;
                    setPollOptions(next);
                  }}
                  placeholder={`Option ${i + 1}`}
                  maxLength={80}
                  className="w-full rounded-lg border border-line bg-surface/60 px-3 py-2 text-[13px] outline-none focus:border-bull/40"
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="text-[11px] font-semibold text-bull hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {mode === "image" && imagePreview && (
            <div className="relative mt-2 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Upload preview" className="max-h-48 rounded-xl border border-line object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-white"
              >
                Remove
              </button>
            </div>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              onImagePick(f ?? null);
            }}
          />

          {error && <p className="mt-2 text-[12px] text-bear">{error}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {MODES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectMode(t.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                  mode === t.id
                    ? "bg-bull/15 text-bull"
                    : "text-muted hover:bg-black/[0.05] hover:text-foreground"
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}

            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-line p-0.5 max-sm:w-full max-sm:justify-between sm:w-auto">
                {SENTIMENTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSentiment(s.id)}
                    title={s.label}
                    className={`${uiPress} flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ${
                      sentiment === s.id ? "bg-black/[0.05] text-foreground" : "text-faint hover:text-muted"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.id === sentiment ? s.label : ""}
                  </button>
                ))}
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex max-w-[160px] items-center gap-1 rounded-lg border border-line px-2 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-black/15 hover:text-foreground"
                >
                  {audience.scope === "cabal" ? (
                    <IconCabal className="h-3.5 w-3.5 shrink-0 text-bull" />
                  ) : (
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active.dot}`} />
                  )}
                  <span className="truncate">{audienceLabel}</span>
                  <IconChevronDown className={`h-3.5 w-3.5 shrink-0 text-faint transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 z-30 mt-1 min-w-[200px] max-w-[260px] overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setAudience({ scope: "everyone" });
                        setMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] hover:bg-black/[0.05] ${
                        audience.scope === "everyone" ? "bg-black/[0.05] font-semibold text-foreground" : "text-muted"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-faint" />
                      Everyone
                      <span className="ml-auto text-[10px] text-faint">Public timeline</span>
                    </button>
                    {myCabals.length > 0 && (
                      <>
                        <div className="border-t border-line px-3 py-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-faint">Your cabals</p>
                        </div>
                        {myCabals.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setAudience({ scope: "cabal", cabal: c });
                              setMenuOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] hover:bg-black/[0.05] ${
                              audience.scope === "cabal" && audience.cabal.id === c.id
                                ? "bg-bull/10 font-semibold text-foreground"
                                : "text-muted"
                            }`}
                          >
                            <IconCabal className="h-3.5 w-3.5 shrink-0 text-bull/80" />
                            <span className="truncate">{c.name}</span>
                          </button>
                        ))}
                      </>
                    )}
                    {myCabals.length === 0 && (
                      <p className="border-t border-line px-3 py-2.5 text-[11px] text-faint">
                        Join a cabal to post to members only.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit() || loading || uploadingImage}
                className={`${uiBtnPrimary} rounded-lg px-5 py-2 text-[13px] font-bold disabled:opacity-40`}
              >
                {loading || uploadingImage ? "…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
