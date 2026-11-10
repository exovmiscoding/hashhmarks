import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { ScoreAlert } from '../lib/types';
import { Confetti } from './Confetti';
import { TeamLogo } from './ui';

interface Props {
  alert: ScoreAlert;
  onDone: () => void;
}

export function ScoreCelebration({ alert, onDone }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 4400);
    return () => window.clearTimeout(timer);
  }, [alert.id, onDone]);

  return (
    <div className="celebration" role="status" aria-live="assertive">
      <Confetti colors={alert.colors} />
      <div className="stamp" style={{ '--stamp': alert.colors[0] } as CSSProperties}>
        <div className="stamp-top">
          <TeamLogo abbr={alert.abbr} size={32} />
          <span className="stamp-team">{alert.teamName}</span>
          <span className="stamp-points">+{alert.points}</span>
        </div>
        <p className="stamp-word">
          Point
          <br />
          Scored
        </p>
        <p className="stamp-play">{alert.playText ?? 'Score updated on the live feed'}</p>
        <p className="stamp-line">
          <span>
            {alert.awayAbbr} {alert.awayScore}
          </span>
          <span className="stamp-dash">—</span>
          <span>
            {alert.homeAbbr} {alert.homeScore}
          </span>
        </p>
      </div>
    </div>
  );
}
