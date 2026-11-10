import { useState } from 'react';
import type { ReactNode } from 'react';
import { TEAM_BY_ABBR, logoUrl } from '../data/teams';
import type { Game } from '../lib/types';

interface IconProps {
  size?: number;
}

export function RefreshIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 3v5h-5" />
    </svg>
  );
}

export function CloseIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function ArrowUpRight({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

export function ChevronLeft({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function ChevronRight({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function SearchIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

export function FieldMark() {
  return (
    <svg className="field-mark" viewBox="0 0 40 40" role="img" aria-label="Hashmarks">
      <rect width="40" height="40" fill="#111110" />
      <g stroke="#f0ece2" strokeWidth="1.4" opacity="0.7">
        <path d="M7 7v26M33 7v26M7 13h26M7 20h26M7 27h26" />
      </g>
      <circle cx="20" cy="20" r="3.4" fill="none" stroke="#f0ece2" strokeWidth="1.4" />
    </svg>
  );
}

export function TeamLogo({ abbr, size = 40 }: { abbr: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const team = TEAM_BY_ABBR[abbr];
  if (!team) return null;

  if (failed) {
    return (
      <span
        className="logo-fallback"
        style={{ width: size, height: size, background: team.color, fontSize: Math.round(size * 0.3) }}
        aria-label={team.name}
      >
        {team.abbr}
      </span>
    );
  }

  return (
    <img
      className="team-logo"
      src={logoUrl(team.logoSlug)}
      alt={`${team.name} logo`}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function StatusTag({ game }: { game: Game }) {
  if (game.status === 'in') {
    return (
      <span className="tag tag--live">
        <span className="tag-dot" aria-hidden="true" />
        Live
      </span>
    );
  }
  if (game.status === 'post') return <span className="tag">Final</span>;
  return <span className="tag tag--quiet">Upcoming</span>;
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-mark" aria-hidden="true" />
      <div>
        <p className="empty-title">{title}</p>
        {body ? <p className="empty-body">{body}</p> : null}
        {action ? <div className="empty-action">{action}</div> : null}
      </div>
    </div>
  );
}
