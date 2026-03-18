import "dotenv/config";
import pg from "pg";

const requiredTables = [
  "users",
  "auth_users",
  "sessions",
  "categories",
  "brands",
  "products",
  "requests",
  "news",
  "site_settings",
];

function parseAdminEmails(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getAuthMode(value: string | undefined): "local" | "google" | "replit" {
  if (value === "local" || value === "google" || value === "replit") {
    return value;
  }
  return "google";
}

async function main() {
  const errors: string[] = [];
  const warnings: string[] = [];

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const authMode = getAuthMode(process.env.AUTH_MODE);

  if (!process.env.DATABASE_URL) {
    errors.push("Missing DATABASE_URL");
  }

  if (nodeEnv === "production" && authMode === "local") {
    errors.push("AUTH_MODE=local is not allowed in production");
  }

  if (authMode !== "local") {
    if (!process.env.SESSION_SECRET) {
      errors.push("Missing SESSION_SECRET (required when AUTH_MODE is not local)");
    }
    const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS);
    if (adminEmails.length === 0) {
      errors.push("ADMIN_EMAILS must contain at least one email when AUTH_MODE is not local");
    }
    const invalidEmails = adminEmails.filter((email) => !email.includes("@"));
    if (invalidEmails.length > 0) {
      errors.push(`Invalid ADMIN_EMAILS value(s): ${invalidEmails.join(", ")}`);
    }
  }

  if (authMode === "google") {
    if (!process.env.GOOGLE_CLIENT_ID) {
      errors.push("Missing GOOGLE_CLIENT_ID (required when AUTH_MODE=google)");
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      errors.push("Missing GOOGLE_CLIENT_SECRET (required when AUTH_MODE=google)");
    }
    if (!process.env.GOOGLE_CALLBACK_URL) {
      errors.push("Missing GOOGLE_CALLBACK_URL (required when AUTH_MODE=google)");
    }
  }

  if (authMode === "replit" && !process.env.REPL_ID) {
    errors.push("Missing REPL_ID (required when AUTH_MODE=replit)");
  }

  if (errors.length > 0) {
    console.error("Configuration check failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const ping = await pool.query<{ db: string; usr: string }>(
      "select current_database() as db, current_user as usr"
    );
    const current = ping.rows[0];
    console.log(`Database connection: ok (db=${current.db}, user=${current.usr})`);

    const tablesResult = await pool.query<{ tablename: string }>(
      `
      select tablename
      from pg_tables
      where schemaname = 'public'
        and tablename = any($1::text[])
      `,
      [requiredTables]
    );

    const existing = new Set(tablesResult.rows.map((row) => row.tablename));
    const missing = requiredTables.filter((table) => !existing.has(table));

    if (missing.length > 0) {
      errors.push(`Missing DB tables: ${missing.join(", ")} (run: npm run db:push)`);
    }
  } catch (error) {
    errors.push(`Database check failed: ${(error as Error).message}`);
  } finally {
    await pool.end();
  }

  if (errors.length > 0) {
    console.error("Doctor check failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn("Doctor warnings:");
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  console.log(`Doctor check passed (NODE_ENV=${nodeEnv}, AUTH_MODE=${authMode})`);
}

main().catch((error) => {
  console.error(`Doctor crashed: ${(error as Error).message}`);
  process.exit(1);
});
