"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import Navbar from "@/components/Navbar";
import CopyButton from "@/components/CopyButton";
import { getUserHandle, getUserInitials, truncateAddress } from "@/lib/user";
import {
  IconArrow,
  IconWallet,
  IconUser,
  IconChart2,
  IconBolt,
} from "@/components/icons";

type SessionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      userId: string;
      sessionId?: string;
      expiration?: number;
    };

function Card({
  id,
  title,
  icon: Icon,
  children,
}: {
  id?: string;
  title: string;
  icon: (p: { className?: string }) => React.ReactElement;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="glass scroll-mt-28 rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-2 text-bull">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-[12px] font-bold tracking-[0.16em] text-muted">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function AccountPage() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    getAccessToken,
    linkEmail,
    linkWallet,
    linkGoogle,
    linkTwitter,
    linkDiscord,
    unlinkEmail,
    unlinkWallet,
    unlinkGoogle,
    unlinkTwitter,
    unlinkDiscord,
  } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [session, setSession] = useState<SessionState>({ status: "loading" });

  const verifySession = useCallback(async () => {
    setSession({ status: "loading" });
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/me", {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        setSession({ status: "error", message: data.error ?? "Could not verify session." });
        return;
      }
      setSession({
        status: "ok",
        userId: data.userId,
        sessionId: data.sessionId,
        expiration: data.expiration,
      });
    } catch {
      setSession({ status: "error", message: "Network error verifying session." });
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (ready && authenticated) verifySession();
  }, [ready, authenticated, verifySession]);

  const linkedCount = (user?.linkedAccounts?.length ?? 0);
  const canUnlink = linkedCount > 1;

  if (!ready) {
    return (
      <main className="relative min-h-screen">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="relative min-h-screen">
        <Navbar />
        <div className="bg-grid bg-grid-fade flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-faint">RESTRICTED AREA</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">
            ACCESS THE NETWORK
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted">
            You need to be signed in to view your account, wallet and positions.
          </p>
          <div className="mt-7 flex gap-3">
            <button
              onClick={login}
              className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-[13px] font-bold tracking-[0.08em] text-background transition-transform hover:scale-[1.03]"
            >
              LOG IN / SIGN UP
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-line px-6 py-3.5 text-[13px] font-semibold text-foreground transition-colors hover:border-black/20"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const providers = [
    {
      key: "email",
      label: "Email",
      linked: !!user?.email?.address,
      value: user?.email?.address,
      link: linkEmail,
      unlink: () => user?.email?.address && unlinkEmail(user.email.address),
    },
    {
      key: "google",
      label: "Google",
      linked: !!user?.google?.subject,
      value: user?.google?.email,
      link: linkGoogle,
      unlink: () => user?.google?.subject && unlinkGoogle(user.google.subject),
    },
    {
      key: "twitter",
      label: "X / Twitter",
      linked: !!user?.twitter?.subject,
      value: user?.twitter?.username ? `@${user.twitter.username}` : undefined,
      link: linkTwitter,
      unlink: () => user?.twitter?.subject && unlinkTwitter(user.twitter.subject),
    },
    {
      key: "discord",
      label: "Discord",
      linked: !!user?.discord?.subject,
      value: user?.discord?.username,
      link: linkDiscord,
      unlink: () => user?.discord?.subject && unlinkDiscord(user.discord.subject),
    },
  ];

  return (
    <main className="relative min-h-screen pb-24">
      <Navbar />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-grid bg-grid-fade opacity-50" />
      <div className="pointer-events-none absolute -top-20 right-1/4 h-[360px] w-[360px] rounded-full bg-sky-500/5 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-6 pt-32">
        {/* Header */}
        <div className="flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/50 to-cyan-600/50 text-lg font-bold text-white ring-1 ring-black/10">
              {getUserInitials(user)}
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-faint">WELCOME BACK</p>
              <h1 className="font-display text-2xl font-extrabold tracking-tight">{getUserHandle(user)}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session.status === "ok" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-bull/30 bg-bull/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-bull">
                <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-dot" />
                SESSION VERIFIED
              </span>
            )}
            <button
              onClick={logout}
              className="rounded-lg border border-line px-4 py-2 text-[12px] font-semibold tracking-[0.1em] text-bear transition-colors hover:border-bear/40 hover:bg-bear/10"
            >
              LOG OUT
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Linked accounts", value: String(linkedCount) },
            { label: "Wallets", value: String(wallets.length) },
            { label: "Open positions", value: "0" },
            { label: "Rank", value: "—" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4">
              <p className="font-mono text-2xl font-bold text-foreground">{s.value}</p>
              <p className="mt-1 text-[11px] tracking-wide text-faint">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Identity */}
          <Card title="IDENTITY" icon={IconUser}>
            <div className="space-y-2.5">
              {providers.map((p) => (
                <div
                  key={p.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-foreground">{p.label}</p>
                    <p className="truncate text-[12px] text-faint">
                      {p.linked ? p.value ?? "Linked" : "Not linked"}
                    </p>
                  </div>
                  {p.linked ? (
                    <button
                      onClick={() => p.unlink()}
                      disabled={!canUnlink}
                      title={canUnlink ? "Unlink" : "You must keep at least one login method"}
                      className="rounded-md border border-line px-3 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-bear/40 hover:text-bear disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Unlink
                    </button>
                  ) : (
                    <button
                      onClick={() => p.link()}
                      className="rounded-md border border-line px-3 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-black/20 hover:text-foreground"
                    >
                      Link
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Wallet */}
          <Card id="wallet" title="SOLANA WALLETS" icon={IconWallet}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
                Connected ({wallets.length})
              </p>
              <button
                onClick={() => linkWallet()}
                className="text-[11px] font-medium text-muted transition-colors hover:text-foreground"
              >
                + Connect Phantom / Solflare
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {wallets.length === 0 && (
                <div className="rounded-xl border border-dashed border-line bg-surface/30 px-4 py-6 text-center">
                  <p className="text-[13px] text-muted">No Solana wallet connected.</p>
                  <button
                    onClick={() => linkWallet()}
                    className="mt-3 rounded-lg bg-foreground px-3 py-2 text-[12px] font-bold text-background transition-transform hover:scale-[1.03]"
                  >
                    Connect wallet
                  </button>
                </div>
              )}
              {wallets.map((w) => (
                <div
                  key={w.address}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold capitalize text-foreground">
                      {w.standardWallet?.name ?? "Solana wallet"}
                    </p>
                    <code className="font-mono text-[12px] text-faint">
                      {truncateAddress(w.address, 6)}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton value={w.address} />
                    <button
                      onClick={() => canUnlink && unlinkWallet(w.address)}
                      disabled={!canUnlink}
                      title={canUnlink ? "Unlink" : "You must keep at least one login method"}
                      className="rounded-md border border-line px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-bear/40 hover:text-bear disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Portfolio (placeholder) */}
          <Card id="portfolio" title="PORTFOLIO" icon={IconChart2}>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/30 py-10 text-center">
              <IconBolt className="h-6 w-6 text-faint" />
              <p className="mt-3 text-[13px] font-medium text-muted">No open positions yet</p>
              <p className="mt-1 text-[12px] text-faint">Back a market to start building your track record.</p>
              <Link
                href="/#feed"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-[12px] font-semibold text-foreground transition-colors hover:border-black/20"
              >
                Explore markets <IconArrow className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* Session */}
          <Card title="SERVER SESSION" icon={IconBolt}>
            <div className="space-y-3 font-mono text-[12px]">
              {session.status === "loading" && <p className="text-faint">Verifying session…</p>}
              {session.status === "error" && (
                <p className="text-bear">{session.message}</p>
              )}
              {session.status === "ok" && (
                <>
                  <Row label="Privy user ID" value={session.userId} copyable />
                  {session.sessionId && <Row label="Session ID" value={session.sessionId} />}
                  {session.expiration && (
                    <Row
                      label="Expires"
                      value={new Date(session.expiration * 1000).toLocaleString()}
                    />
                  )}
                  <Row label="DID" value={user?.id ?? "—"} copyable />
                  {user?.createdAt && (
                    <Row label="Member since" value={new Date(user.createdAt).toLocaleDateString()} />
                  )}
                </>
              )}
              <button
                onClick={verifySession}
                className="mt-2 rounded-lg border border-line px-3 py-2 text-[12px] font-sans font-semibold text-muted transition-colors hover:border-black/20 hover:text-foreground"
              >
                Re-verify
              </button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line pb-2.5">
      <span className="shrink-0 font-sans text-[11px] uppercase tracking-wide text-faint">{label}</span>
      <span className="flex items-center gap-2 truncate text-foreground">
        <span className="truncate">{value}</span>
        {copyable && <CopyButton value={value} />}
      </span>
    </div>
  );
}
