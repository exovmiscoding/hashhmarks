import type { CSSProperties } from 'react';
import { ordinalPeriod, shortDate } from '../lib/format';
import type { Game, Side } from '../lib/types';
import { TeamLogo, StatusTag } from './ui';

function TeamLine({ side, game }: { side: Side; game: Game }) {
  const hasBall = game.possession === side.abbr;
  const isLoser = game.completed && side.winner === false;

  return (
    <div className={`team-line${isLoser ? ' is-loser' : ''}`}>
      <span className="ball-slot" aria-hidden="true">
        {hasBall ? <span className="ball" style={{ background: side.color }} /> : null}
      </span>
      <TeamLogo abbr={side.abbr} size={42} />
      <span className="team-id">
        <span className="team-abbr">{side.abbr}</span>
        <span className="team-name">
          {side.nickname}
          {side.record ? ` · ${side.record}` : ''}
        </span>
      </span>
      <span className="team-score">{game.status === 'pre' ? '–' : side.score}</span>
    </div>
  );
}

interface LiveBoardProps {
  game: Game;
  onOpen: (game: Game) => void;
}

export function LiveBoard({ game, onOpen }: LiveBoardProps) {
  const recent = [...game.scoringPlays].slice(-3).reverse();
  const lastScore = game.scoringPlays[game.scoringPlays.length - 1];
  const playText = game.lastPlay ?? lastScore?.text;

  return (
    <article
      className="board"
      style={{ '--team-away': game.away.color, '--team-home': game.home.color } as CSSProperties}
    >
      <div className="board-rule" aria-hidden="true">
        <span style={{ background: game.away.color }} />
        <span style={{ background: game.home.color }} />
      </div>

      <div className="board-head">
        <StatusTag game={game} />
        <span className="board-clock">
          {game.status === 'in'
            ? `${ordinalPeriod(game.period)} ${game.clock}`
            : game.status === 'post'
              ? shortDate(game.date)
              : game.statusShort}
        </span>
        <span className="board-slot">{game.week ? `Week ${game.week}` : 'NFL'}</span>
      </div>

      <div className="board-body">
        <TeamLine side={game.away} game={game} />
        <TeamLine side={game.home} game={game} />
      </div>

      {playText ? (
        <div className="board-play">
          <span className="micro">{game.status === 'in' ? 'Last play' : 'Latest score'}</span>
          <p>{playText}</p>
          {game.status === 'in' && game.downDistance ? (
            <span className="board-down">{game.downDistance}</span>
          ) : null}
        </div>
      ) : null}

      <footer className="board-foot">
        <div className="board-chips">
          {recent.length === 0 ? <span className="board-none">No scoring yet</span> : null}
          {recent.map((play) => (
            <span className="chip" key={play.id}>
              <b>{play.teamAbbr}</b>
              <span className="chip-label">{play.label}</span>
              <span className="chip-clock">
                {ordinalPeriod(play.period)} {play.clock}
              </span>
            </span>
          ))}
        </div>
        <div className="board-actions">
          <button type="button" className="text-btn" onClick={() => onOpen(game)}>
            Scoring log
          </button>
        </div>
      </footer>
    </article>
  );
}
