import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../models";

export const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });

let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await client.unsafe(`
          CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            app_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          );
          ALTER TABLE messages ADD COLUMN IF NOT EXISTS app_id TEXT DEFAULT 'study-mentor' NOT NULL;
          CREATE INDEX IF NOT EXISTS messages_app_id_idx ON messages (app_id);
        `);
      } catch (err) {
        console.error("Database schema sync error:", err);
        // Reset promise so subsequent requests can retry
        initPromise = null;
        throw err;
      }
    })();
  }
  return initPromise;
}
