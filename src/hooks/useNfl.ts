import { useCallback, useEffect, useState } from 'react';
import { fetchGameSummary, fetchNews, fetchScoreboard } from '../lib/espn';
import type { Game, NewsItem, ScoreboardMeta, ScoringPlay } from '../lib/types';

export interface LiveState {
  games: Game[];
  meta: ScoreboardMeta | null;
  loading: boolean;
  error: string | null;
  updatedAt: number | null;
  refresh: () => void;
}

export function useLiveScoreboard(): LiveState {
  const [games, setGames] = useState<Game[]>([]);
  const [meta, setMeta] = useState<ScoreboardMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const result = await fetchScoreboard(undefined, controller.signal);
        if (!active) return;
        setGames(result.games);
        if (result.meta) setMeta(result.meta);
        setError(null);
        setUpdatedAt(Date.now());
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Feed unavailable');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 15000);

    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return { games, meta, loading, error, updatedAt, refresh };
}

const weekCache = new Map<string, Game[]>();

export interface WeekState {
  games: Game[];
  loading: boolean;
  error: string | null;
}

export function useWeekScoreboard(
  year: number,
  week: number,
  seasonType: number,
  enabled: boolean,
): WeekState {
  const key = `${year}-${seasonType}-${week}`;
  const [state, setState] = useState<WeekState>({ games: [], loading: false, error: null });

  useEffect(() => {
    if (!enabled) {
      setState({ games: [], loading: false, error: null });
      return;
    }

    const cached = weekCache.get(key);
    setState({ games: cached ?? [], loading: !cached, error: null });

    let active = true;
    const controller = new AbortController();

    fetchScoreboard({ year, week, seasonType }, controller.signal)
      .then((result) => {
        weekCache.set(key, result.games);
        if (active) setState({ games: result.games, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!active) return;
        setState({
          games: cached ?? [],
          loading: false,
          error: cached ? null : err instanceof Error ? err.message : 'Feed unavailable',
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [key, year, week, seasonType, enabled]);

  return state;
}

export function useNews(): { items: NewsItem[]; loading: boolean; error: string | null; refresh: () => void } {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetchNews(40, controller.signal)
      .then((result) => {
        if (!active) return;
        setItems(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'News feed unavailable');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return { items, loading, error, refresh };
}

export function useGameSummary(game: Game | null): { plays: ScoringPlay[]; loading: boolean } {
  const [plays, setPlays] = useState<ScoringPlay[]>([]);
  const [loading, setLoading] = useState(false);
  const gameId = game?.id;
  const isEspn = game?.source === 'espn';
  const awayAbbr = game?.away.abbr;
  const homeAbbr = game?.home.abbr;

  useEffect(() => {
    setPlays([]);
    if (!gameId || !isEspn || !awayAbbr || !homeAbbr) return;

    let active = true;
    const controller = new AbortController();
    setLoading(true);

    fetchGameSummary(gameId, awayAbbr, homeAbbr, controller.signal)
      .then((result) => {
        if (active) setPlays(result);
      })
      .catch(() => {
        /* the game object already carries a cached timeline when available */
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [gameId, isEspn, awayAbbr, homeAbbr]);

  return { plays, loading };
}
