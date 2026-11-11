import { db } from '../_lib/db.mjs';
import {
  SESSION_SECONDS,
  hashPassword,
  startSession,
  userCardCounts,
  validPassword,
  validUsername,
} from '../_lib/auth.mjs';
import { fail, isSecureRequest, json, readJson, sessionCookie } from '../_lib/http.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Use POST');
  try {
    const body = await readJson(req);
    if (!validUsername(body.username)) {
      return fail(res, 400, 'Username needs 3–20 letters, numbers or underscores');
    }
    if (!validPassword(body.password)) {
      return fail(res, 400, 'Password needs at least 8 characters');
    }

    const username = String(body.username).trim();
    const lower = username.toLowerCase();
    const existing = await db().query('select 1 from users where username_lower = $1', [lower]);
    if (existing.rowCount) return fail(res, 409, 'That username is taken');

    const { rows } = await db().query(
      `insert into users (username, username_lower, password_hash)
       values ($1, $2, $3)
       returning id, username, balance, created_at`,
      [username, lower, hashPassword(body.password)],
    );
    const user = rows[0];
    const token = await startSession(user.id);
    const stats = await userCardCounts(user.id);

    return json(
      res,
      201,
      {
        user: { id: String(user.id), username: user.username, balance: user.balance, createdAt: user.created_at },
        stats,
      },
      { 'set-cookie': sessionCookie(token, SESSION_SECONDS, isSecureRequest(req)) },
    );
  } catch (err) {
    if (err?.code === '23505') return fail(res, 409, 'That username is taken');
    console.error('register failed', err);
    return fail(res, 500, 'Could not create the account');
  }
}
