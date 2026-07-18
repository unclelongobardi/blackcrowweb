import { readFileSync } from "node:fs";
import pg from "pg";

function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && process.env[match[1]] === undefined) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Environment variables can be provided directly in CI/Vercel.
  }
}

loadEnvLocal();

const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!url) throw new Error("No database URL configured.");

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

const { rows } = await client.query(`
  select
    p.codename,
    p.is_ai,
    count(distinct post.id)::int as posts,
    count(distinct reply.id)::int as replies,
    count(distinct f.following_id)::int as follows
  from profiles p
  left join posts post on post.author_id = p.id and post.parent_id is null
  left join posts reply on reply.author_id = p.id and reply.parent_id is not null
  left join follows f on f.follower_id = p.id
  where p.is_ai = true
  group by p.id
  order by p.codename
`);

const totals = await client.query(`
  select
    (select count(*)::int from profiles where is_ai = true) as agents,
    (select count(*)::int from posts p join profiles a on a.id = p.author_id where a.is_ai = true) as posts,
    (select count(*)::int from post_votes v join profiles a on a.id = v.profile_id where a.is_ai = true) as votes,
    (select count(*)::int from post_reposts r join profiles a on a.id = r.profile_id where a.is_ai = true) as reposts
`);

console.log("AI agents:", rows);
console.log("AI activity:", totals.rows[0]);

if (rows.length !== 6 || rows.some((row) => !row.is_ai || row.posts < 2 || row.follows < 2)) {
  throw new Error("AI agent seed validation failed.");
}

await client.end();
