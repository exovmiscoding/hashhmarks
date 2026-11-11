# Hashmarks

NFL stats, scores and news in real time — plus a card room where every draw pays out in site currency. A read-only desk for the league that you can leave open on a second monitor.

Every number on the page comes from live ESPN feeds: no mock scores, no seed data, no invented players.

## What it does

- **Live desk** — one board per game in progress: both teams, running score, quarter and clock, possession, last play with down and distance, and the last three scoring plays. Polls every 15 seconds, and pauses while the tab is hidden.
- **Scoring celebration** — when a team's score changes between polls, a stamped card reading **POINT SCORED** hits the screen with the team, the points added, the play text and the new scoreline, while paper confetti fires in that team's colours.
- **Latest result** — with nothing on the field, the desk features the most recent finished game together with its real scoring log, instead of an empty page.
- **Scoreboard** — browse any week of the season, grouped by date, with finals, kickoff times, records and venues. Open a game for a scoring log grouped by quarter with the running score after every play, a by-quarter line score, and related stories.
- **Newsroom** — the current NFL wire with a lead story, search across headlines, and team filters.
- **Card room** — draw a player card from a pool of 2,562 real players across all 32 rosters. Common pays $5, rare $10, epic $30, legendary $100 in site currency, credited the moment the card lands. Cards open to that player's real season stat line. Accounts keep your balance, pulls and rarity counts.
- **All 32 clubs** — logos, colours and records, with a coloured monogram fallback if a logo fails to load.
- **Phone layout** — bottom navigation, safe-area handling and 44px-class tap targets below 620px.

## Running it

```bash
npm install

# terminal 1 — local Postgres (PGlite, real Postgres in WASM)
npm run db:local
npm run db:init          # applies schema.sql

# terminal 2 — the /api functions
npm run api              # http://127.0.0.1:8787

# terminal 3 — the site
npm run dev              # http://localhost:5173
```

`npm run build` typechecks and bundles the front end. `npm run players` rebuilds the card pool from ESPN rosters.

## Where the data comes from

| Data | Endpoint |
| --- | --- |
| Current week, scores, game state | `/apis/site/v2/sports/football/nfl/scoreboard` |
| Scoring plays per game | `/apis/site/v2/sports/football/nfl/summary?event=<id>` |
| Headlines | `/apis/site/v2/sports/football/nfl/news` |
| Rosters for the card pool | `/apis/site/v2/sports/football/nfl/teams/<id>/roster` |
| Player season stats | `sports.core.api.espn.com/v2/.../athletes/<id>/statistics` |
| Team logos and headshots | `a.espncdn.com` |

All of them are keyless public endpoints.

The site's live data is fetched in the browser through the dev proxy at `/espn`. The card pool is generated ahead of time by `scripts/build-players.mjs` so a draw never waits on 32 roster requests.

## Accounts and currency

- Usernames are 3–20 letters, numbers or underscores; passwords are at least 8 characters.
- Passwords are stored as salted scrypt hashes, never in plain text.
- Sessions are random tokens in an HttpOnly, SameSite=Lax cookie; only a SHA-256 hash of the token is stored server-side.
- Every pull is written to Postgres together with its payout, and the balance update happens in the same transaction.
- Draw odds: legendary 4%, epic 12%, rare 30%, common 54%. Duplicates still pay.
- Currency has no shop yet — it is a score you build by drawing.

## Deploying to Vercel

The front end is static; accounts and draws are Vercel Functions in `/api`. Set `DATABASE_URL` to a Postgres connection string in the project's environment variables (Neon, Vercel Postgres or any hosted Postgres), then apply `schema.sql` once against that database:

```bash
DATABASE_URL=... npm run db:init
```

`vercel.json` handles the SPA fallback. Without `DATABASE_URL` the site still renders scores and news, but sign-up and draws return a configuration error.

## Notes

- ESPN's public endpoints are undocumented and can change without notice. If the feed returns nothing, the app says so instead of inventing games.
- Card stats come from the current regular season; ESPN's broken QBR row is filtered out.
- Unofficial fan project. Not affiliated with the NFL, its clubs or ESPN. Team names, marks and logos belong to their owners.

## Stack

React 19, TypeScript, Vite, Postgres and Vercel Functions. No UI framework — the layout, type system and components are hand-written. Display type is Anton, text is Inter Tight.
