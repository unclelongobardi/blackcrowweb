"use client";

import BountyCard from "./BountyCard";
import RightPanel from "./RightPanel";
import type { Bounty, Market } from "@/lib/types";

export default function AllBountiesSidebar({
  bounties,
  markets,
  selectedId,
  onSelect,
  onShareToWarRoom,
  onUpdate,
}: {
  bounties: Bounty[];
  markets: Market[];
  selectedId?: string | null;
  onSelect: (b: Bounty) => void;
  onShareToWarRoom: (b: Bounty) => void;
  onUpdate: (b: Bounty) => void;
}) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[360px] shrink-0 flex-col border-l border-line bg-surface/10 xl:flex">
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <h2 className="section-label">All bounties</h2>
        <span className="font-mono text-[11px] text-faint">{bounties.length}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {bounties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center">
            <p className="text-[13px] font-bold text-foreground">No bounties yet</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-faint">
              Post from the left sidebar or pick a thin market to launch the first job.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bounties.map((b) => (
              <div key={b.id} id={`bounty-${b.id}`} className="scroll-mt-24">
                <BountyCard
                  bounty={b}
                  onUpdate={onUpdate}
                  compact
                  selected={selectedId === b.id}
                  onSelect={() => onSelect(b)}
                  onShareToWarRoom={() => onShareToWarRoom(b)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-line p-3">
        <RightPanel markets={markets} />
      </div>
    </aside>
  );
}
