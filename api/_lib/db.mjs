import pg from 'pg';

const { Pool } = pg;

let pool;

/** One pooled client per function instance, reused across warm invocations. */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not configured');
  if (!pool) {
    const local = /localhost|127\.0\.0\.1/.test(url);
    pool = new Pool({
      connectionString: url,
      max: 3,
      idleTimeoutMillis: 10_000,
      ...(local ? {} : { ssl: { rejectUnauthorized: false } }),
    });
  }
  return pool;
}
