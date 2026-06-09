"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { timeAgo } from "@/lib/format";
import type { Notification } from "@/lib/types";

export default function NotificationsPage() {
  const api = useApi();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ notifications: Notification[] }>("/api/notifications");
        setNotifications(data.notifications ?? []);
        try {
          await api("/api/notifications", { method: "PATCH" });
        } catch {
          /* mark-read is best-effort */
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load notifications.");
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  return (
    <div className="mx-auto max-w-lg px-5 py-6">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">NOTIFICATIONS</h1>
      <p className="mt-1 text-[13px] text-faint">Bounty updates, acceptances, payouts.</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      ) : error ? (
        <p className="py-16 text-center text-[13px] text-bear">{error}</p>
      ) : notifications.length === 0 ? (
        <p className="py-16 text-center text-[13px] text-faint">Nothing yet. Post or accept a bounty.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border px-4 py-3 ${n.read ? "border-line bg-surface/30" : "border-bull/20 bg-bull/5"}`}
            >
              <p className="text-[13px] text-foreground">{n.body}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[11px] text-faint">{timeAgo(n.created_at)}</span>
                {n.link && (
                  <Link href={n.link} className="text-[11px] font-semibold text-bull hover:underline">
                    View →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
