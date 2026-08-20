import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

declare global {
  // eslint-disable-next-line no-var
  var postgresClient: ReturnType<typeof postgres> | undefined;
}

const client =
  globalThis.postgresClient ??
  postgres(connectionString, {
    prepare: false,
    max: Number(
      process.env.DB_POOL_MAX || (process.env.NODE_ENV === "production" ? 10 : 15)
    ),
    idle_timeout: 15,
    connect_timeout: 15,
    max_lifetime: 0,
  });

globalThis.postgresClient = client;

export const db = drizzle(client, { schema });
export { client };
