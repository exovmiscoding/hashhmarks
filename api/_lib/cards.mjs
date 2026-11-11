import { PLAYERS } from '../../shared/players.mjs';

export const REWARD = { common: 5, rare: 10, epic: 30, legendary: 100 };
export const RARITIES = ['common', 'rare', 'epic', 'legendary'];

/** 54% common, 30% rare, 12% epic, 4% legendary. */
const ODDS = [
  ['legendary', 4],
  ['epic', 12],
  ['rare', 30],
  ['common', 54],
];

const BY_RARITY = { common: [], rare: [], epic: [], legendary: [] };
for (const player of PLAYERS) {
  (BY_RARITY[player.rarity] ?? BY_RARITY.common).push(player);
}

export function rollRarity(random = Math.random) {
  let roll = random() * 100;
  for (const [rarity, weight] of ODDS) {
    if (roll < weight) return rarity;
    roll -= weight;
  }
  return 'common';
}

/** Prefers a card the account does not own yet, so pulls stay interesting. */
export function pickPlayer(rarity, ownedIds, random = Math.random) {
  const pool = BY_RARITY[rarity];
  if (!pool?.length) throw new Error(`No players are rated ${rarity}`);
  const fresh = pool.filter((player) => !ownedIds.has(player.id));
  const source = fresh.length ? fresh : pool;
  const index = Math.min(source.length - 1, Math.floor(random() * source.length));
  return source[index];
}

export function publicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    team: player.team,
    jersey: player.jersey,
    experience: player.experience,
    college: player.college,
    height: player.height,
    weight: player.weight,
    headshot: player.headshot,
    rarity: player.rarity,
  };
}

export function playerById(id) {
  return PLAYERS.find((player) => player.id === String(id)) ?? null;
}
