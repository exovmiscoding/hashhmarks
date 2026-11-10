import { TEAM_BY_ABBR, logoUrl, normalizeAbbr } from '../data/teams';
import type {
  Game,
  GameStatus,
  NewsItem,
  ScoreboardMeta,
  ScoringPlay,
  Side,
} from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = Record<string, any>;

const BASE = import.meta.env.DEV ? '/espn' : 'https://site.api.espn.com';

async function getJson<T = Json>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseSide(competitor: Json): Side {
  const raw = competitor?.team ?? {};
  const abbr = normalizeAbbr(String(raw.abbreviation ?? raw.shortDisplayName ?? ''));
  const local = TEAM_BY_ABBR[abbr];
  return {
    id: String(raw.id ?? competitor?.id ?? abbr),
    abbr,
    name: raw.displayName ?? local?.name ?? abbr,
    nickname: raw.name ?? local?.nickname ?? abbr,
    color: local?.color ?? (raw.color ? `#${raw.color}` : '#2a3550'),
    altColor: local?.altColor ?? (raw.alternateColor ? `#${raw.alternateColor}` : '#0f172a'),
    logo: logoUrl(local?.logoSlug ?? abbr.toLowerCase()),
    record: competitor?.records?.[0]?.summary ?? undefined,
    score: num(competitor?.score),
    winner: typeof competitor?.winner === 'boolean' ? competitor.winner : undefined,
    linescores: Array.isArray(competitor?.linescores)
      ? competitor.linescores.map((line: Json) => num(line?.value))
      : undefined,
  };
}

function deriveState(state: string): GameStatus {
  if (state === 'in') return 'in';
  if (state === 'post') return 'post';
  return 'pre';
}

export function parseGame(event: Json): Game {
  const comp = event?.competitions?.[0] ?? {};
  const competitors: Json[] = Array.isArray(comp.competitors) ? comp.competitors : [];
  const homeRaw = competitors.find((c) => c?.homeAway === 'home') ?? competitors[0] ?? {};
  const awayRaw = competitors.find((c) => c?.homeAway === 'away') ?? competitors[1] ?? {};
  const home = parseSide(homeRaw);
  const away = parseSide(awayRaw);

  const statusType = comp?.status?.type ?? {};
  const status = deriveState(String(statusType.state ?? 'pre'));
  const situation = comp?.situation ?? {};
  const possessionId = situation?.possession ? String(situation.possession) : undefined;
  const possession =
    possessionId && possessionId === home.id
      ? home.abbr
      : possessionId && possessionId === away.id
        ? away.abbr
        : undefined;

  const broadcasts = Array.isArray(comp?.broadcasts)
    ? comp.broadcasts.flatMap((b: Json) => b?.names ?? []).join(', ')
    : '';

  return {
    id: String(event?.id ?? comp?.id ?? ''),
    date: String(comp?.date ?? event?.date ?? new Date().toISOString()),
    week: num(event?.week?.number, 0) || undefined,
    status,
    statusDetail: String(statusType.detail ?? statusType.description ?? ''),
    statusShort: String(statusType.shortDetail ?? statusType.description ?? ''),
    completed: Boolean(statusType.completed) || status === 'post',
    period: num(comp?.status?.period),
    clock: String(comp?.status?.displayClock ?? '0:00'),
    away,
    home,
    venue: comp?.venue?.fullName ?? undefined,
    broadcast: broadcasts || undefined,
    lastPlay: situation?.lastPlay?.text ?? undefined,
    possession,
    downDistance: situation?.downDistanceText ?? undefined,
    scoringPlays: [],
    source: 'espn',
  };
}

function playLabel(play: Json): string {
  const type = play?.type ?? {};
  const scoringType = play?.scoringType ?? {};
  const name = String(scoringType?.name ?? '').toLowerCase().replace(/[^a-z]/g, '');
  if (name === 'touchdown') return 'TD';
  if (name === 'fieldgoal') return 'FG';
  if (name === 'safety') return 'SF';
  if (name === 'extrapoint') return 'PAT';
  if (name === 'twopointconversion') return '2PT';
  const abbr = String(type?.abbreviation ?? type?.text ?? '').toUpperCase();
  if (['TD', 'FG', 'SF', 'PAT', '2PT'].includes(abbr)) return abbr;
  return abbr.slice(0, 4) || 'SCORE';
}

function defaultPoints(label: string): number {
  if (label === 'TD') return 6;
  if (label === 'FG') return 3;
  if (label === 'SF') return 2;
  if (label === 'PAT') return 1;
  if (label === '2PT') return 2;
  return 0;
}

