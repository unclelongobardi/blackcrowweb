// Applies one migration file without running schema bootstrap or seed.
// Usage: node scripts/apply-single-migration.mjs 022_current_vex_bounties.sql
import { readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

function loadEnvLocal() {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    /* ignore */
  }
}

loadEnvLocal();

const file = process.argv[2];
if (!file || file.includes("/") || file.includes("\\") || !file.endsWith(".sql")) {
  console.error("Usage: node scripts/apply-single-migration.mjs <migration-file.sql>");
  process.exit(1);
}

const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!url) {
  console.error("No database URL found in environment / .env.local");
  process.exit(1);
}

const sql = readFileSync(join("supabase", "migrations", file), "utf8");
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query("begin");
  await client.query(sql);
  await client.query(
    "insert into schema_migrations (name) values ($1) on conflict (name) do nothing",
    [file],
  );
  await client.query("commit");
  console.log(`Applied ${file}`);
} catch (err) {
  await client.query("rollback").catch(() => {});
  console.error(`Failed to apply ${file}:`, err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
