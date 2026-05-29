"use client";

import { useState } from "react";

export default function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="rounded-md border border-line px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:border-white/25 hover:text-foreground"
    >
      {copied ? "Copied" : label ?? "Copy"}
    </button>
  );
}
