"use client";

import { PROFILE_AVATARS, type AvatarId } from "@/lib/avatars";

export default function AvatarPicker({
  value,
  onChange,
}: {
  value: AvatarId;
  onChange: (id: AvatarId) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Profile avatar</p>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {PROFILE_AVATARS.map((av) => {
          const selected = value === av.id;
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => onChange(av.id)}
              title={av.label}
              className={`group flex flex-col items-center gap-1 rounded-xl border p-1.5 transition-colors ${
                selected
                  ? "border-bull bg-bull/10"
                  : "border-line bg-surface/30 hover:border-white/20 hover:bg-surface/50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={av.src}
                alt={av.label}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full bg-surface object-cover ring-1 ring-white/10"
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
