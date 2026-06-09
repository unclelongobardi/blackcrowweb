"use client";

import { useEffect, useRef, useState } from "react";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem("bc_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("bc_sid", id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

export default function OnlineCounter() {
  const [target, setTarget] = useState(15);
  const [display, setDisplay] = useState(15);
  const raf = useRef<number | null>(null);

  // Heartbeat presence.
  useEffect(() => {
    const sid = getSessionId();
    let alive = true;

    const beat = async () => {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ session_id: sid }),
          keepalive: true,
        });
        const data = await res.json();
        if (alive && typeof data.online === "number") setTarget(Math.max(15, data.online));
      } catch {
        /* ignore */
      }
    };

    beat();
    const interval = setInterval(beat, 20000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  // Animate display toward target.
  useEffect(() => {
    const animate = () => {
      setDisplay((d) => {
        if (d === target) return d;
        const step = Math.max(1, Math.ceil(Math.abs(target - d) / 8));
        return d < target ? Math.min(target, d + step) : Math.max(target, d - step);
      });
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target]);

  return (
    <div>
      <p className="font-mono text-base font-bold leading-none text-foreground">
        {display.toLocaleString()}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-[11px] tracking-[0.12em] text-faint">
        <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
        DEGENS ONLINE
      </p>
    </div>
  );
}
