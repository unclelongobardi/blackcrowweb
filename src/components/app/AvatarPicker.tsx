"use client";

import { useMemo, useRef, useState } from "react";
import { PROFILE_AVATARS, type AvatarId, type ProfileAvatar } from "@/lib/avatars";

export type AvatarMode = "preset" | "custom";

type AvatarFilter = "all" | "normal" | "vip" | "election";

const FILTERS: { id: AvatarFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "normal", label: "Normal" },
  { id: "vip", label: "VIP" },
  { id: "election", label: "Election" },
];

function matchesFilter(avatar: ProfileAvatar, filter: AvatarFilter) {
  if (filter === "all") return true;
  if (filter === "election") return avatar.collection === "election";
  return avatar.tier === filter && avatar.collection !== "election";
}

export default function AvatarPicker({
  mode,
  value,
  customPreview,
  onModeChange,
  onChange,
  onUpload,
  uploading,
}: {
  mode: AvatarMode;
  value: AvatarId;
  customPreview?: string | null;
  onModeChange: (mode: AvatarMode) => void;
  onChange: (id: AvatarId) => void;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState<AvatarFilter>("all");

  const avatars = useMemo(
    () => PROFILE_AVATARS.filter((avatar) => matchesFilter(avatar, filter)),
    [filter],
  );

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    await onUpload(file);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Profile avatar</p>
        <p className="text-[11px] text-faint">{PROFILE_AVATARS.length} presets</p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-surface/30 p-1">
        {FILTERS.map((item) => {
          const selected = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-colors ${
                selected ? "bg-foreground text-background" : "text-faint hover:bg-surface/70 hover:text-muted"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid max-h-[360px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
        {avatars.map((av) => {
          const selected = mode === "preset" && value === av.id;
          const badge =
            av.collection === "election" ? "Election" : av.tier === "vip" ? "VIP" : null;
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => {
                onModeChange("preset");
                onChange(av.id);
              }}
              title={av.label}
              className={`group flex h-28 min-w-0 flex-col items-center justify-between rounded-lg border p-2 transition-colors ${
                selected
                  ? "border-bull bg-bull/10"
                  : "border-line bg-surface/30 hover:border-black/15 hover:bg-surface/50"
              }`}
            >
              <span className="relative flex h-16 w-full items-center justify-center rounded-md bg-background/60 ring-1 ring-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={av.src}
                  alt={av.label}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
                {badge && (
                  <span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                    {badge}
                  </span>
                )}
              </span>
              <span
                className={`max-w-full truncate text-[9px] font-medium ${
                  selected ? "text-bull" : "text-faint group-hover:text-muted"
                }`}
              >
                {av.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`rounded-lg border border-dashed p-4 transition-colors ${
          dragOver ? "border-bull bg-bull/5" : "border-line bg-surface/20"
        } ${mode === "custom" ? "border-bull/40 bg-bull/5" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          {customPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={customPreview}
              alt="Your upload"
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-bull/40"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-line bg-surface/60 text-[11px] text-faint">
              No photo
            </div>
          )}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[13px] font-semibold text-foreground">Upload from your device</p>
            <p className="mt-0.5 text-[12px] text-faint">JPG, PNG, WebP or GIF - max 2 MB</p>
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="mt-2 rounded-lg border border-line bg-surface/60 px-3 py-2 text-[11px] font-bold tracking-wide text-foreground transition-colors hover:border-bull/40 disabled:opacity-60"
            >
              {uploading ? "UPLOADING..." : "CHOOSE FILE"}
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void handleFile(f);
          }}
        />
      </div>
    </div>
  );
}
