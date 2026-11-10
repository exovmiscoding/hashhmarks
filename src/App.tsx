import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { LiveBoard } from './components/LiveBoard';
import { GameRow } from './components/GameRow';
import { ScoresBoard } from './components/ScoresBoard';
import { NewsList } from './components/NewsList';
import { GameDetail } from './components/GameDetail';
import { ScoreCelebration } from './components/ScoreCelebration';
import { EmptyState } from './components/ui';
import { useGameSummary, useLiveScoreboard, useNews, useWeekScoreboard } from './hooks/useNfl';
import type { Game, ScoreAlert, TabKey } from './lib/types';

export default function App() {
  const [tab, setTab] = useState<TabKey>('live');
  const [week, setWeek] = useState<number | null>(null);
  const [seasonType, setSeasonType] = useState(2);
  const [selected, setSelected] = useState<Game | null>(null);
  const [alerts, setAlerts] = useState<ScoreAlert[]>([]);

  const live = useLiveScoreboard();
  const news = useNews();

  const offline = Boolean(live.error);
  const year = live.meta?.season ?? new Date().getFullYear();
  const weekNumber = week ?? live.meta?.week ?? 1;
  const weekState = useWeekScoreboard(year, weekNumber, seasonType, true);

  const inProgress = useMemo(() => live.games.filter((game) => game.status === 'in'), [live.games]);
  const alsoToday = useMemo(() => live.games.filter((game) => game.status !== 'in'), [live.games]);
  const latestFinal = useMemo(
    () =>
      live.games
        .filter((game) => game.status === 'post')
        .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null,
    [live.games],
  );

  // With nothing on the field, feature the most recent real game instead of an
  // empty desk. Its summary endpoint supplies the real scoring plays.
  const featuredFinal = inProgress.length === 0 ? latestFinal : null;
  const finalSummary = useGameSummary(featuredFinal);
  const featuredGame =
    featuredFinal && finalSummary.plays.length
      ? { ...featuredFinal, scoringPlays: finalSummary.plays }
      : featuredFinal;

  const allGames = useMemo(() => [...live.games, ...weekState.games], [live.games, weekState.games]);
  const activeGame = selected ? (allGames.find((game) => game.id === selected.id) ?? selected) : null;
  const summary = useGameSummary(activeGame);
  const detailGame = activeGame
    ? {
        ...activeGame,
        scoringPlays: summary.plays.length ? summary.plays : activeGame.scoringPlays,
      }
    : null;

  const knownScores = useRef<Record<string, number>>({});
  useEffect(() => {
    const next: Record<string, number> = {};
    const fresh: ScoreAlert[] = [];

    for (const game of inProgress) {
      for (const side of [game.away, game.home]) {
        const key = `${game.id}:${side.abbr}`;
        next[key] = side.score;
        const before = knownScores.current[key];
        if (before !== undefined && side.score > before) {
          const latest = [...game.scoringPlays].reverse().find((play) => play.teamAbbr === side.abbr);
          fresh.push({
            id: `${key}:${Date.now()}`,
            gameId: game.id,
            abbr: side.abbr,
            teamName: side.name,
            delta: side.score - before,
            points: side.score - before,
            awayAbbr: game.away.abbr,
            homeAbbr: game.home.abbr,
            awayScore: game.away.score,
            homeScore: game.home.score,
            playText: latest?.text,
            colors: [side.color, side.altColor],
          });
        }
      }
    }

    knownScores.current = next;
    if (fresh.length) setAlerts((previous) => [...previous, ...fresh]);
  }, [inProgress]);

  const dismissAlert = useCallback(() => {
    setAlerts((previous) => previous.slice(1));
  }, []);
  const openGame = useCallback((game: Game) => setSelected(game), []);
  const closeGame = useCallback(() => setSelected(null), []);

  const weekLabel = live.meta?.seasonType === 3 ? 'Postseason' : `Week ${weekNumber}`;

  return (
    <div className="app">
      <Header
        tab={tab}
        onTab={setTab}
        online={!offline}
        updatedAt={live.updatedAt}
        onRefresh={live.refresh}
      />
      <Ticker games={live.games} />

      <main className="wrap main">
        {tab === 'live' ? (
          <section className="section">
            <div className="section-head">
              <h2 className="section-title">
                <span className="section-index">01</span>Live desk
              </h2>
              <span className="micro">Auto-refresh · 15s</span>
            </div>

            {inProgress.length ? (
              <div className="live-grid">
                {inProgress.map((game) => (
                  <LiveBoard key={game.id} game={game} onOpen={openGame} />
                ))}
              </div>
            ) : featuredGame ? (
              <>
                <p className="desk-note">
                  Nothing on the field right now — latest final from the live feed
                </p>
                <div className="live-grid">
                  <LiveBoard game={featuredGame} onOpen={openGame} />
                </div>
              </>
            ) : (
              <EmptyState
                title={live.loading ? 'Reading the feed' : 'No games in the feed'}
                body="The scoreboard feed is not returning any games right now."
                action={
                  live.loading ? undefined : (
                    <button type="button" className="text-btn" onClick={live.refresh}>
                      Retry feed
                    </button>
                  )
                }
              />
            )}

            {alsoToday.length ? (
              <>
                <div className="subhead">
                  <h3>Also on the slate</h3>
                  <span className="micro">{weekLabel}</span>
                </div>
                <div className="rows">
                  {alsoToday.map((game) => (
                    <GameRow key={game.id} game={game} onOpen={openGame} />
                  ))}
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {tab === 'scores' ? (
          <ScoresBoard
            games={weekState.games}
            loading={weekState.loading}
            error={weekState.error}
            week={weekNumber}
            onWeek={setWeek}
            seasonType={seasonType}
            onSeasonType={setSeasonType}
            year={year}
            onOpen={openGame}
          />
        ) : null}

        {tab === 'news' ? (
          <NewsList
            items={news.items}
            loading={news.loading}
            error={news.error}
            onRefresh={news.refresh}
          />
        ) : null}
      </main>

      <footer className="wrap footer">
        <div>
          <span className="micro">Hashmarks · unofficial fan desk</span>
          <p>
            Scores, scoring plays and headlines come from ESPN's public feeds. Team names and logos
            belong to their clubs.
          </p>
        </div>
        <span className="micro">{live.meta ? `Season ${year} · ${weekLabel}` : 'Season feed loading'}</span>
      </footer>

      {detailGame ? <GameDetail game={detailGame} news={news.items} onClose={closeGame} /> : null}
      {alerts[0] ? <ScoreCelebration alert={alerts[0]} onDone={dismissAlert} /> : null}
    </div>
  );
}
