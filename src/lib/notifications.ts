import { query } from "./db";

export async function notify(
  profileId: string,
  type: string,
  body: string,
  link?: string,
): Promise<void> {
  try {
    await query(
      "insert into notifications (profile_id, type, body, link) values ($1, $2, $3, $4)",
      [profileId, type, body, link ?? null],
    );
  } catch {
    /* non-fatal */
  }
}
