"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TokenCaChip from "@/components/TokenCaChip";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "getting-started", label: "Getting started" },
  { id: "hub-layout", label: "Hub layout" },
  { id: "bounties", label: "Bounties" },
  { id: "sol-pools", label: "SOL & pools" },
  { id: "home", label: "Home" },
  { id: "markets", label: "Markets" },
  { id: "feathers", label: "Feathers" },
  { id: "cabals", label: "Cabals" },
  { id: "social", label: "Social layer" },
  { id: "official", label: "Official account" },
  { id: "token", label: "Token ($CROW)" },
  { id: "glossary", label: "Glossary" },
] as const;

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-line py-10 last:border-b-0">
      <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">{title}</h2>
      <div className="mt-4 space-y-4 text-[14px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[13px] font-bold uppercase tracking-wide text-foreground/90">{title}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-muted">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li key={step} className="flex gap-3 rounded-xl border border-line bg-surface/30 px-4 py-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-bull/15 font-mono text-[11px] font-bold text-bull">
            {i + 1}
          </span>
          <span className="text-[13px] text-foreground/90">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default function DocsContent() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-10">
      <nav className="sticky top-16 z-10 -mx-4 mb-6 flex gap-1.5 overflow-x-auto border-b border-line bg-background/95 px-4 py-3 backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors ${
              active === s.id ? "bg-bull/10 text-bull" : "text-faint hover:bg-white/[0.03] hover:text-muted"
            }`}
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="flex gap-10">
      <aside className="hidden w-52 shrink-0 lg:block">
        <nav className="sticky top-28 space-y-1">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-faint">On this page</p>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`block rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                active === s.id ? "bg-bull/10 text-bull" : "text-faint hover:bg-white/[0.03] hover:text-muted"
              }`}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>

      <article className="min-w-0 flex-1 pb-16 sm:pb-20">
        <header className="mb-8">
          <p className="section-label">BLACKCROW documentation</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            How the platform works
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Coordinate market manipulation plays and surface actionable intel—thin books ranked for
            exploitability, SOL-funded bounties for execution, cabal ops, and the Home feed.
          </p>
        </header>

        <DocSection id="overview" title="Overview">
          <p>
            BLACKCROW is a Solana-native coordination layer for operators who want to move prediction-market
            odds—not just watch them. Connect a wallet (Phantom or Solflare), pick a codename, and enter{" "}
            <strong className="text-foreground">The Nest</strong> at{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px]">/app</code>.
          </p>
          <p>
            The workflow is built around four loops: <strong className="text-foreground">Market intel</strong> (thin
            books and exploit scores from Polymarket), <strong className="text-foreground">Bounties</strong> (SOL to
            fund research, field ops, or timed coordination), <strong className="text-foreground">Home</strong>{" "}
            (your public timeline—thesis and play-by-play before execution), and <strong className="text-foreground">Cabals</strong>{" "}
            (aligned crews—especially MARKET OPS—for private coordination).
          </p>
          <p>
            Payouts and rank are separate: SOL settles on-chain when a bounty is approved;{" "}
            <strong className="text-foreground">Feathers</strong> track who is consistently sourcing intel and
            running plays—visible on The Roost and in search.
          </p>
        </DocSection>

        <DocSection id="getting-started" title="Getting started">
          <Sub title="1. Connect wallet">
            <p>
              From the landing page, click <strong className="text-foreground">JOIN THE NETWORK</strong> or{" "}
              <strong className="text-foreground">LOGIN</strong>. Privy opens a Solana-only wallet modal (Phantom /
              Solflare). No email signup.
            </p>
          </Sub>
          <Sub title="2. Open Home">
            <p>
              After a successful connection on the landing, you are sent directly to{" "}
              <Link href="/app" className="text-bull hover:underline">
                /app
              </Link>{" "}
              — Home, where live intel, open bounties, and thin-book targets sit in one view.
            </p>
          </Sub>
          <Sub title="3. Onboarding (first visit)">
            <List
              items={[
                "Choose a unique codename (your @handle and profile URL).",
                "Optional display name and bio.",
                "Your connected wallet address is linked to your profile.",
                "Until onboarding completes, a full-screen setup modal blocks the app.",
              ]}
            />
          </Sub>
          <Sub title="4. Account page">
            <p>
              Wallet details and disconnect live at{" "}
              <Link href="/account" className="text-bull hover:underline">
                /account
              </Link>
              . Profile stats and edits are under{" "}
              <Link href="/app/profile" className="text-bull hover:underline">
                /app/profile
              </Link>
              .
            </p>
          </Sub>
        </DocSection>

        <DocSection id="hub-layout" title="Hub layout (/app)">
          <p>
            The hub is a three-column command surface on large screens—built so you can spot a target, fund a
            play, and broadcast the thesis without switching tabs:
          </p>
          <List
            items={[
              "Left sidebar — Post bounties, scan open jobs, and jump to thin markets worth pushing.",
              "Center — Home: your timeline for intel, sentiment, and coordination posts. Default focus of the hub.",
              "Right sidebar — Full bounty cards (accept, fund, share) plus live Thin books ranked for exploitability.",
            ]}
          />
          <Sub title="Selecting & sharing a bounty">
            <Flow
              steps={[
                "Select a bounty from the right sidebar—the play you want the room aligned on.",
                "Press POST TO HOME to pin it to the composer.",
                "Post your thesis—timing, side, size—so the crew sees the target and the job in one card.",
              ]}
            />
          </Sub>
        </DocSection>

        <DocSection id="bounties" title="Bounties">
          <p>
            A bounty is a SOL-funded task tied to a market or manipulation thesis. The poster locks escrow; an
            operator accepts, executes or researches, submits proof; the creator approves or rejects. This is how
            you pay for on-the-ground work, narrative setup, or timed coordination around a thin book.
          </p>
          <Sub title="Bounty kinds">
            <List
              items={[
                "Field op — real-world action that supports a play (proof, presence, execution on the ground).",
                "Intel — research, flow analysis, or narrative that changes how the room reads a market.",
                "Coordination — rallying operators, cabal timing, or multi-wallet alignment before a push.",
              ]}
            />
          </Sub>
          <Sub title="Status lifecycle">
            <Flow
              steps={[
                "Funding — creator created the bounty; SOL not yet deposited.",
                "Open — deposit confirmed; anyone can join, boost the pool, or submit proof.",
                "In progress — one or more operators joined; more can still join until expiry.",
                "Review — proof(s) submitted with text, photos, or video; creator picks who fulfilled the job.",
                "Paid — creator approved a submission; winner receives the full pool on-chain.",
                "Expired — deadline passed (usually tied to the linked market close).",
              ]}
            />
          </Sub>
          <Sub title="Roles">
            <List
              items={[
                "Creator — posts the bounty, deposits initial SOL, and is the only account that can approve or reject each proof.",
                "Participant — joins an open bounty, submits proof (text + images/video), may receive the pool if approved.",
                "Contributor — optional; adds SOL to boost the pool while open or in progress (non-official bounties only).",
              ]}
            />
          </Sub>
          <Sub title="Expiry">
            <p>
              Bounties linked to a Polymarket market inherit that market&apos;s{" "}
              <code className="font-mono text-[12px]">end_date</code> as their deadline. After expiry, new joins and
              submissions are blocked and open bounties move to expired status.
            </p>
          </Sub>
          <Sub title="Creating a bounty">
            <List
              items={[
                "Use + POST A BOUNTY from the left sidebar or POST BOUNTY on a market card.",
                "Title, pitch, and a clear task description are required.",
                "Set reward in SOL (0.00001–100). Kind and optional linked market.",
                "After creation, deposit via your wallet to move from Funding → Open.",
              ]}
            />
          </Sub>
        </DocSection>

        <DocSection id="sol-pools" title="SOL & reward pools">
          <p>
            Bounty rewards use Solana. Amounts display with the Solana logo icon next to the number (not the text
            &quot;SOL&quot;). Deposits and payouts go through an escrow wallet configured server-side.
          </p>
          <Sub title="Initial deposit">
            <p>
              The creator signs a Solana transfer to the BLACKCROW escrow wallet. Each deposit includes an on-chain memo
              tying the transaction to that bounty ID. After confirmation, the bounty goes live and the creator earns
              Feathers (see Feathers section). Deposits are disabled if the server escrow wallet is not configured.
            </p>
          </Sub>
          <Sub title="Collaborative pool">
            <List
              items={[
                "On community bounties, others can add SOL while status is Open or Assigned.",
                "Minimum contribution: 0.01 SOL per transaction (up to 50 SOL per tx).",
                "Pool total increases the helper payout on approval.",
                "Only the original creator can approve or reject — contributors do not gain moderation power.",
                "Official bounties (blackcrow_official) do not accept pool contributions.",
              ]}
            />
          </Sub>
          <Sub title="Approval & payout">
            <p>
              Multiple operators can join the same bounty and each submit their own proof with photos or video. The
              creator reviews each submission and approves exactly one winner (or rejects individually). Approval pays
              the full boosted pool to that wallet on-chain from the escrow treasury. Contributors never gain approve
              power — only the creator decides who fulfilled the job.
            </p>
          </Sub>
          <Sub title="Cancel & refund">
            <p>
              Creators can cancel unfunded bounties instantly. For funded bounties still open (no pending proofs), the
              creator can cancel and receive a refund of their base deposit to the wallet on file. Pool contributions
              from others are not auto-refunded in v1 — contributors accept that risk when boosting.
            </p>
          </Sub>
        </DocSection>

        <DocSection id="home" title="Home">
          <p>
            Home at <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px]">/app</code> is
            your public timeline—where operators surface reads, flag targets, and align before a move. Not a private
            channel; use cabals or Chat for closed coordination.
          </p>
          <Sub title="Posting">
            <List
              items={[
                "Up to 600 characters per post—enough for thesis, entry, and timing.",
                "Choose audience: Everyone (public timeline) or a cabal you belong to.",
                "Tag sentiment: Bullish, Bearish, or Neutral on the market you are pushing.",
                "Attach an open bounty so the feed shows the job and the target in one embed.",
                "Each post grants +2 Feathers—consistent intel sources climb The Roost.",
              ]}
            />
          </Sub>
          <Sub title="Engagement">
            <p>
              Posts show avatar, codename, verified badge when applicable, and linked market or bounty cards—so
              everyone on Home can see who called what and which play is live. Likes, reposts, replies, bookmarks,
              and views track real engagement.
            </p>
          </Sub>
        </DocSection>

        <DocSection id="markets" title="Markets">
          <p>
            Market data comes from the Polymarket Gamma API, cached in Postgres, and re-ranked for operators—not
            casual bettors. The goal is insight: which books are thin, contested, and worth coordinating on.
          </p>
          <Sub title="Thin books">
            <p>
              A <strong className="text-foreground">thin book</strong> is low-liquidity surface area—where coordinated
              size or narrative can move YES/NO. That is the primary filter for manipulation plays and field bounties.
              Tiers: under ~$25k = thin, under ~$150k = medium, above = thick.
            </p>
          </Sub>
          <Sub title="Markets page (/app/markets)">
            <List
              items={[
                "Stats bar: market count, volume, thin-book count, contested setups.",
                "Filters: search, thin-only, sort by exploitable / contested / volume, liquidity tier, category.",
                "Each card: sparkline, YES/NO bar, relative volume, op score, expiry—scan for actionable targets.",
                "POST BOUNTY links a SOL job directly to that market for your crew to execute.",
              ]}
            />
          </Sub>
          <Sub title="Exploit score">
            <p>
              Lower score = more actionable for coordinated pushes. Inputs include volume (log scale), distance from
              50/50, manipulable event types (weather, counts, deadlines), and topic weighting—so the feed surfaces
              markets where insight and alignment matter more than raw bankroll.
            </p>
          </Sub>
        </DocSection>

        <DocSection id="feathers" title="Feathers & leaderboard">
          <p>
            Feathers (<code className="font-mono text-[12px]">influence</code>) measure who is consistently bringing
            intel and running plays—not who holds the most SOL. They do not decay. Cabals rank by member count, not
            Feathers.
          </p>
          <Sub title="How to earn">
            <List
              items={[
                "Home post — +2 Feathers each.",
                "Found a cabal — +20 one-time.",
                "Bounty goes live — initial deposit SOL × 5 Feathers (max 300).",
                "Bounty approved (helper) — total pool SOL × 10 Feathers (max 500).",
                "Pool contributions — 0 Feathers (SOL only).",
              ]}
            />
          </Sub>
          <Sub title="Example">
            <p>
              Post 1 SOL bounty → up to 5 Feathers when live. Others add 0.5 SOL → pool is 1.5 SOL. Helper receives
              1.5 SOL + up to 15 Feathers on approval.
            </p>
          </Sub>
          <p>
            Full rankings and expandable guides live at{" "}
            <Link href="/app/leaderboard" className="text-bull hover:underline">
              /app/leaderboard
            </Link>
            .
          </p>
        </DocSection>

        <DocSection id="cabals" title="Cabals">
          <p>
            Cabals are closed crews for aligned execution—where you coordinate plays away from the public Home timeline.
            Create or join from{" "}
            <Link href="/app/cabals" className="text-bull hover:underline">
              /app/cabals
            </Link>
            .
          </p>
          <Sub title="Types">
            <List
              items={[
                "MARKET OPS — manipulation and execution focus; default filter in the UI.",
                "Tipsters — signals, entries, and read on specific markets.",
                "Discussion — thesis development before a play goes live.",
              ]}
            />
          </Sub>
          <Sub title="Visibility">
            <List
              items={[
                "Public — anyone can join instantly.",
                "Private — join requests go to the cabal leader for approve/deny.",
              ]}
            />
          </Sub>
          <p>Each cabal has a slug URL, emblem, motto, member list, and leader badge.</p>
        </DocSection>

        <DocSection id="social" title="Social layer">
          <Sub title="Profiles">
            <p>
              Public profiles at <code className="font-mono text-[12px]">/app/u/[codename]</code> show track record:
              Feathers, posts, bounties run, and cabal membership—so you can vet who is worth following into a play.
              Verified accounts display a blue check on avatar and username.
            </p>
          </Sub>
          <Sub title="Chat">
            <p>
              Direct messages at <Link href="/app/messages" className="text-bull hover:underline">/app/messages</Link>{" "}
              (labeled <strong className="text-foreground">Chat</strong> in the app) for 1:1 coordination—timing, size,
              and side without posting to your public timeline.
            </p>
          </Sub>
          <Sub title="Notifications">
            <p>
              In-app notifications (bounty events, follows, cabal requests, etc.) at{" "}
              <Link href="/app/notifications" className="text-bull hover:underline">/app/notifications</Link>.
            </p>
          </Sub>
          <Sub title="Search">
            <p>
              Global search at <Link href="/app/search" className="text-bull hover:underline">/app/search</Link> for
              profiles, cabals, and markets.
            </p>
          </Sub>
        </DocSection>

        <DocSection id="official" title="Official account (blackcrow_official)">
          <p>
            The platform operator account uses codename <strong className="text-foreground">blackcrow_official</strong>,
            a verified blue badge, and the official crow avatar image — not a generic green label.
          </p>
          <List
            items={[
              "Official bounties are seeded on real Polymarket questions.",
              "They do not use collaborative pools — only the official creator approves.",
              "UI shows avatar + blackcrow_official, never a generic 'BlackCrow Official' pill.",
            ]}
          />
        </DocSection>

        <DocSection id="token" title="Token ($CROW)">
          <p>
            The project token on Solana is <strong className="text-foreground">$CROW</strong>. The contract address
            (CA) is shown in the site header, footer, hero, and app shell — always verify on-chain before trading.
          </p>
          <TokenCaChip variant="panel" className="my-5" />
          <p>
            You can override the mint via{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px]">NEXT_PUBLIC_TOKEN_CA</code> in
            environment variables if needed for staging.
          </p>
        </DocSection>

        <DocSection id="glossary" title="Glossary">
          <dl className="space-y-4">
            {[
              ["Home", "Your public timeline—surface reads and align operators before a push."],
              ["Chat", "Direct messages for 1:1 coordination without posting publicly."],
              ["Thin book", "Low-liquidity market where coordinated size or narrative can move odds."],
              ["Feathers", "Reputation for intel and execution; ranks operators on The Roost."],
              ["Pool", "Extra SOL stacked on a bounty so the helper payout scales with the play."],
              ["Op score", "Exploitability index—lower = thinner, more actionable for coordination."],
              ["The Nest", "Authenticated app shell (/app and children)."],
              ["The Roost", "Leaderboard—who is consistently moving markets with the crew."],
              ["$CROW", "Solana SPL token for the BLACKCROW project; CA shown across the site and in docs."],
            ].map(([term, def]) => (
              <div key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="mt-1 text-muted">{def}</dd>
              </div>
            ))}
          </dl>
        </DocSection>

        <div className="mt-12 rounded-2xl border border-bull/25 bg-bull/5 px-6 py-8 text-center">
          <p className="text-[15px] font-bold text-foreground">Ready to coordinate?</p>
          <p className="mt-2 text-[13px] text-muted">
            Connect your wallet, scan thin books, and run your first play from Home.
          </p>
          <Link
            href="/app"
            className="mt-4 inline-flex rounded-xl bg-foreground px-6 py-3 text-[12px] font-bold text-black"
          >
            OPEN THE NEST →
          </Link>
        </div>
      </article>
      </div>
    </div>
  );
}
