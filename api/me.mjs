import { currentUser, userCardCounts } from './_lib/auth.mjs';
import { fail, json } from './_lib/http.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'Use GET');
  try {
    const user = await currentUser(req);
    if (!user) return fail(res, 401, 'Not signed in');
    const stats = await userCardCounts(user.id);
    return json(res, 200, { user, stats });
  } catch (err) {
    console.error('me failed', err);
    return fail(res, 500, 'Could not read the account');
  }
}
