/**
 * Local Postgres for development, backed by PGlite (real Postgres compiled to
 * WASM). Speaks the Postgres wire protocol, so the api/ functions connect with
 * the same `pg` driver and SQL they use in production.
 */
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const PORT = Number(process.env.PG_PORT ?? 5433);
const db = await PGlite.create({ dataDir: './.pgdata' });

// PGlite is single-writer; the multiplexer lets the pg pool hold more than one
// connection, which the API needs for parallel reads inside a request.
const server = new PGLiteSocketServer({ db, port: PORT, host: '127.0.0.1', maxConnections: 10 });
await server.start();
console.log(`local postgres listening on 127.0.0.1:${PORT}`);

const shutdown = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
