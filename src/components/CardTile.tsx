import { useState } from 'react';
import { teamColor } from '../data/teams';
import type { PlayerCard } from '../lib/types';

interface CardTileProps {
  card: PlayerCard;
  reward?: number;
  large?: boolean;
  onOpen?: () => void;
}

export function CardTile({ card, reward, large = false, onOpen }: CardTileProps) {
  const [broken, setBroken] = useState(false);
  const initials = card.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <button
      type="button"
      className={`pcard pcard--${card.rarity}${large ? ' pcard--lg' : ''}`}
      onClick={onOpen}
      aria-label={`${card.name}, ${card.rarity}, ${card.position} for the ${card.team}`}
    >
      <span className="pcard-team" style={{ background: teamColor(card.team) }} aria-hidden="true" />
      <span className="pcard-photo">
        {broken || !card.headshot ? (
          <span className="pcard-mono" style={{ background: teamColor(card.team) }} aria-hidden="true">
            {initials}
          </span>
        ) : (
          <img
            src={card.headshot}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        )}
        {card.jersey ? <span className="pcard-jersey">{card.jersey}</span> : null}
      </span>
      <span className="pcard-body">
        <span className="pcard-name">{card.name}</span>
        <span className="pcard-meta">
          {card.position} · {card.team}
        </span>
      </span>
      <span className="pcard-foot">
        <span className={`rarity rarity--${card.rarity}`}>{card.rarity}</span>
        {typeof reward === 'number' ? (
          <span className="pcard-reward">+${reward}</span>
        ) : (
          <span className="pcard-serial">#{card.jersey ?? '—'}</span>
        )}
      </span>
    </button>
  );
}
