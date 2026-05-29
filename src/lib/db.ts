import { Pool, type QueryResultRow } from "pg";

function unquote(v: string | undefined): string {
  return (v ?? "").trim().replace(/^["']|["']$/g, "");
}

// Pick the first candidate that is an actual Postgres connection string.
// (Guards against an unrelated OS-level DATABASE_URL, e.g. a leftover sqlite path.)
function resolveConnectionString(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
  ];
  for (const c of candidates) {
    const v = unquote(c);
    if (/^postgres(ql)?:\/\//i.test(v)) return v;
  }
  return "";
}

const CONNECTION_STRING = resolveConnectionString();

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!CONNECTION_STRING) {
    throw new Error("DATABASE_URL is not set. Connect a Neon/Postgres database.");
  }
  if (!_pool) {
    _pool = new Pool({
      connectionString: CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10_000,
    });
  }
  return _pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await getPool().query<T>(text, params);
  return res.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export function isDbConfigured(): boolean {
  return !!CONNECTION_STRING;
}
