import { readFileSync } from "node:fs";
import pg from "pg";

function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* ignore */
  }
}

loadEnvLocal();
const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

const total = await client.query("select count(*)::int as n from posts");
const publicHome = await client.query(
  "select count(*)::int as n from posts where parent_id is null and cabal_id is null",
);
const recent = await client.query(
  "select id, left(content, 40) as content, cabal_id, created_at from posts order by created_at desc limit 8",
);

console.log("total posts:", total.rows[0].n);
console.log("public home posts:", publicHome.rows[0].n);
console.log("recent:", recent.rows);

// Test feed query tables exist
for (const t of ["post_votes", "post_reposts", "post_bookmarks", "post_views", "post_polls"]) {
  const r = await client.query(
    `select exists (select 1 from information_schema.tables where table_name = $1) as ok`,
    [t],
  );
  console.log("table", t, r.rows[0].ok);
}

await client.end();
