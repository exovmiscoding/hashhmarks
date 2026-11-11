import { db } from '../_lib/db.mjs';
import { SESSION_SECONDS, startSession, userCardCounts, verifyPassword } from '../_lib/auth.mjs';
import { fail, isSecureRequest, json, readJson, sessionCookie } from '../_lib/http.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Use POST');
  try {
    const body = await readJson(req);
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!username || !password) return fail(res, 400, 'Enter a username and password');

    const { rows } = await db().query(
      'select id, username, balance, password_hash, created_at from users where username_lower = $1',
      [username.toLowerCase()],
    );
    const user = rows[0];
    // Same response for unknown user and wrong password.
    if (!user || !verifyPassword(password, user.password_hash)) {
      await new Promise((resolve) => setTimeout(resolve, 180));
      return fail(res, 401, 'Username or password is incorrect');
    }

    const token = await startSession(user.id);
    const stats = await userCardCounts(user.id);
    return json(
      res,
      200,
      {
        user: { id: String(user.id), username: user.username, balance: user.balance, createdAt: user.created_at },
        stats,
      },
      { 'set-cookie': sessionCookie(token, SESSION_SECONDS, isSecureRequest(req)) },
    );
  } catch (err) {
    console.error('login failed', err);
    return fail(res, 500, 'Could not sign in');
  }
}
