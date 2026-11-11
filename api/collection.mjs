import { currentUser } from './_lib/auth.mjs';
import { playerById, publicPlayer } from './_lib/cards.mjs';
import { db } from './_lib/db.mjs';
import { fail, json } from './_lib/http.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'Use GET');
  try {
    const user = await currentUser(req);
    if (!user) return fail(res, 401, 'Not signed in');

    const { rows } = await db().query(
      `select id, player_id, rarity, reward, created_at
         from pulls
        where user_id = $1
        order by created_at desc, id desc`,
      [user.id],
    );

    const cards = [];
    for (const row of rows) {
      const player = playerById(row.player_id);
      if (!player) continue;
      cards.push({
        ...publicPlayer(player),
        reward: row.reward,
        pullId: String(row.id),
        obtainedAt: row.created_at,
      });
    }

    return json(res, 200, { balance: user.balance, cards });
  } catch (err) {
    console.error('collection failed', err);
    return fail(res, 500, 'Could not read the collection');
  }
}
