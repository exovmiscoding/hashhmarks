import { relativeTime } from '../lib/format';
import type { TabKey } from '../lib/types';
import { FieldMark, RefreshIcon } from './ui';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'live', label: 'Live desk' },
  { key: 'scores', label: 'Scoreboard' },
  { key: 'news', label: 'Newsroom' },
];

interface HeaderProps {
  tab: TabKey;
  onTab: (tab: TabKey) => void;
  online: boolean;
  updatedAt: number | null;
  onRefresh: () => void;
}

export function Header({ tab, onTab, online, updatedAt, onRefresh }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-rule" aria-hidden="true" />
      <div className="wrap topbar-inner">
        <div className="masthead">
          <FieldMark />
          <div>
            <h1>Hashmarks</h1>
            <p>NFL scores, scoring plays &amp; news</p>
          </div>
        </div>

        <nav className="nav" aria-label="Sections">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-link${tab === item.key ? ' is-active' : ''}`}
              onClick={() => onTab(item.key)}
              aria-current={tab === item.key ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="feed">
          <span className={`feed-dot${online ? ' is-live' : ''}`} aria-hidden="true" />
          <span className="feed-label">{online ? 'Feed live' : 'Sample data'}</span>
          {updatedAt ? <span className="feed-time">· {relativeTime(updatedAt)}</span> : null}
          <button type="button" className="icon-btn" onClick={onRefresh} aria-label="Refresh feed" title="Refresh feed">
            <RefreshIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
