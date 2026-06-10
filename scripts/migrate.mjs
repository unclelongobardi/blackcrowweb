// Runs supabase/schema.sql then supabase/seed.sql against the Neon database.
// Usage: node scripts/migrate.mjs
import { readFileSync } from "node:fs";
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

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

const run = async () => {
  await client.connect();
  console.log("Connected. Applying schema…");
  await client.query(readFileSync("supabase/schema.sql", "utf8"));
  console.log("Applying migrations…");
  for (const file of [
    "002_bounty_escrow.sql",
    "003_clean_fake_data.sql",
    "004_official_bounties.sql",
    "005_social_upgrade.sql",
    "006_bounty_pool.sql",
    "007_post_bounty.sql",
    "008_avatar_url_official_cabal.sql",
    "009_post_cabal.sql",
    "010_post_extras.sql",
  ]) {
    try {
      await client.query(readFileSync(`supabase/migrations/${file}`, "utf8"));
    } catch (err) {
      console.warn(`Migration ${file}:`, err.message);
    }
  }
  console.log("Schema applied. Seeding…");
  await client.query(readFileSync("supabase/seed.sql", "utf8"));
  console.log("Seed applied.");
  const { rows } = await client.query(
    "select (select count(*) from profiles) as profiles, (select count(*) from cabals) as cabals, (select count(*) from bounties) as bounties",
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
