import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from './db.mjs';
import { parseCookies } from './http.mjs';

export const SESSION_SECONDS = 60 * 60 * 24 * 30;
const KEY_LEN = 64;

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored ?? '').split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const candidate = scryptSync(password, salt, KEY_LEN);
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

export async function startSession(userId) {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_SECONDS * 1000);
  await db().query(
    'insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)',
    [tokenHash(token), userId, expires],
  );
  return token;
}

export async function endSession(token) {
  if (!token) return;
  await db().query('delete from sessions where token_hash = $1', [tokenHash(token)]);
}

export function readToken(req) {
  return parseCookies(req.headers.cookie ?? '').hm_session ?? null;
}

/** Resolves the signed-in user, or null. Never trusts a client-supplied id. */
export async function currentUser(req) {
  const token = readToken(req);
  if (!token) return null;
  const { rows } = await db().query(
    `select u.id, u.username, u.balance, u.created_at
       from sessions s
       join users u on u.id = s.user_id
      where s.token_hash = $1 and s.expires_at > now()`,
    [tokenHash(token)],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    username: row.username,
    balance: row.balance,
    createdAt: row.created_at,
  };
}

export function validUsername(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_]{3,20}$/.test(value);
}

export function validPassword(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 200;
}

export async function userCardCounts(userId) {
  const { rows } = await db().query(
    `select rarity, count(*)::int as pulls, count(distinct player_id)::int as unique
       from pulls where user_id = $1 group by rarity`,
    [userId],
  );
  const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
  let pulls = 0;
  let unique = 0;
  for (const row of rows) {
    counts[row.rarity] = row.unique;
    pulls += row.pulls;
    unique += row.unique;
  }
  return { counts, pulls, unique };
}
