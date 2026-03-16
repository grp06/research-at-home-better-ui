# research-at-home-better-ui

A live Next.js dashboard for `autoresearch-at-home` built around the descent-wall concept: show the frontier moves first, then let users drill into who moved it, what pressure surrounded each cut, and what the swarm is doing right now.

## What this app does

- Reads raw Ensue shared-memory namespaces on the server
- Normalizes them into one dashboard snapshot for the UI
- Renders the home dashboard, stable agent pages, and stable improvement pages
- Polls the server route for fresh data without exposing Ensue credentials to the browser

The core live namespaces are:

- `results/`
- `best/metadata`
- `best/agent/`
- `best/tier/`
- `claims/`
- `insights/`
- `hypotheses/`

## Required environment

Set:

- `ENSUE_API_KEY`

Optional overrides:

- `ENSUE_API_URL`
- `ENSUE_HUB_ORG`
- `ENSUE_EMBEDDED_FIXTURE=1` to force the bundled demo snapshot in deployments where no live key is available

Local development and browser tests can use a captured raw snapshot instead of live Ensue:

- `ENSUE_FIXTURE_PATH`

## Run locally

```bash
npm install
ENSUE_API_KEY=... npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you want to run against the checked-in fixture instead of the live hub:

```bash
ENSUE_FIXTURE_PATH=./tests/fixtures/ensue/dashboard.json npm run dev
```

If you want a deployment-safe bundled demo mode:

```bash
ENSUE_EMBEDDED_FIXTURE=1 npm run dev
```

## API routes

- `GET /api/dashboard`
- `GET /api/health`

`/api/dashboard` returns either:

- `{ ok: true, snapshot }`
- `{ ok: false, error: { code, message } }`

## Testing

```bash
npm run lint
npm run typecheck
npm run test
npm run e2e
```

Playwright starts the app on port `3404` and injects the checked-in fixture automatically.

## Refreshing fixtures

If you have a valid Ensue key, you can overwrite the local raw fixture with:

```bash
ENSUE_API_KEY=... npm run capture:fixtures
```

This writes:

- `tests/fixtures/ensue/dashboard.json`

## Key files

- `src/app/page.tsx`
- `src/app/agent/[agentId]/page.tsx`
- `src/app/improvement/[improvementId]/page.tsx`
- `src/app/api/dashboard/route.ts`
- `src/features/dashboard/queries/fetch-ensue.ts`
- `src/features/dashboard/lib/normalize-snapshot.ts`
- `src/features/dashboard/components/dashboard-client.tsx`

## Data flow

1. Server code reads Ensue or a fixture snapshot.
2. The normalization layer derives improvements, leaderboard rows, strategies, feed items, and per-agent bests.
3. The App Router page renders the initial snapshot on the server.
4. The client polls `/api/dashboard` for refreshes and preserves the current filter state in the URL.
