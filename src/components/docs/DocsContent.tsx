"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "getting-started", label: "Getting started" },
  { id: "hub-layout", label: "Hub layout" },
  { id: "bounties", label: "Bounties" },
  { id: "sol-pools", label: "SOL & pools" },
  { id: "war-room", label: "War Room" },
  { id: "markets", label: "Markets" },
  { id: "feathers", label: "Feathers" },
  { id: "cabals", label: "Cabals" },
  { id: "social", label: "Social layer" },
  { id: "official", label: "Official account" },
  { id: "token", label: "Token (CA)" },
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
            Everything you need to coordinate on Polymarket-style prediction markets: bounties paid in
            Solana, reputation via Feathers, cabals, and the War Room feed.
          </p>
        </header>

        <DocSection id="overview" title="Overview">
          <p>
            BLACKCROW is a Solana-native social layer for prediction-market operators. You connect a wallet
            (Phantom or Solflare), pick a codename, and enter <strong className="text-foreground">The Nest</strong>{" "}
            — the authenticated app at <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px]">/app</code>.
          </p>
          <p>
            The product combines four loops: <strong className="text-foreground">Markets intel</strong> (thin books
            from Polymarket), <strong className="text-foreground">Bounties</strong> (SOL rewards for real-world or
            on-chain tasks), <strong className="text-foreground">War Room</strong> (public feed for intel and
            coordination), and <strong className="text-foreground">Cabals</strong> (private or public groups).
          </p>
          <p>
            Money and reputation are separate: SOL in bounties is real payout on approval;{" "}
            <strong className="text-foreground">Feathers</strong> are off-chain influence points for leaderboard rank
            and visibility.
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
          <Sub title="2. Redirect to War Room">
            <p>
              After a successful connection on the landing, you are sent directly to{" "}
              <Link href="/app" className="text-bull hover:underline">
                /app
              </Link>{" "}
              — the War Room hub — instead of staying on the marketing page.
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
          <p>The main hub is a three-column layout on large screens:</p>
          <List
            items={[
              "Left sidebar — Bounties controls: post a bounty, find thin markets, and a scrollable Open bounties menu with creator avatar + reward.",
              "Center — War Room: compose posts and read the live feed. This is the default focus of the hub.",
              "Right sidebar — All bounties (full cards with actions) plus a Thin books panel synced from Polymarket.",
            ]}
          />
          <Sub title="Selecting & sharing a bounty">
            <Flow
              steps={[
                "Click a bounty card in the right sidebar to select it.",
                "Press SHARE TO WAR ROOM to attach it to the composer.",
                "Write your take and post — the bounty is linked on the feed for the crew to see.",
              ]}
            />
          </Sub>
        </DocSection>

        <DocSection id="bounties" title="Bounties">
          <p>
            A bounty is a paid job tied to a market or thesis. The poster locks SOL; a helper accepts, does the
            work, submits proof; the creator approves or rejects.
          </p>
          <Sub title="Bounty kinds">
            <List
              items={[
                "Field op — physical or real-world action (e.g. on-site proof).",
                "Intel — research, data, or narrative work.",
                "Coordination — organizing others, cabal plays, timing.",
              ]}
            />
          </Sub>
          <Sub title="Status lifecycle">
            <Flow
              steps={[
                "Funding — creator created the bounty; SOL not yet deposited.",
                "Open — deposit confirmed; anyone can accept (or boost the pool).",
                "Assigned — a helper accepted; they must submit proof.",
                "Submitted — proof is in; creator reviews.",
                "Paid — creator approved; helper receives the pool on-chain.",
                "Cancelled — bounty withdrawn or rejected back to assigned.",
              ]}
            />
          </Sub>
          <Sub title="Roles">
            <List
              items={[
                "Creator — posts the bounty, deposits initial SOL, and is the only account that can approve or reject proof on community pools.",
                "Helper — accepts an open bounty, submits proof, receives SOL + Feathers on approval.",
                "Contributor — optional; adds SOL to the pool while status is open or assigned (non-official bounties only).",
              ]}
            />
          </Sub>
          <Sub title="Creating a bounty">
            <List
              items={[
                "Use + POST A BOUNTY from the left sidebar or POST BOUNTY on a market card.",
                "Title, pitch, and a clear task description are required.",
                "Set reward in SOL (0.01–100). Kind and optional linked market.",
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
              The creator signs a deposit transaction to escrow. When confirmed, the bounty goes live and the creator
              earns Feathers (see Feathers section).
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
              When proof is submitted, the creator sees Approve & Pay Pool (or Approve & Release on official bounties).
              Approval triggers an on-chain payout to the helper&apos;s wallet. Reject sends the bounty back to Assigned
              for a new proof attempt.
            </p>
          </Sub>
        </DocSection>

        <DocSection id="war-room" title="War Room">
          <p>
            The War Room is the center column at <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px]">/app</code>.
            It is a public feed — not a private DM channel.
          </p>
          <Sub title="Posting">
            <List
              items={[
                "Write up to 600 characters per post.",
                "Optional sentiment: Bullish, Bearish, or Neutral.",
                "Attach a bounty from the right sidebar before posting to include a bounty card in the feed.",
                "Each post grants +2 Feathers to the author.",
              ]}
            />
          </Sub>
          <Sub title="Engagement">
            <p>
              Posts show author avatar, codename, optional verified badge, linked market or bounty embeds, and cosmetic
              engagement counts. Likes call the vote API and update your Feathers-related activity indirectly via
              participation.
            </p>
          </Sub>
        </DocSection>

        <DocSection id="markets" title="Markets">
          <p>
            Markets data is pulled from the public Polymarket Gamma API, cached in Postgres, and ranked for
            exploitability (thin liquidity + contested odds + on-brand topics).
          </p>
          <Sub title="Thin books">
            <p>
              A <strong className="text-foreground">thin book</strong> is a market with low volume where small trades
              can move the price — useful for coordinated plays and field bounties. Tier thresholds: under ~$25k = thin,
              under ~$150k = medium, above = thick.
            </p>
          </Sub>
          <Sub title="Markets page (/app/markets)">
            <List
              items={[
                "Live stats bar: count, total volume, thin books, contested markets.",
                "Filters: search, thin-only mode, sort by exploitable / contested / volume, liquidity tier, category.",
                "Each card: image, sparkline, YES/NO bar, volume relative to the set, op score, expiry.",
                "POST BOUNTY pre-fills a modal linked to that market.",
              ]}
            />
          </Sub>
          <Sub title="Exploit score">
            <p>
              Lower internal score = more exploitable. It weighs volume (log scale), distance from 50/50, manipulable
              keywords (weather, temperatures, counts), and topic priority (crypto/economy favored over sports).
            </p>
          </Sub>
        </DocSection>

        <DocSection id="feathers" title="Feathers & leaderboard">
          <p>
            Feathers are reputation points stored on your profile (<code className="font-mono text-[12px]">influence</code>
            ). They do not decay. Cabals rank by member count, not Feathers.
          </p>
          <Sub title="How to earn">
            <List
              items={[
                "War Room post — +2 Feathers each.",
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
            Cabals are groups for coordination. Create or join from{" "}
            <Link href="/app/cabals" className="text-bull hover:underline">
              /app/cabals
            </Link>
            .
          </p>
          <Sub title="Types">
            <List
              items={[
                "MARKET OPS — manipulation / market operations focus (first filter in the UI).",
                "Tipsters — signal and pick sharing.",
                "Discussion — general chat and thesis.",
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
              Public profiles at <code className="font-mono text-[12px]">/app/u/[codename]</code> show bio, Feathers,
              follow counts, and follow/unfollow. Verified accounts display a blue check on avatar and username.
            </p>
          </Sub>
          <Sub title="Messages">
            <p>
              DMs at <Link href="/app/messages" className="text-bull hover:underline">/app/messages</Link> — 1:1
              conversations with unread indicators and real-time message list.
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

        <DocSection id="token" title="Token (CA)">
          <p>
            When the project token launches on Solana, the contract address appears in the site header as{" "}
            <strong className="text-foreground">CA</strong> with a copy button. Until then it shows{" "}
            <strong className="text-foreground">TBA</strong>.
          </p>
          <p>
            Set <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[12px]">NEXT_PUBLIC_TOKEN_CA</code> in
            environment variables to populate it in production.
          </p>
        </DocSection>

        <DocSection id="glossary" title="Glossary">
          <dl className="space-y-4">
            {[
              ["War Room", "Public intel feed at /app center column."],
              ["Thin book", "Low-liquidity Polymarket market; easier to move."],
              ["Feathers", "Reputation points; leaderboard currency."],
              ["Pool", "Extra SOL added by contributors to a bounty reward."],
              ["Op score", "Markets page exploitability index (higher = more actionable)."],
              ["The Nest", "Authenticated app shell (/app and children)."],
              ["The Roost", "Leaderboard branding."],
            ].map(([term, def]) => (
              <div key={term}>
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="mt-1 text-muted">{def}</dd>
              </div>
            ))}
          </dl>
        </DocSection>

        <div className="mt-12 rounded-2xl border border-bull/25 bg-bull/5 px-6 py-8 text-center">
          <p className="text-[15px] font-bold text-foreground">Ready to operate?</p>
          <p className="mt-2 text-[13px] text-muted">Connect your wallet and enter the War Room.</p>
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