/** Builds a chronological scoring timeline with the running score after each play. */
export function parseScoringPlays(raw: Json[], awayAbbr: string, homeAbbr: string): ScoringPlay[] {
  let away = 0;
  let home = 0;
  return raw.map((play, index) => {
    const abbr = normalizeAbbr(String(play?.team?.abbreviation ?? ''));
    const hasAway = typeof play?.awayScore === 'number' || typeof play?.awayScore === 'string';
    const hasHome = typeof play?.homeScore === 'number' || typeof play?.homeScore === 'string';
    const nextAway = hasAway ? num(play?.awayScore, away) : away;
    const nextHome = hasHome ? num(play?.homeScore, home) : home;
    const label = playLabel(play);
    const previous = abbr === awayAbbr ? away : abbr === homeAbbr ? home : 0;
    const current = abbr === awayAbbr ? nextAway : abbr === homeAbbr ? nextHome : 0;
    const delta = current - previous;
    const points = delta > 0 ? delta : defaultPoints(label);
    away = nextAway;
    home = nextHome;
    return {
      id: String(play?.id ?? `${index}`),
      period: num(play?.period?.number, 1),
      clock: String(play?.clock?.displayValue ?? ''),
      teamAbbr: abbr,
      label,
      points,
      text: String(play?.text ?? '').trim(),
      awayScore: away,
      homeScore: home,
    };
  });
}

export interface ScoreboardResult {
  games: Game[];
  meta: ScoreboardMeta | null;
}

export async function fetchScoreboard(
  params?: { year?: number; week?: number; seasonType?: number },
  signal?: AbortSignal,
): Promise<ScoreboardResult> {
  const build = (withDates: boolean) => {
    const query = new URLSearchParams();
    if (params?.week) query.set('week', String(params.week));
    if (params?.seasonType) query.set('seasontype', String(params.seasonType));
    if (withDates && params?.year) query.set('dates', String(params.year));
    const qs = query.toString();
    return `/apis/site/v2/sports/football/nfl/scoreboard${qs ? `?${qs}` : ''}`;
  };

  let data = await getJson(build(true), signal);
  let events: Json[] = Array.isArray(data?.events) ? data.events : [];

  if (events.length === 0 && params?.week) {
    data = await getJson(build(false), signal);
    events = Array.isArray(data?.events) ? data.events : [];
  }

  const games = events.map(parseGame).filter((game) => game.id !== '');
  const meta: ScoreboardMeta | null = data?.week
    ? {
        season: num(data?.season?.year, new Date().getFullYear()),
        week: num(data?.week?.number, 1),
        seasonType: num(data?.season?.type?.id ?? data?.season?.type, 2),
      }
    : null;

  return { games, meta };
}

export async function fetchGameSummary(
  gameId: string,
  awayAbbr: string,
  homeAbbr: string,
  signal?: AbortSignal,
): Promise<ScoringPlay[]> {
  const data = await getJson(`/apis/site/v2/sports/football/nfl/summary?event=${encodeURIComponent(gameId)}`, signal);
  const raw = Array.isArray(data?.scoringPlays) ? data.scoringPlays : [];
  return parseScoringPlays(raw, awayAbbr, homeAbbr);
}

export async function fetchNews(limit = 30, signal?: AbortSignal): Promise<NewsItem[]> {
  const data = await getJson(`/apis/site/v2/sports/football/nfl/news?limit=${limit}`, signal);
  const articles: Json[] = Array.isArray(data?.articles) ? data.articles : [];

  return articles.map((article, index) => {
    const categories: Json[] = Array.isArray(article?.categories) ? article.categories : [];
    const teamAbbrs = Array.from(
      new Set(
        categories
          .filter((c) => c?.type === 'team')
          .map((c) => normalizeAbbr(String(c?.team?.abbreviation ?? c?.teamAbbreviation ?? '')))
          .filter((abbr) => Boolean(TEAM_BY_ABBR[abbr])),
      ),
    );
    const league = categories.find((c) => c?.type === 'league');
    const image =
      article?.images?.[0]?.url ??
      (Array.isArray(article?.images) && typeof article.images[0] === 'string' ? article.images[0] : undefined);

    return {
      id: String(article?.id ?? index),
      headline: String(article?.headline ?? 'Untitled'),
      description: String(article?.description ?? ''),
      published: String(article?.published ?? article?.lastModified ?? new Date().toISOString()),
      image,
      url: article?.links?.web?.href ?? undefined,
      teamAbbrs,
      source: article?.byline ? String(article.byline) : 'ESPN',
      category: league?.description ? String(league.description) : undefined,
    };
  });
}
