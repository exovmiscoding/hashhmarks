import { useMemo, useState } from 'react';
import { timeAgo } from '../lib/format';
import type { NewsItem } from '../lib/types';
import { ArrowUpRight, EmptyState, SearchIcon } from './ui';

interface NewsListProps {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function NewsList({ items, loading, error, onRefresh }: NewsListProps) {
  const [query, setQuery] = useState('');
  const [team, setTeam] = useState('ALL');

  const teamChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const abbr of item.teamAbbrs) counts.set(abbr, (counts.get(abbr) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([abbr]) => abbr);
  }, [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...items]
      .sort((a, b) => b.published.localeCompare(a.published))
      .filter((item) => {
        if (team !== 'ALL' && !item.teamAbbrs.includes(team)) return false;
        if (!needle) return true;
        return (
          item.headline.toLowerCase().includes(needle) ||
          item.description.toLowerCase().includes(needle) ||
          item.teamAbbrs.join(' ').toLowerCase().includes(needle)
        );
      });
  }, [items, query, team]);

  const lead = filtered[0];
  const rest = filtered.slice(1);

  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">
          <span className="section-index">03</span>Newsroom
        </h2>
        <span className="micro">
          {filtered.length} {filtered.length === 1 ? 'story' : 'stories'} · ESPN wire
        </span>
      </div>

      <div className="news-tools">
        <label className="search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search headlines, teams"
            aria-label="Search headlines"
          />
        </label>

        <div className="chips">
          <button
            type="button"
            className={`chip-btn${team === 'ALL' ? ' is-active' : ''}`}
            onClick={() => setTeam('ALL')}
          >
            All
          </button>
          {teamChips.map((abbr) => (
            <button
              type="button"
              key={abbr}
              className={`chip-btn${team === abbr ? ' is-active' : ''}`}
              onClick={() => setTeam(team === abbr ? 'ALL' : abbr)}
            >
              {abbr}
            </button>
          ))}
        </div>

        <button type="button" className="text-btn" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {error ? (
        <p className="feed-error">
          The wire is not answering ({error}). Showing the archived file instead.
        </p>
      ) : null}

      {loading ? <p className="micro loading-line">Fetching the wire</p> : null}

      {lead ? (
        <article className="news-lead">
          {lead.image ? (
            <a className="lead-media" href={lead.url ?? '#'} target="_blank" rel="noreferrer" tabIndex={-1}>
              <img src={lead.image} alt="" loading="lazy" />
            </a>
          ) : (
            <span className="lead-media is-empty">
              <span className="media-fallback">
                {lead.teamAbbrs[0] ?? 'NFL'}
                <em>Wire</em>
              </span>
            </span>
          )}

          <div className="lead-body">
            <span className="micro">
              {lead.teamAbbrs.slice(0, 3).join(' · ') || lead.category || 'NFL'} · {timeAgo(lead.published)}
            </span>
            <h2>
              <a href={lead.url ?? '#'} target="_blank" rel="noreferrer">
                {lead.headline}
              </a>
            </h2>
            <p>{lead.description}</p>
            <a className="text-btn lead-link" href={lead.url ?? '#'} target="_blank" rel="noreferrer">
              Read the report <ArrowUpRight />
            </a>
          </div>
        </article>
      ) : null}

      <div className="news-list">
        {rest.map((item) => (
          <a className="news-row" key={item.id} href={item.url ?? '#'} target="_blank" rel="noreferrer">
            <span className="news-thumb">
              {item.image ? <img src={item.image} alt="" loading="lazy" /> : <span className="media-fallback media-fallback--sm">{item.teamAbbrs[0] ?? 'NFL'}</span>}
            </span>
            <span className="news-copy">
              <span className="micro">
                {item.teamAbbrs.slice(0, 3).join(' · ') || item.category || 'NFL'} · {timeAgo(item.published)}
              </span>
              <h3>{item.headline}</h3>
              <p>{item.description}</p>
            </span>
            <span className="news-open" aria-hidden="true">
              <ArrowUpRight size={14} />
            </span>
          </a>
        ))}
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState
          title="No stories match that filter"
          body="Clear the search box or pick another club from the row above."
        />
      ) : null}
    </section>
  );
}
