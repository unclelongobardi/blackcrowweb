import { TOKEN_CA, TOKEN_SYMBOL, TWITTER_HANDLE, TWITTER_URL } from "@/lib/links";

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

export default function TermsContent() {
  return (
    <>
      <P>
        These Terms of Service (&ldquo;Terms&rdquo;) govern access to VALORE — the website, authenticated app
        (&ldquo;Home&rdquo; at <code className="font-mono text-[12px] text-foreground/80">/app</code>), and
        related services operated under the VALORE brand. By connecting a wallet or using the platform, you agree to
        these Terms. If you do not agree, do not use the service.
      </P>

      <H2>1. What VALORE is</H2>
      <P>
        VALORE is a Solana-native coordination layer for prediction-market operators. The platform provides market
        intelligence (including thin-book rankings sourced from third-party APIs), a public Home feed, SOL-funded
        bounties with escrow, cabals for group coordination, off-chain reputation (&ldquo;VALORE score&rdquo;), and related
        social features. VALORE does not operate a centralized exchange, custody user funds beyond programmatic
        bounty escrow flows you explicitly authorize, or guarantee any market outcome.
      </P>

      <H2>2. Eligibility</H2>
      <Ul
        items={[
          "You must be at least 18 years old (or the age of majority in your jurisdiction).",
          "You may not use the service where prediction-market coordination, cryptocurrency, or related activity is prohibited.",
          "You are responsible for compliance with local laws, tax obligations, and sanctions rules.",
          "One wallet-backed profile per person; impersonation and duplicate abuse accounts are prohibited.",
        ]}
      />

      <H2>3. Accounts & wallets</H2>
      <P>
        Access is wallet-based via Privy (Phantom or Solflare on Solana). There is no traditional email/password signup.
        You choose a codename during onboarding; your connected wallet address is linked to your profile. You are solely
        responsible for wallet security, private keys, and every transaction you sign. We cannot recover lost wallets or
        reverse on-chain transfers.
      </P>

      <H2>4. Platform features</H2>
      <P>
        <strong className="text-foreground">Home</strong> — public timeline for intel, sentiment-tagged posts, and
        bounty embeds. Content you post is visible to other users.
      </P>
      <P>
        <strong className="text-foreground">Bounties</strong> — creators lock SOL in escrow for defined tasks (field ops,
        intel, coordination). Helpers accept, submit proof, and may receive pool payouts when approved by the creator.
        Contributors may add SOL to community pools under the rules shown in-app. Only the original creator approves or
        rejects proof on standard bounties.
      </P>
      <P>
        <strong className="text-foreground">Markets intel</strong> — aggregated third-party market data, exploit scores,
        and filters for operator use. Data may be delayed or inaccurate; it is not trading advice.
      </P>
      <P>
        <strong className="text-foreground">Cabals</strong> — public or private groups (including MARKET OPS, tipsters,
        discussion). Leaders may approve private join requests.
      </P>
      <P>
        <strong className="text-foreground">VALORE score</strong> — off-chain reputation points
        (&ldquo;influence&rdquo;) earned through documented platform activity. VALORE score is not currency, does not
        represent equity, and is separate from the ${TOKEN_SYMBOL} token.
      </P>

      <H2>5. ${TOKEN_SYMBOL} token</H2>
      <P>
        The project may launch or reference a Solana SPL token ticker{" "}
        <strong className="text-foreground">${TOKEN_SYMBOL}</strong>. The official contract address (&ldquo;CA&rdquo;) is{" "}
        <code className="break-all rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-[12px]">{TOKEN_CA}</code>.
        Unless we publish a separate, signed token utility statement:
      </P>
      <Ul
        items={[
          `$${TOKEN_SYMBOL} is not an investment contract, security, or promise of profit.`,
          "Token ownership does not grant governance over user bounties, escrow, or third-party markets.",
          "Token value can go to zero; only interact with contracts you have verified on-chain.",
          "Nothing on this site constitutes an offer to sell or solicitation to buy tokens in any jurisdiction where unlawful.",
          `Team allocation, liquidity, and launch details will be disclosed through official channels (e.g. X @${TWITTER_HANDLE}) when applicable.`,
        ]}
      />

      <H2>6. No financial or legal advice</H2>
      <P>
        Posts, bounties, market scores, and documentation are for informational and coordination purposes only. They are
        not investment, legal, or tax advice. Prediction markets and cryptocurrency involve substantial risk of loss.
        You alone decide whether and how to trade on Polymarket or any other venue.
      </P>

      <H2>7. Prohibited conduct</H2>
      <Ul
        items={[
          "Market manipulation that violates applicable law or third-party platform rules.",
          "Fraud, stolen funds, money laundering, or sanctions evasion.",
          "Harassment, doxing, threats, or posting others' private information without consent.",
          "Spam, bot abuse, exploit attempts on our APIs or smart-contract flows.",
          "Misrepresenting bounty proof, impersonating valore_official, or phishing wallet signatures.",
          "Scraping or reselling platform data at scale without written permission.",
        ]}
      />
      <P>
        We may suspend or terminate access, remove content, or withhold VALORE score for violations — without refund of
        off-chain status and without liability for on-chain assets already transferred.
      </P>

      <H2>8. Bounties, escrow & on-chain risk</H2>
      <P>
        Bounty deposits and payouts use Solana transactions you sign. Escrow is operated server-side per published flows.
        Smart-contract, RPC, or indexer failures can delay or prevent settlement. Disputes between creators and helpers
        are primarily between those parties; VALORE is not an arbiter of off-chain work quality except where we
        intervene for abuse or legal compliance.
      </P>

      <H2>9. Third-party services</H2>
      <P>
        The platform integrates Privy (auth), Solana RPC providers, Neon Postgres, Vercel hosting, Polymarket public APIs,
        and other vendors. Their terms and privacy policies apply to those interactions. We are not responsible for
        third-party downtime, policy changes, or asset loss on external platforms.
      </P>

      <H2>10. Intellectual property</H2>
      <P>
        VALORE branding, UI, and original content are owned by the project or licensors. You retain rights to content
        you post but grant us a non-exclusive license to display, store, and distribute it within the service for
        operation and promotion of the platform.
      </P>

      <H2>11. Disclaimers</H2>
      <P>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS
        OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
        UNINTERRUPTED, SECURE, OR ERROR-FREE OPERATION.
      </P>

      <H2>12. Limitation of liability</H2>
      <P>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, VALORE AND ITS OPERATORS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL,
        SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR DIGITAL ASSETS, ARISING
        FROM YOUR USE OF THE SERVICE — INCLUDING WALLET COMPROMISE, MARKET LOSSES, OR TOKEN PRICE CHANGES — EVEN IF
        ADVISED OF THE POSSIBILITY. OUR AGGREGATE LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE IS LIMITED TO THE
        GREATER OF (A) USD $100 OR (B) AMOUNTS YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM (TYPICALLY ZERO FOR
        FREE ACCESS).
      </P>

      <H2>13. Changes</H2>
      <P>
        We may update these Terms. Material changes will be reflected by updating the &ldquo;Last updated&rdquo; date.
        Continued use after changes constitutes acceptance. For token-launch-specific terms, follow announcements on
        official channels.
      </P>

      <H2>14. Contact</H2>
      <P>
        Legal and support inquiries:{" "}
        <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="text-bull hover:underline">
          @{TWITTER_HANDLE} on X
        </a>
        . No separate contact form is provided.
      </P>
    </>
  );
}
