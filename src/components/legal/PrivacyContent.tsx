import Link from "next/link";
import { TWITTER_URL } from "@/lib/links";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 scroll-mt-28 font-display text-lg font-extrabold tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[14px] leading-relaxed text-muted">{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-muted">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyContent() {
  return (
    <>
      <P>
        This Privacy Policy explains how BLACKCROW (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, and shares
        information when you use our website, app at{" "}
        <code className="font-mono text-[12px] text-foreground/80">/app</code>, and related services. By using the
        platform, you agree to this policy.
      </P>

      <H2>1. Overview</H2>
      <P>
        BLACKCROW is a wallet-first coordination platform. We minimize traditional identity collection: no email is
        required to use The Nest. Most activity is pseudonymous (codename + avatar), but your Solana wallet address,
        on-chain transactions, and public posts are inherently visible in ways described below.
      </P>

      <H2>2. Information we collect</H2>
      <P>
        <strong className="text-foreground">Wallet & auth</strong> — When you connect via Privy, we receive your
        Solana wallet address, Privy decentralized identifier (DID), and linked OAuth subjects if you choose to link X
        on the account page.
      </P>
      <P>
        <strong className="text-foreground">Profile</strong> — Codename, optional display name, bio, avatar seed,
        Feathers (influence score), verification flags, and onboarding timestamps stored in our database.
      </P>
      <P>
        <strong className="text-foreground">Content & social</strong> — War Room posts, sentiment tags, bounty
        attachments, cabal membership, direct messages, follows, notifications, search queries, and bounty/cabal
        actions you perform in-app.
      </P>
      <P>
        <strong className="text-foreground">Transactions</strong> — Bounty escrow deposits, pool contributions, and
        payout metadata (signatures, amounts, timestamps) necessary to operate SOL flows. On-chain data is public on
        Solana regardless of this policy.
      </P>
      <P>
        <strong className="text-foreground">Technical</strong> — IP address, browser type, device hints, request logs,
        and error diagnostics collected by our host (Vercel) and application logs for security and performance.
      </P>
      <P>
        <strong className="text-foreground">Marketing email (optional)</strong> — If you submit an email in the landing
        footer newsletter field, we store that address for updates. This is separate from wallet login.
      </P>

      <H2>3. How we use information</H2>
      <Ul
        items={[
          "Operate accounts, feeds, bounties, cabals, messages, and leaderboards.",
          "Process SOL bounty escrow flows you authorize.",
          "Compute Feathers, rankings, exploit scores, and market caches.",
          "Moderate abuse, enforce Terms, and protect platform integrity.",
          "Improve reliability, debug errors, and analyze aggregate usage.",
          "Communicate launch updates (including $CROW token) via official channels or optional email list.",
        ]}
      />

      <H2>4. What we share</H2>
      <P>
        <strong className="text-foreground">Public by design</strong> — War Room posts, public profiles (
        <code className="font-mono text-[12px]">/app/u/[codename]</code>), public cabals, and leaderboard entries are
        visible to other users and may be indexed by search engines.
      </P>
      <P>
        <strong className="text-foreground">Service providers</strong> — Privy (authentication), Neon (Postgres database),
        Vercel (hosting/CDN), Solana RPC providers, and infrastructure vendors processing data on our behalf under
        contractual obligations.
      </P>
      <P>
        <strong className="text-foreground">Legal</strong> — We may disclose information if required by law, court order,
        or to protect rights, safety, and fraud prevention.
      </P>
      <P>We do not sell personal information to data brokers.</P>

      <H2>5. Third-party market data</H2>
      <P>
        Market listings and prices are sourced from public Polymarket APIs, cached in our database, and re-ranked for
        operator insights. We do not send your wallet to Polymarket through BLACKCROW unless you independently visit their
        site. See{" "}
        <Link href="/docs#markets" className="text-bull hover:underline">
          Markets documentation
        </Link>{" "}
        for details.
      </P>

      <H2>6. $CROW token & on-chain privacy</H2>
      <P>
        Blockchain transactions are public and permanent. If you buy, sell, or transfer $CROW or interact with bounty
        escrow, those actions are visible on Solana explorers (e.g. Solscan) and analytics sites (e.g. Dexscreener).
        Contract addresses displayed in the UI come from environment configuration; always verify on-chain before
        interacting.
      </P>

      <H2>7. Cookies & local storage</H2>
      <P>
        We use session cookies and browser storage for authentication state (via Privy), preferences, and security.
        Vercel analytics or similar tooling may set additional cookies. You can control cookies through browser settings;
        disabling them may break wallet login.
      </P>

      <H2>8. Retention</H2>
      <P>
        Profile and content data are retained while your account is active and as needed for legal compliance, dispute
        resolution, and backup integrity. You may request deletion of off-chain profile data by contacting us; on-chain
        history cannot be deleted by us.
      </P>

      <H2>9. Security</H2>
      <P>
        We use industry-standard measures (TLS, access controls, hosted database encryption). No system is perfectly
        secure; you are responsible for wallet hygiene (hardware wallet, seed phrase protection, transaction review).
      </P>

      <H2>10. International users</H2>
      <P>
        Data may be processed in the United States and other countries where our providers operate. By using the service,
        you consent to transfer and processing in those jurisdictions.
      </P>

      <H2>11. Your choices</H2>
      <Ul
        items={[
          "Disconnect wallet and stop using the service at any time.",
          "Edit profile fields in /app/profile where available.",
          "Use private cabals and DMs for sensitive coordination instead of the public War Room.",
          "Request access or deletion of off-chain account data via official contact below.",
        ]}
      />

      <H2>12. Children</H2>
      <P>The service is not directed to anyone under 18. We do not knowingly collect data from minors.</P>

      <H2>13. Changes</H2>
      <P>
        We may update this Privacy Policy. The &ldquo;Last updated&rdquo; date will change accordingly. Material updates
        may also be announced on{" "}
        <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="text-bull hover:underline">
          X @blkcrow_ofc
        </a>
        .
      </P>

      <H2>14. Contact</H2>
      <P>
        Privacy questions:{" "}
        <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="text-bull hover:underline">
          https://x.com/blkcrow_ofc
        </a>
        .
      </P>
    </>
  );
}
