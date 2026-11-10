import { useEffect, useMemo } from 'react';
import { ordinalPeriod, shortDate, timeAgo } from '../lib/format';
import type { Game, NewsItem } from '../lib/types';
import { ArrowUpRight, CloseIcon, StatusTag, TeamLogo } from './ui';

interface GameDetailProps {
  game: Game;
  news: NewsItem[];
  onClose: () => void;
}

export function GameDetail({ game, news, onClose }: GameDetailProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const groups = useMemo(() => {
    const map = new Map<number, Game['scoringPlays']>();
    for (const play of game.scoringPlays) {
      const list = map.get(play.period) ?? [];
      list.push(play);
      map.set(play.period, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [game.scoringPlays]);

  const lineScore = useMemo(() => {
    if (!game.scoringPlays.length) return null;
    const periods = new Set<number>([1, 2, 3, 4]);
    for (const play of game.scoringPlays) periods.add(play.period);
    const order = [...periods].sort((a, b) => a - b);
    const sum = (abbr: string, quarter: number) =>
      game.scoringPlays
        .filter((play) => play.teamAbbr === abbr && play.period === quarter)
        .reduce((total, play) => total + play.points, 0);
    return {
      order,
      away: order.map((quarter) => sum(game.away.abbr, quarter)),
      home: order.map((quarter) => sum(game.home.abbr, quarter)),
    };
  }, [game]);

  const related = useMemo(
    () =>
      news
        .filter((item) =>
          item.teamAbbrs.some((abbr) => abbr === game.away.abbr || abbr === game.home.abbr),
        )
        .slice(0, 4),
    [news, game.away.abbr, game.home.abbr],
  );

  return (
    <div className="backdrop" role="presentation" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`${game.away.name} at ${game.home.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-rule" aria-hidden="true">
          <span style={{ background: game.away.color }} />
          <span style={{ background: game.home.color }} />
        </div>

        <button type="button" className="sheet-close" onClick={onClose} aria-label="Close game detail">
          <CloseIcon />
        </button>

        <header className="sheet-head">
          <div className="sheet-status">
            <StatusTag game={game} />
            <span className="micro">
              {game.week ? `Week ${game.week} · ` : ''}
              {shortDate(game.date)}
            </span>
          </div>

          <div className="sheet-score">
            <div className="sheet-team">
              <TeamLogo abbr={game.away.abbr} size={54} />
              <span className="sheet-abbr">{game.away.abbr}</span>
              <span className={`sheet-num${game.completed && game.away.winner === false ? ' is-dim' : ''}`}>
                {game.status === 'pre' ? '–' : game.away.score}
              </span>
              <span className="sheet-name">{game.away.name}</span>
            </div>

            <div className="sheet-mid">
              <span className="micro">{game.completed ? 'Final' : game.status === 'pre' ? 'Kickoff' : 'In play'}</span>
            </div>

            <div className="sheet-team">
              <TeamLogo abbr={game.home.abbr} size={54} />
              <span className="sheet-abbr">{game.home.abbr}</span>
              <span className={`sheet-num${game.completed && game.home.winner === false ? ' is-dim' : ''}`}>
                {game.status === 'pre' ? '–' : game.home.score}
              </span>
              <span className="sheet-name">{game.home.name}</span>
            </div>
          </div>

          <div className="sheet-meta">
            <span>
              <b>Venue</b>
              {game.venue ?? 'To be confirmed'}
            </span>
            <span>
              <b>TV</b>
              {game.broadcast ?? 'To be confirmed'}
            </span>
            <span>
              <b>Records</b>
              {game.away.record ?? '—'} / {game.home.record ?? '—'}
            </span>
            <span>
              <b>Clock</b>
              {game.status === 'pre' ? 'Not started' : game.statusDetail}
            </span>
          </div>
        </header>

        <div className="sheet-body">
          <section className="sheet-main">
            <h3 className="col-title">
              Scoring plays <span className="col-count">{game.scoringPlays.length}</span>
            </h3>

            {groups.length === 0 ? (
              <p className="sheet-empty">
                {game.status === 'pre'
                  ? 'This game has not kicked off yet. The scoring log fills in as points are put on the board.'
                  : 'No scoring plays were recorded for this game.'}
              </p>
            ) : null}

            {groups.map(([period, plays]) => (
              <div className="period" key={period}>
                <div className="period-head">
                  <span className="period-label">{ordinalPeriod(period)}</span>
                  <span className="period-rule" />
                </div>
                <ol className="plays">
                  {plays.map((play) => (
                    <li className="play" key={play.id}>
                      <span className="play-clock">{play.clock}</span>
                      <span
                        className="play-marker"
                        style={{ background: play.teamAbbr === game.away.abbr ? game.away.color : game.home.color }}
                        aria-hidden="true"
                      />
                      <span className="play-body">
                        <span className="play-top">
                          <b>{play.teamAbbr}</b>
                          <span className="play-label">{play.label}</span>
                          <span className="play-points">+{play.points}</span>
                        </span>
                        <span className="play-text">{play.text}</span>
                      </span>
                      <span className="play-score">
                        {play.awayScore}–{play.homeScore}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            {game.status === 'in' && game.lastPlay ? (
              <div className="sheet-lastplay">
                <span className="micro">Latest from the field</span>
                <p>{game.lastPlay}</p>
                {game.downDistance ? <span className="board-down">{game.downDistance}</span> : null}
              </div>
            ) : null}
          </section>

          <aside className="sheet-side">
            {lineScore ? (
              <>
                <h3 className="col-title">By quarter</h3>
                <table className="linescore">
                  <thead>
                    <tr>
                      <th scope="col" />
                      {lineScore.order.map((quarter) => (
                        <th scope="col" key={quarter}>
                          {quarter === 5 ? 'OT' : quarter}
                        </th>
                      ))}
                      <th scope="col">T</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">{game.away.abbr}</th>
                      {lineScore.away.map((points, index) => (
                        <td key={lineScore.order[index]}>{points}</td>
                      ))}
                      <td className="ls-total">{game.away.score}</td>
                    </tr>
                    <tr>
                      <th scope="row">{game.home.abbr}</th>
                      {lineScore.home.map((points, index) => (
                        <td key={lineScore.order[index]}>{points}</td>
                      ))}
                      <td className="ls-total">{game.home.score}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            ) : null}

            <h3 className="col-title col-title--spaced">From the wire</h3>
            {related.length === 0 ? (
              <p className="sheet-empty sheet-empty--tight">
                No recent stories filed on these two clubs.
              </p>
            ) : (
              <div className="side-news">
                {related.map((item) => (
                  <a key={item.id} href={item.url ?? '#'} target="_blank" rel="noreferrer">
                    <span className="side-news-head">{item.headline}</span>
                    <span className="micro">
                      {item.teamAbbrs.slice(0, 2).join(' · ')} · {timeAgo(item.published)}
                    </span>
                  </a>
                ))}
              </div>
            )}

            <a className="text-btn side-link" href="https://www.espn.com/nfl/" target="_blank" rel="noreferrer">
              Full league coverage <ArrowUpRight />
            </a>
          </aside>
        </div>
      </div>
    </div>
  );
}
