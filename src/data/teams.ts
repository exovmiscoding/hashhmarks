export interface Team {
  abbr: string;
  name: string;
  nickname: string;
  conference: 'AFC' | 'NFC';
  division: string;
  color: string;
  altColor: string;
  logoSlug: string;
}

export const TEAMS: Team[] = [
  { abbr: 'ARI', name: 'Arizona Cardinals', nickname: 'Cardinals', conference: 'NFC', division: 'West', color: '#97233F', altColor: '#000000', logoSlug: 'ari' },
  { abbr: 'ATL', name: 'Atlanta Falcons', nickname: 'Falcons', conference: 'NFC', division: 'South', color: '#A71930', altColor: '#000000', logoSlug: 'atl' },
  { abbr: 'BAL', name: 'Baltimore Ravens', nickname: 'Ravens', conference: 'AFC', division: 'North', color: '#241773', altColor: '#9E7C0C', logoSlug: 'bal' },
  { abbr: 'BUF', name: 'Buffalo Bills', nickname: 'Bills', conference: 'AFC', division: 'East', color: '#00338D', altColor: '#C60C30', logoSlug: 'buf' },
  { abbr: 'CAR', name: 'Carolina Panthers', nickname: 'Panthers', conference: 'NFC', division: 'South', color: '#0085CA', altColor: '#101820', logoSlug: 'car' },
  { abbr: 'CHI', name: 'Chicago Bears', nickname: 'Bears', conference: 'NFC', division: 'North', color: '#0B162A', altColor: '#C83803', logoSlug: 'chi' },
  { abbr: 'CIN', name: 'Cincinnati Bengals', nickname: 'Bengals', conference: 'AFC', division: 'North', color: '#FB4F14', altColor: '#000000', logoSlug: 'cin' },
  { abbr: 'CLE', name: 'Cleveland Browns', nickname: 'Browns', conference: 'AFC', division: 'North', color: '#311D00', altColor: '#FF3C00', logoSlug: 'cle' },
  { abbr: 'DAL', name: 'Dallas Cowboys', nickname: 'Cowboys', conference: 'NFC', division: 'East', color: '#003594', altColor: '#869397', logoSlug: 'dal' },
  { abbr: 'DEN', name: 'Denver Broncos', nickname: 'Broncos', conference: 'AFC', division: 'West', color: '#FB4F14', altColor: '#002244', logoSlug: 'den' },
  { abbr: 'DET', name: 'Detroit Lions', nickname: 'Lions', conference: 'NFC', division: 'North', color: '#0076B6', altColor: '#B0B7BC', logoSlug: 'det' },
  { abbr: 'GB', name: 'Green Bay Packers', nickname: 'Packers', conference: 'NFC', division: 'North', color: '#203731', altColor: '#FFB612', logoSlug: 'gb' },
  { abbr: 'HOU', name: 'Houston Texans', nickname: 'Texans', conference: 'AFC', division: 'South', color: '#03202F', altColor: '#A71930', logoSlug: 'hou' },
  { abbr: 'IND', name: 'Indianapolis Colts', nickname: 'Colts', conference: 'AFC', division: 'South', color: '#002C5F', altColor: '#A2AAAD', logoSlug: 'ind' },
  { abbr: 'JAX', name: 'Jacksonville Jaguars', nickname: 'Jaguars', conference: 'AFC', division: 'South', color: '#101820', altColor: '#D7A22A', logoSlug: 'jax' },
  { abbr: 'KC', name: 'Kansas City Chiefs', nickname: 'Chiefs', conference: 'AFC', division: 'West', color: '#E31837', altColor: '#FFB81C', logoSlug: 'kc' },
  { abbr: 'LV', name: 'Las Vegas Raiders', nickname: 'Raiders', conference: 'AFC', division: 'West', color: '#1A1A1A', altColor: '#A5ACAF', logoSlug: 'lv' },
  { abbr: 'LAC', name: 'Los Angeles Chargers', nickname: 'Chargers', conference: 'AFC', division: 'West', color: '#0080C6', altColor: '#FFC20E', logoSlug: 'lac' },
  { abbr: 'LAR', name: 'Los Angeles Rams', nickname: 'Rams', conference: 'NFC', division: 'West', color: '#003594', altColor: '#FFA300', logoSlug: 'lar' },
  { abbr: 'MIA', name: 'Miami Dolphins', nickname: 'Dolphins', conference: 'AFC', division: 'East', color: '#008E97', altColor: '#FC4C02', logoSlug: 'mia' },
  { abbr: 'MIN', name: 'Minnesota Vikings', nickname: 'Vikings', conference: 'NFC', division: 'North', color: '#4F2683', altColor: '#FFC62F', logoSlug: 'min' },
  { abbr: 'NE', name: 'New England Patriots', nickname: 'Patriots', conference: 'AFC', division: 'East', color: '#002244', altColor: '#C60C30', logoSlug: 'ne' },
  { abbr: 'NO', name: 'New Orleans Saints', nickname: 'Saints', conference: 'NFC', division: 'South', color: '#D3BC8D', altColor: '#101820', logoSlug: 'no' },
  { abbr: 'NYG', name: 'New York Giants', nickname: 'Giants', conference: 'NFC', division: 'East', color: '#0B2265', altColor: '#A71930', logoSlug: 'nyg' },
  { abbr: 'NYJ', name: 'New York Jets', nickname: 'Jets', conference: 'AFC', division: 'East', color: '#125740', altColor: '#FFFFFF', logoSlug: 'nyj' },
  { abbr: 'PHI', name: 'Philadelphia Eagles', nickname: 'Eagles', conference: 'NFC', division: 'East', color: '#004C54', altColor: '#A5ACAF', logoSlug: 'phi' },
  { abbr: 'PIT', name: 'Pittsburgh Steelers', nickname: 'Steelers', conference: 'AFC', division: 'North', color: '#FFB612', altColor: '#101820', logoSlug: 'pit' },
  { abbr: 'SF', name: 'San Francisco 49ers', nickname: '49ers', conference: 'NFC', division: 'West', color: '#AA0000', altColor: '#B3995D', logoSlug: 'sf' },
  { abbr: 'SEA', name: 'Seattle Seahawks', nickname: 'Seahawks', conference: 'NFC', division: 'West', color: '#002244', altColor: '#69BE28', logoSlug: 'sea' },
  { abbr: 'TB', name: 'Tampa Bay Buccaneers', nickname: 'Buccaneers', conference: 'NFC', division: 'South', color: '#D50A0A', altColor: '#34302B', logoSlug: 'tb' },
  { abbr: 'TEN', name: 'Tennessee Titans', nickname: 'Titans', conference: 'AFC', division: 'South', color: '#0C2340', altColor: '#4B92DB', logoSlug: 'ten' },
  { abbr: 'WAS', name: 'Washington Commanders', nickname: 'Commanders', conference: 'NFC', division: 'East', color: '#5A1414', altColor: '#FFB612', logoSlug: 'wsh' },
];

export const TEAM_BY_ABBR: Record<string, Team> = Object.fromEntries(
  TEAMS.map((team) => [team.abbr, team]),
);

/** ESPN sometimes uses different abbreviations than the ones fans read. */
export function normalizeAbbr(raw: string): string {
  const abbr = (raw || '').toUpperCase();
  const aliases: Record<string, string> = {
    WSH: 'WAS',
    WAS: 'WAS',
    JAC: 'JAX',
    LA: 'LAR',
    STL: 'LAR',
    SD: 'LAC',
    OAK: 'LV',
    '49ERS': 'SF',
    NINERS: 'SF',
  };
  return aliases[abbr] ?? abbr;
}

export function logoUrl(slug: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${slug}.png`;
}

export function teamColor(abbr: string): string {
  return TEAM_BY_ABBR[abbr]?.color ?? '#2a3550';
}
