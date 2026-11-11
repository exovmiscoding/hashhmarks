import { playerById, publicPlayer } from '../_lib/cards.mjs';
import { fail, json } from '../_lib/http.mjs';

const STATS_URL = (season, id) =>
  `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${season}/types/2/athletes/${id}/statistics`;

/** The stats worth reading, in the order they should appear. */
const CATEGORY_STATS = {
  passing: ['completions', 'passingAttempts', 'completionPct', 'passingYards', 'passingTouchdowns', 'interceptions', 'longPassing'],
  rushing: ['rushingAttempts', 'rushingYards', 'avgGain', 'rushingTouchdowns', 'longRushing', 'rushingFirstDowns'],
  receiving: ['receptions', 'receivingTargets', 'receivingYards', 'receivingYardsAfterCatch', 'receivingTouchdowns', 'longReception'],
  defensive: ['totalTackles', 'soloTackles', 'assistTackles', 'sacks', 'tacklesForLoss', 'passesDefended', 'stuffs'],
  defensiveInterceptions: ['interceptions', 'interceptionYards', 'interceptionTouchdowns'],
  kicking: ['fieldGoalsMade', 'fieldGoalAttempts', 'fieldGoalPct', 'longFieldGoal', 'extraPointsMade'],
};

const LABELS = {
  completions: 'CMP',
  passingAttempts: 'ATT',
  completionPct: 'CMP%',
  passingYards: 'YDS',
  passingTouchdowns: 'TD',
  interceptions: 'INT',
  longPassing: 'LNG',
  rushingAttempts: 'CAR',
  rushingYards: 'YDS',
  avgGain: 'AVG',
  rushingTouchdowns: 'TD',
  longRushing: 'LNG',
  rushingFirstDowns: '1ST',
  receptions: 'REC',
  receivingTargets: 'TGT',
  receivingYards: 'YDS',
  receivingYardsAfterCatch: 'YAC',
  receivingTouchdowns: 'TD',
  longReception: 'LNG',
  totalTackles: 'TKL',
  soloTackles: 'SOLO',
  assistTackles: 'AST',
  sacks: 'SACK',
  tacklesForLoss: 'TFL',
  passesDefended: 'PD',
  stuffs: 'STF',
  interceptionYards: 'YDS',
  interceptionTouchdowns: 'TD',
  fieldGoalsMade: 'FGM',
  fieldGoalAttempts: 'FGA',
  fieldGoalPct: 'FG%',
  longFieldGoal: 'LNG',
  extraPointsMade: 'XP',
};

/** Which tables make sense for each position. */
const POSITION_CATEGORIES = {
  QB: ['passing', 'rushing'],
  RB: ['rushing', 'receiving'],
  FB: ['rushing', 'receiving'],
  WR: ['receiving', 'rushing'],
  TE: ['receiving', 'rushing'],
  K: ['kicking'],
  P: ['kicking'],
  DE: ['defensive'],
  DT: ['defensive'],
  NT: ['defensive'],
  EDGE: ['defensive'],
  LB: ['defensive', 'defensiveInterceptions'],
  ILB: ['defensive', 'defensiveInterceptions'],
  MLB: ['defensive', 'defensiveInterceptions'],
  OLB: ['defensive', 'defensiveInterceptions'],
  CB: ['defensive', 'defensiveInterceptions'],
  DB: ['defensive', 'defensiveInterceptions'],
  S: ['defensive', 'defensiveInterceptions'],
  FS: ['defensive', 'defensiveInterceptions'],
  SS: ['defensive', 'defensiveInterceptions'],
};

const DEFAULT_CATEGORIES = ['passing', 'rushing', 'receiving', 'defensive', 'kicking'];

function isMeaningful(value) {
  const numeric = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) && numeric > 0;
}

function normalize(player, payload) {
  const categories = new Map();
  for (const category of payload?.splits?.categories ?? []) {
    const stats = new Map((category.stats ?? []).map((stat) => [stat.name, stat]));
    categories.set(category.name, { label: category.displayName ?? category.name, stats });
  }

  const wanted = POSITION_CATEGORIES[player.position] ?? DEFAULT_CATEGORIES;
  const out = [];
  for (const name of wanted) {
    const entry = categories.get(name);
    if (!entry) continue;
    const lines = [];
    for (const statName of CATEGORY_STATS[name] ?? []) {
      const stat = entry.stats.get(statName);
      if (!stat || !isMeaningful(stat.displayValue)) continue;
      lines.push({
        label: LABELS[statName] ?? stat.abbreviation ?? statName,
        name: stat.displayName ?? statName,
        value: String(stat.displayValue),
      });
    }
    if (lines.length) out.push({ name, label: entry.label, stats: lines });
  }
  return out;
}

async function seasonStats(player, season) {
  const res = await fetch(STATS_URL(season, player.id), { headers: { accept: 'application/json' } });
  if (!res.ok) return null;
  const payload = await res.json();
  const categories = normalize(player, payload);
  return categories.length ? categories : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'Use GET');
  try {
    const url = new URL(req.url, 'http://internal');
    const id = String(req.query?.id ?? url.pathname.split('/').filter(Boolean).pop() ?? '');
    const player = playerById(id);
    if (!player) return fail(res, 404, 'Unknown player');

    const requested = Number(req.query?.season ?? url.searchParams.get('season'));
    const current = Number.isFinite(requested) && requested > 2000 ? requested : new Date().getUTCFullYear();

    let season = current;
    let categories = await seasonStats(player, current);
    if (!categories) {
      // Only label the older season when it actually carries a stat line.
      const previous = await seasonStats(player, current - 1);
      if (previous) {
        season = current - 1;
        categories = previous;
      }
    }

    res.setHeader('cache-control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return json(res, 200, {
      player: publicPlayer(player),
      season,
      categories: categories ?? [],
      source: 'ESPN',
    });
  } catch (err) {
    console.error('player stats failed', err);
    return fail(res, 502, 'Could not load player stats');
  }
}
