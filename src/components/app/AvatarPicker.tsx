"use client";

import { useRef, useState } from "react";
import { PROFILE_AVATARS, type AvatarId } from "@/lib/avatars";

export type AvatarMode = "preset" | "custom";

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

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    await onUpload(file);
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Profile avatar</p>

      <div
        className={`rounded-xl border border-dashed p-4 transition-colors ${
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
            <p className="mt-0.5 text-[12px] text-faint">JPG, PNG, WebP or GIF · max 2 MB</p>
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="mt-2 rounded-lg border border-line bg-surface/60 px-3 py-2 text-[11px] font-bold tracking-wide text-foreground transition-colors hover:border-bull/40 disabled:opacity-60"
            >
              {uploading ? "UPLOADING…" : "CHOOSE FILE"}
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

      <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">Or pick a preset</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {PROFILE_AVATARS.map((av) => {
          const selected = mode === "preset" && value === av.id;
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => {
                onModeChange("preset");
                onChange(av.id);
              }}
              title={av.label}
              className={`group flex flex-col items-center gap-1 rounded-xl border p-1.5 transition-colors ${
                selected
                  ? "border-bull bg-bull/10"
                  : "border-line bg-surface/30 hover:border-black/15 hover:bg-surface/50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={av.src}
                alt={av.label}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full bg-surface object-cover ring-1 ring-black/10"
              />
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
    </div>
  );
}
