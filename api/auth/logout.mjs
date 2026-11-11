import { endSession, readToken } from '../_lib/auth.mjs';
import { fail, isSecureRequest, json, sessionCookie } from '../_lib/http.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Use POST');
  try {
    await endSession(readToken(req));
    return json(res, 200, { ok: true }, { 'set-cookie': sessionCookie('', 0, isSecureRequest(req)) });
  } catch (err) {
    console.error('logout failed', err);
    return fail(res, 500, 'Could not sign out');
  }
}
