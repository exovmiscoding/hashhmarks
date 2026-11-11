import { currentUser } from './_lib/auth.mjs';
import { REWARD, pickPlayer, publicPlayer, rollRarity } from './_lib/cards.mjs';
import { db } from './_lib/db.mjs';
import { fail, json } from './_lib/http.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Use POST');

  let client;
  try {
    const user = await currentUser(req);
    if (!user) return fail(res, 401, 'Sign in to draw a card');

    client = await db().connect();
    await client.query('begin');

    const owned = await client.query('select distinct player_id from pulls where user_id = $1', [user.id]);
    const ownedIds = new Set(owned.rows.map((row) => row.player_id));

    const rarity = rollRarity();
    const player = pickPlayer(rarity, ownedIds);
    const reward = REWARD[rarity];
    const duplicate = ownedIds.has(player.id);

    const inserted = await client.query(
      `insert into pulls (user_id, player_id, rarity, reward)
       values ($1, $2, $3, $4)
       returning id, created_at`,
      [user.id, player.id, rarity, reward],
    );
    const updated = await client.query(
      'update users set balance = balance + $2 where id = $1 returning balance',
      [user.id, reward],
    );
    await client.query('commit');

    return json(res, 200, {
      card: {
        ...publicPlayer(player),
        reward,
        duplicate,
        pullId: String(inserted.rows[0].id),
        obtainedAt: inserted.rows[0].created_at,
      },
      balance: updated.rows[0].balance,
    });
  } catch (err) {
    if (client) await client.query('rollback').catch(() => {});
    console.error('draw failed', err);
    return fail(res, 500, 'Could not draw a card');
  } finally {
    client?.release();
  }
}
