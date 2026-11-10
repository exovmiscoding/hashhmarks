# Hashmarks

NFL stats, scores and news in real time — a read-only desk for the league that you can leave open on a second monitor.

Every number on the page comes from the live ESPN feeds: no mock scores, no seed data, no database.

## What it does

- **Live desk** — one board per game in progress: both teams, running score, quarter and clock, possession, last play with down and distance, and the last three scoring plays. Polls every 15 seconds, and pauses while the tab is hidden.
- **Scoring celebration** — when a team's score changes between polls, a stamped card reading **POINT SCORED** hits the screen with the team, the points added, the play text and the new scoreline, while paper confetti fires in that team's colours.
- **Latest result** — with nothing on the field, the desk features the most recent finished game together with its real scoring log, instead of an empty page.
- **Scoreboard** — browse any week of the season, grouped by date, with finals, kickoff times, records and venues. Open a game for a scoring log grouped by quarter with the running score after every play, a by-quarter line score, and related stories.
- **Newsroom** — the current NFL wire with a lead story, search across headlines, and team filters.
- **All 32 clubs** — logos, colours and records, with a coloured monogram fallback if a logo fails to load.
- **Phone layout** — bottom navigation, safe-area handling and 44px-class tap targets below 620px.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle
npm run preview  # serve the built bundle
```

## Where the data comes from

| Data | Endpoint |
| --- | --- |
| Current week, scores, game state | `/apis/site/v2/sports/football/nfl/scoreboard` |
| Scoring plays per game | `/apis/site/v2/sports/football/nfl/summary?event=<id>` |
| Headlines | `/apis/site/v2/sports/football/nfl/news` |
| Team logos | `a.espncdn.com/i/teamlogos/nfl/500/<abbr>.png` |

All of them are served from `site.api.espn.com` and need no API key.

These endpoints don't reliably send permissive CORS headers, so the dev server proxies them through `/espn` (see `vite.config.ts`). A production deployment on plain static hosting needs its own proxy or a Worker in front of them; the browser build calls ESPN directly.
