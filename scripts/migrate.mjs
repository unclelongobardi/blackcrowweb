// Runs supabase/schema.sql then pending migrations against Neon/Postgres.
// Usage: node scripts/migrate.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

function loadEnvLocal() {
  let txt = "";
  try {
    txt = readFileSync(".env.local", "utf8");
  } catch {
    return;
  }
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvLocal();

const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!url) {
  console.error("No database URL found in environment / .env.local");
  process.exit(1);
}

const MIGRATION_FILES = readdirSync(join("supabase", "migrations"))
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function ensureMigrationsTable() {
  await client.query(`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

async function getApplied() {
  const { rows } = await client.query("select name from schema_migrations");
  return new Set(rows.map((r) => r.name));
}

async function recordMigration(name) {
  await client.query(
    "insert into schema_migrations (name) values ($1) on conflict (name) do nothing",
    [name],
  );
}

async function bootstrapExistingDb(applied) {
  const { rows } = await client.query("select 1 from profiles limit 1");
  if (!rows.length) return false;

  console.log("Existing database detected — bootstrapping migration history (no re-run).");
  for (const file of MIGRATION_FILES) {
    if (!applied.has(file)) await recordMigration(file);
  }
  return true;
}

const run = async () => {
  await client.connect();
  console.log("Connected. Applying schema…");
  await client.query(readFileSync("supabase/schema.sql", "utf8"));

  await ensureMigrationsTable();
  let applied = await getApplied();

  if (applied.size === 0) {
    const bootstrapped = await bootstrapExistingDb(applied);
    if (bootstrapped) applied = await getApplied();
  }

  console.log("Applying pending migrations…");
  for (const file of MIGRATION_FILES) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join("supabase", "migrations", file), "utf8");
    try {
      await client.query(sql);
      await recordMigration(file);
      console.log("  ✓", file);
    } catch (err) {
      console.warn(`  ✗ ${file}:`, err.message);
    }
  }

  console.log("Seeding…");
  await client.query(readFileSync("supabase/seed.sql", "utf8"));

  const { rows } = await client.query(
    `select
       (select count(*) from profiles) as profiles,
       (select count(*) from cabals) as cabals,
       (select count(*) from bounties) as bounties,
       (select count(*) from posts) as posts`,
  );
  console.log("Row counts:", rows[0]);
  await client.end();
};

run()
  .then(() => {
    console.log("Migration complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  });
