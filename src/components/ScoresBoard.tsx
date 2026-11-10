import { useMemo } from 'react';
import { shortDate } from '../lib/format';
import type { Game } from '../lib/types';
import { GameRow } from './GameRow';
import { ChevronLeft, ChevronRight, EmptyState } from './ui';

interface ScoresBoardProps {
  games: Game[];
  loading: boolean;
  error: string | null;
  week: number;
  onWeek: (week: number) => void;
  seasonType: number;
  onSeasonType: (type: number) => void;
  year: number;
  onOpen: (game: Game) => void;
}

export function ScoresBoard({
  games,
  loading,
  error,
  week,
  onWeek,
  seasonType,
  onSeasonType,
  year,
  onOpen,
}: ScoresBoardProps) {
  const groups = useMemo(() => {
    const map = new Map<string, Game[]>();
    const ordered = [...games].sort((a, b) => a.date.localeCompare(b.date));
    for (const game of ordered) {
      const key = shortDate(game.date) || 'Date to be confirmed';
      const list = map.get(key) ?? [];
      list.push(game);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [games]);

  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">
          <span className="section-index">02</span>Scoreboard
        </h2>
        <span className="micro">
          {seasonType === 3 ? 'Postseason' : 'Regular season'} · {year}
        </span>
      </div>

      <div className="weekbar">
        <button
          type="button"
          className="sq-btn"
          onClick={() => onWeek(Math.max(1, week - 1))}
          disabled={week <= 1}
          aria-label="Previous week"
        >
          <ChevronLeft />
        </button>
        <div className="week-display">
          <span className="micro">Week</span>
          <span className="week-num">{String(week).padStart(2, '0')}</span>
        </div>
        <button
          type="button"
          className="sq-btn"
          onClick={() => onWeek(Math.min(18, week + 1))}
          disabled={week >= 18}
          aria-label="Next week"
        >
          <ChevronRight />
        </button>

        <div className="seg" role="group" aria-label="Season phase">
          <button
            type="button"
            className={`seg-btn${seasonType === 2 ? ' is-active' : ''}`}
            onClick={() => onSeasonType(2)}
          >
            Regular
          </button>
          <button
            type="button"
            className={`seg-btn${seasonType === 3 ? ' is-active' : ''}`}
            onClick={() => onSeasonType(3)}
          >
            Postseason
          </button>
        </div>

        {loading ? <span className="micro">Loading</span> : null}
      </div>

      {error && games.length === 0 ? (
        <EmptyState title="That week is out of reach" body={error} />
      ) : null}

      {!error && !loading && games.length === 0 ? (
        <EmptyState
          title="No games listed for this week"
          body="Try another week, or switch between the regular season and the postseason."
        />
      ) : null}

      {groups.map(([date, list]) => (
        <div className="date-group" key={date}>
          <div className="date-head">
            <span>{date}</span>
            <span className="micro">
              {list.length} {list.length === 1 ? 'game' : 'games'}
            </span>
          </div>
          {list.map((game) => (
            <GameRow key={game.id} game={game} onOpen={onOpen} />
          ))}
        </div>
      ))}
    </section>
  );
}
