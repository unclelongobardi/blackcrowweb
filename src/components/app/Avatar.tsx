const GRADIENTS = [
  "from-emerald-500/60 to-teal-700/60",
  "from-fuchsia-500/60 to-purple-700/60",
  "from-sky-500/60 to-blue-700/60",
  "from-amber-500/60 to-orange-700/60",
  "from-rose-500/60 to-red-700/60",
  "from-lime-500/60 to-green-700/60",
  "from-indigo-500/60 to-violet-700/60",
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return Math.abs(h);
}

export default function Avatar({
  seed,
  label,
  size = 36,
  className = "",
}: {
  seed?: string | null;
  label?: string | null;
  size?: number;
  className?: string;
}) {
  const s = seed || label || "crow";
  const gradient = GRADIENTS[hash(s) % GRADIENTS.length];
  const initials = (label || s).replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "BC";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-bold text-white ring-1 ring-white/10 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}
