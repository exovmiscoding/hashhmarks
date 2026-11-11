/**
 * Local stand-in for Vercel's function router: mounts the exact handlers that
 * ship in /api so behaviour matches production changes.
 */
import http from 'node:http';
import register from '../api/auth/register.mjs';
import login from '../api/auth/login.mjs';
import logout from '../api/auth/logout.mjs';
import me from '../api/me.mjs';
import draw from '../api/draw.mjs';
import collection from '../api/collection.mjs';
import player from '../api/player/[id].mjs';

const PORT = Number(process.env.API_PORT ?? 8787);

const routes = new Map([
  ['/api/auth/register', { POST: register }],
  ['/api/auth/login', { POST: login }],
  ['/api/auth/logout', { POST: logout }],
  ['/api/me', { GET: me }],
  ['/api/draw', { POST: draw }],
  ['/api/collection', { GET: collection }],
]);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const playerMatch = url.pathname.match(/^\/api\/player\/([^/]+)$/);
  const entry = routes.get(url.pathname) ?? (playerMatch ? { GET: player } : null);

  if (!entry) {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const handler = entry[req.method];
  if (!handler) {
    res.writeHead(405, { 'content-type': 'application/json', allow: Object.keys(entry).join(', ') });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  req.query = Object.fromEntries(url.searchParams);
  if (playerMatch) req.query.id = decodeURIComponent(playerMatch[1]);

  try {
    await handler(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unhandled error' }));
    }
  }
});

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Copy .env.example to .env and point it at Postgres.');
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`API listening on http://127.0.0.1:${PORT}`);
});
