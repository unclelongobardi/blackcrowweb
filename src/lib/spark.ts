/** Deterministic pseudo-random sparkline series from a seed string. */
export function genSpark(seed: string, n = 28, drift = 0): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h = (Math.imul(h, 1103515245) + 12345) & 0x7fffffff;
    return (h % 100000) / 100000;
  };
  let v = 45 + rand() * 15;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    v += (rand() - 0.5 + drift) * 9;
    v = Math.max(8, Math.min(92, v));
    out.push(v);
  }
  return out;
}
