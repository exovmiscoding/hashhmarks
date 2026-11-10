import { kickoffTime, shortDate } from '../lib/format';
import type { Game } from '../lib/types';
import { ArrowUpRight, StatusTag, TeamLogo } from './ui';

function RowTeam({ game, side }: { game: Game; side: Game['away'] }) {
  const dim = game.completed && side.winner === false;
  return (
    <span className={`gr-team${dim ? ' is-loser' : ''}`}>
      <TeamLogo abbr={side.abbr} size={24} />
      <span className="gr-abbr">{side.abbr}</span>
      <span className="gr-record">{side.record ?? ''}</span>
      <span className="gr-score">{game.status === 'pre' ? '' : side.score}</span>
    </span>
  );
}

export function GameRow({ game, onOpen }: { game: Game; onOpen: (game: Game) => void }) {
  return (
    <button type="button" className="game-row" onClick={() => onOpen(game)}>
      <span className="gr-status">
        <StatusTag game={game} />
        <span className="gr-time">
          {game.status === 'pre'
            ? `${shortDate(game.date)} · ${kickoffTime(game.date)}`
            : game.status === 'post'
              ? shortDate(game.date)
              : game.statusShort}
        </span>
      </span>

      <span className="gr-teams">
        <RowTeam game={game} side={game.away} />
        <RowTeam game={game} side={game.home} />
      </span>

      <span className="gr-venue">{game.venue ?? '—'}</span>
      <span className="gr-open" aria-hidden="true">
        <ArrowUpRight size={14} />
      </span>
    </button>
  );
}
