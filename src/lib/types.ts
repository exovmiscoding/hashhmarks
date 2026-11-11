export type GameStatus = 'pre' | 'in' | 'post';
export type GameSource = 'espn';

export interface Side {
  id: string;
  abbr: string;
  name: string;
  nickname: string;
  color: string;
  altColor: string;
  logo: string;
  record?: string;
  score: number;
  winner?: boolean;
  linescores?: number[];
}

export interface ScoringPlay {
  id: string;
  period: number;
  clock: string;
  teamAbbr: string;
  label: string;
  points: number;
  text: string;
  awayScore: number;
  homeScore: number;
}

export interface Game {
  id: string;
  date: string;
  week?: number;
  status: GameStatus;
  statusDetail: string;
  statusShort: string;
  completed: boolean;
  period: number;
  clock: string;
  away: Side;
  home: Side;
  venue?: string;
  broadcast?: string;
  lastPlay?: string;
  possession?: string;
  downDistance?: string;
  scoringPlays: ScoringPlay[];
  source: GameSource;
}

export interface NewsItem {
  id: string;
  headline: string;
  description: string;
  published: string;
  image?: string;
  url?: string;
  teamAbbrs: string[];
  source?: string;
  category?: string;
}

export interface ScoreboardMeta {
  season: number;
  week: number;
  seasonType: number;
}

export interface ScoreAlert {
  id: string;
  gameId: string;
  abbr: string;
  teamName: string;
  delta: number;
  points: number;
  awayAbbr: string;
  homeAbbr: string;
  awayScore: number;
  homeScore: number;
  playText?: string;
  colors: string[];
}

export type TabKey = 'live' | 'scores' | 'news' | 'cards';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PlayerCard {
  id: string;
  name: string;
  position: string;
  team: string;
  jersey: string | null;
  experience: number | null;
  college: string | null;
  height: string | null;
  weight: string | null;
  headshot: string | null;
  rarity: Rarity;
}

export interface Pull extends PlayerCard {
  reward: number;
  duplicate?: boolean;
  pullId?: string;
  obtainedAt?: string;
}

export interface Account {
  id: string;
  username: string;
  balance: number;
  createdAt: string;
}

export interface AccountStats {
  counts: Record<Rarity, number>;
  pulls: number;
  unique: number;
}

export interface StatLine {
  label: string;
  name: string;
  value: string;
}

export interface StatCategory {
  name: string;
  label: string;
  stats: StatLine[];
}

export interface PlayerStats {
  player: PlayerCard;
  season: number;
  categories: StatCategory[];
}
