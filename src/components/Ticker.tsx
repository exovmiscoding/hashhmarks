import type { Game } from '../lib/types';

const RANK: Record<Game['status'], number> = { in: 0, pre: 1, post: 2 };

export function Ticker({ games }: { games: Game[] }) {
  if (!games.length) return null;

  const ordered = [...games].sort((a, b) => RANK[a.status] - RANK[b.status]);
  const strip = [...ordered, ...ordered];
  const duration = Math.max(28, ordered.length * 4.5);

  return (
    <div className="ticker" aria-label="Score ticker">
      <span className="ticker-label">Scores</span>
      <div className="ticker-viewport">
        <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
          {strip.map((game, index) => (
            <span className="ticker-item" key={`${game.id}-${index}`}>
              <span className={`ticker-flag${game.status === 'in' ? ' is-live' : ''}`}>
                {game.status === 'in' ? 'Live' : game.status === 'post' ? 'Final' : 'Today'}
              </span>
              <span className="ticker-team">{game.away.abbr}</span>
              <span className="ticker-score">{game.status === 'pre' ? '–' : game.away.score}</span>
              <span className="ticker-sep">:</span>
              <span className="ticker-score">{game.status === 'pre' ? '–' : game.home.score}</span>
              <span className="ticker-team">{game.home.abbr}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
