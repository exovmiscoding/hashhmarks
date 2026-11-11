import { useEffect, useState } from 'react';
import { getPlayerStats } from '../lib/api';
import { teamColor } from '../data/teams';
import type { PlayerCard, PlayerStats } from '../lib/types';
import { CloseIcon, TeamLogo } from './ui';

interface PlayerStatsSheetProps {
  card: PlayerCard;
  onClose: () => void;
}

export function PlayerStatsSheet({ card, onClose }: PlayerStatsSheetProps) {
  const [data, setData] = useState<PlayerStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [broken, setBroken] = useState(false);

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

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setData(null);
    getPlayerStats(card.id)
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Stats unavailable');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [card.id]);

  const bio = [
    ['Height', card.height],
    ['Weight', card.weight],
    ['College', card.college],
    ['Experience', card.experience != null ? `${card.experience} seasons` : null],
    ['Jersey', card.jersey ? `#${card.jersey}` : null],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <div className="backdrop" role="presentation" onClick={onClose}>
      <div
        className="sheet sheet--narrow"
        role="dialog"
        aria-modal="true"
        aria-label={`${card.name} card`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-rule" aria-hidden="true">
          <span style={{ background: teamColor(card.team) }} />
          <span style={{ background: teamColor(card.team) }} />
        </div>

        <button type="button" className="sheet-close" onClick={onClose} aria-label="Close player stats">
          <CloseIcon />
        </button>

        <header className="sheet-head stat-head">
          <div className="stat-identity">
            <span className="stat-thumb">
              {broken || !card.headshot ? (
                <span className="stat-thumb-fallback" style={{ background: teamColor(card.team) }}>
                  {card.team}
                </span>
              ) : (
                <img src={card.headshot} alt="" onError={() => setBroken(true)} />
              )}
            </span>
            <div>
              <span className="micro">
                {card.position} · {card.team}
                {card.jersey ? ` · #${card.jersey}` : ''}
              </span>
              <h2 className="stat-name">{card.name}</h2>
              <span className={`rarity rarity--${card.rarity}`}>{card.rarity}</span>
            </div>
          </div>
          <div className="stat-team">
            <TeamLogo abbr={card.team} size={40} />
            <div className="stat-bio">
              {bio.map(([label, value]) => (
                <span key={label}>
                  <b>{label}</b>
                  {value}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="stat-body">
          <div className="stat-body-head">
            <h3 className="col-title">Season stats</h3>
            <span className="micro">
              {data ? `${data.season} regular season · ESPN` : loading ? 'Reading the stat sheet' : '—'}
            </span>
          </div>

          {error ? <p className="sheet-empty">{error}</p> : null}

          {!error && !loading && data && data.categories.length === 0 ? (
            <p className="sheet-empty">
              ESPN has no recorded stat line for this player in the {data.season} regular season.
            </p>
          ) : null}

          {data && data.categories.length ? (
            <div className="stat-grid">
              {data.categories.map((category) => (
                <section className="stat-block" key={category.name}>
                  <h4>{category.label}</h4>
                  <table className="stat-table">
                    <tbody>
                      {category.stats.map((line) => (
                        <tr key={line.label} title={line.name}>
                          <th scope="row">{line.label}</th>
                          <td>{line.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
          ) : null}

          {loading ? <p className="sheet-empty">Loading numbers…</p> : null}
        </div>
      </div>
    </div>
  );
}
