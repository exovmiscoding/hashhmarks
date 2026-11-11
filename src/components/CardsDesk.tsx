import { useCallback, useEffect, useMemo, useState } from 'react';
import { drawCard, getCollection } from '../lib/api';
import type { AccountState } from '../hooks/useAccount';
import type { PlayerCard, Pull, Rarity } from '../lib/types';
import { CardTile } from './CardTile';
import { EmptyState } from './ui';

const RARITY_ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'common'];
const ODDS: Array<{ rarity: Rarity; chance: string; reward: number }> = [
  { rarity: 'legendary', chance: '4%', reward: 100 },
  { rarity: 'epic', chance: '12%', reward: 30 },
  { rarity: 'rare', chance: '30%', reward: 10 },
  { rarity: 'common', chance: '54%', reward: 5 },
];

interface CardsDeskProps {
  account: AccountState;
  onSignIn: () => void;
  onOpenPlayer: (card: PlayerCard) => void;
}

export function CardsDesk({ account, onSignIn, onOpenPlayer }: CardsDeskProps) {
  const { user, stats, applyBalance, refresh, signOut } = account;
  const [cards, setCards] = useState<Pull[]>([]);
  const [result, setResult] = useState<Pull | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState(false);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setCards([]);
      setResult(null);
      return;
    }
    let active = true;
    setLoadingCards(true);
    getCollection()
      .then((payload) => {
        if (active) setCards(payload.cards);
      })
      .catch(() => {
        if (active) setCards([]);
      })
      .finally(() => {
        if (active) setLoadingCards(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const draw = useCallback(async () => {
    if (!userId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const payload = await drawCard();
      setResult(payload.card);
      applyBalance(payload.balance);
      setCards((previous) => [payload.card, ...previous]);
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not draw a card');
    } finally {
      setBusy(false);
    }
  }, [userId, busy, applyBalance, refresh]);

  const collection = useMemo(() => {
    const unique = new Map<string, Pull>();
    const copies = new Map<string, number>();
    for (const card of cards) {
      copies.set(card.id, (copies.get(card.id) ?? 0) + 1);
      if (!unique.has(card.id)) unique.set(card.id, card);
    }
    return [...unique.values()]
      .sort(
        (a, b) =>
          RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity) ||
          a.name.localeCompare(b.name),
      )
      .map((card) => ({ card, copies: copies.get(card.id) ?? 1 }));
  }, [cards]);

  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">
          <span className="section-index">04</span>Card room
        </h2>
        <span className="micro">{user ? `Signed in as ${user.username}` : 'Accounts · draws · currency'}</span>
      </div>

      <div className="wallet">
        <div className="wallet-main">
          <span className="micro">Site currency</span>
          <p className="wallet-total">${(user?.balance ?? 0).toLocaleString('en-US')}</p>
          <p className="wallet-hint">
            {user
              ? 'Credited the moment a card lands. Duplicates still pay.'
              : 'Every card pays out. Open an account to bank the balance.'}
          </p>
        </div>

        <div className="wallet-side">
          <div className="wallet-counts">
            {RARITY_ORDER.map((rarity) => (
              <span className="wallet-count" key={rarity}>
                <b>{stats?.counts?.[rarity] ?? 0}</b>
                <span className={`rarity rarity--${rarity}`}>{rarity}</span>
              </span>
            ))}
          </div>
          {user ? (
            <button type="button" className="text-btn" onClick={() => void signOut()}>
              Sign out
            </button>
          ) : (
            <button type="button" className="draw-btn" onClick={onSignIn}>
              Create an account
            </button>
          )}
        </div>
      </div>

      <div className="drawer">
        <div className="drawer-panel">
          <h3 className="col-title">The draw</h3>
          <p className="drawer-copy">
            One card per draw, pulled from all 32 rosters — {collection.length ? 'your' : 'a'} pool of
            2,562 players. The tier decides the payout.
          </p>

          <table className="odds">
            <thead>
              <tr>
                <th scope="col">Tier</th>
                <th scope="col">Odds</th>
                <th scope="col">Pays</th>
              </tr>
            </thead>
            <tbody>
              {ODDS.map((row) => (
                <tr key={row.rarity}>
                  <th scope="row">
                    <span className={`rarity rarity--${row.rarity}`}>{row.rarity}</span>
                  </th>
                  <td>{row.chance}</td>
                  <td className="odds-pays">${row.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" className="draw-btn" onClick={() => void draw()} disabled={!user || busy}>
            {busy ? 'Drawing…' : user ? 'Draw a card' : 'Sign in to draw'}
          </button>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="drawer-result">
          {result ? (
            <>
              <span className="micro">{result.duplicate ? 'Duplicate · still paid' : 'New card'}</span>
              <CardTile card={result} reward={result.reward} large onOpen={() => onOpenPlayer(result)} />
              <p className="drawer-payout">+${result.reward} credited</p>
            </>
          ) : (
            <div className="drawer-blank">
              <span className="drawer-rule" aria-hidden="true" />
              <p className="micro">Nothing drawn yet</p>
              <p className="drawer-copy">
                {user ? 'Press draw and a player lands here.' : 'Sign in, then draw your first card.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="subhead">
        <h3>Collection</h3>
        <span className="micro">
          {collection.length} cards · {cards.length} pulls
        </span>
      </div>

      {user && collection.length ? (
        <div className="card-grid">
          {collection.map(({ card, copies }) => (
            <div className="card-slot" key={card.id}>
              <CardTile card={card} onOpen={() => onOpenPlayer(card)} />
              {copies > 1 ? <span className="card-copies">×{copies}</span> : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={!user ? 'Sign in to start a collection' : loadingCards ? 'Opening the card file' : 'No cards yet'}
          body={
            !user
              ? 'An account keeps every pull, your balance and the tier counts above.'
              : 'Draw your first card and it lands here.'
          }
          action={
            user ? undefined : (
              <button type="button" className="text-btn" onClick={onSignIn}>
                Create an account
              </button>
            )
          }
        />
      )}
    </section>
  );
}
