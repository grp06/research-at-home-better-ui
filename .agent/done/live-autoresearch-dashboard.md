# Implement the full live autoresearch dashboard from the descent-wall MVP

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This repository contains `.agent/PLANS.md` at the repository root. This document must be maintained in accordance with `/Users/georgepickett/research-at-home-better-ui/.agent/PLANS.md`.

## Purpose / Big Picture

After this work, the new Next.js app will stop being a static design prototype and become the real dashboard for autoresearch-at-home. A user will be able to open the site, see the current global best and the true sequence of frontier cuts, filter the story by agent, drill into any improvement to understand what happened around it, inspect the live feed of claims, results, insights, and hypotheses, and share stable URLs for agent and improvement views. The proof is concrete: `npm run dev` will start the app, `curl http://localhost:3000/api/dashboard` will return a live normalized snapshot from Ensue, the home page will render live data instead of the fixture in `src/features/dashboard/data/swarm-data.ts`, and the test suite will cover both the data normalization layer and the UI flows.

The product goal is not “replace a scatterplot with prettier cards.” The goal is to turn swarm progress into a readable narrative. The descent wall becomes the main view of truth, the leaderboard becomes a contribution surface instead of a raw ranking table, and the live feed becomes a real-time view over the shared research memory.

## Progress

- [x] (2026-03-16 04:10Z) Read `/Users/georgepickett/research-at-home-better-ui/.agent/PLANS.md`, inspected the current Next.js MVP, and confirmed that the app currently renders only fixture data from `src/features/dashboard/data/swarm-data.ts`.
- [x] (2026-03-16 04:10Z) Audited the referenced App Router, env, and test files and found concrete execution gaps: `src/app/layout.tsx` eagerly imports `@/lib/env`, `src/app/page.tsx` is currently synchronous, and the existing tests are still pinned to the mock-only `buildDashboardSnapshot()` implementation.
- [x] (2026-03-16 05:05Z) Built the server-only Ensue data access layer in `src/features/dashboard/queries/fetch-ensue.ts`, added schema validation in `src/features/dashboard/schemas/ensue.ts`, and normalized raw hub data into the editorial dashboard snapshot via `src/features/dashboard/lib/normalize-snapshot.ts`.
- [x] (2026-03-16 05:24Z) Replaced fixture-only rendering with live server reads, `/api/dashboard`, client polling, URL-driven filter state, and explicit loading/configuration states across `src/app/page.tsx`, `src/app/api/dashboard/route.ts`, `src/hooks/use-dashboard-snapshot.ts`, and the dashboard shell.
- [x] (2026-03-16 05:31Z) Added the full interaction model: selectable frontier cuts, the improvement detail sheet, stable `/agent/[agentId]` and `/improvement/[improvementId]` routes, and richer crown-table, feed, and strategy surfaces.
- [x] (2026-03-16 05:36Z) Hardened the app with checked-in raw Ensue fixtures, the capture script, rewritten README, unit coverage for normalization and taxonomy logic, and Playwright coverage for deep links plus improvement and agent navigation.
- [x] (2026-03-16 05:36Z) Verified `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run e2e` all pass from the final tree.

## Surprises & Discoveries

- Observation: The current app is visually strong but structurally thin. Every user-visible number comes from a local fixture file, so no component currently has to handle missing, malformed, delayed, or authenticated data.
  Evidence: `src/app/page.tsx` calls `buildDashboardSnapshot()`, which only reads the static arrays in `src/features/dashboard/data/swarm-data.ts`.

- Observation: The current `DashboardSnapshot` shape assumes fields such as `track` and `note` that do not naturally exist in raw swarm result records. The live implementation must derive these fields instead of expecting them from the source.
  Evidence: `src/features/dashboard/lib/types.ts` requires `track` and `note` on `Experiment`, while the product brief for the original system only guarantees fields like `agent_id`, `val_bpb`, `status`, `description`, and timestamps.

- Observation: There is no repository documentation yet for environment variables, data flow, or deployment. The generated `README.md` is still the default `create-next-app` text.
  Evidence: `/Users/georgepickett/research-at-home-better-ui/README.md` still describes the stock Next.js starter.

- Observation: `src/app/layout.tsx` imports `@/lib/env` unconditionally. If `src/lib/env.ts` is expanded to require `ENSUE_API_KEY`, the entire app will throw during layout render and the proposed friendly configuration panel will never mount.
  Evidence: `src/app/layout.tsx` currently contains `import "@/lib/env";`, while `src/lib/env.ts` is evaluated at module load time.

- Observation: The current snapshot builder is synchronous and local, but every live path in the plan requires asynchronous server reads. The plan must explicitly convert the page and orchestration layer to async interfaces.
  Evidence: `src/app/page.tsx` calls `buildDashboardSnapshot()` without `await`, and `tests/unit/dashboard.test.ts` assumes a synchronous return value from that function.

- Observation: Improvement deep links can fail even when the selected step exists if the route segment is treated as an encoded string rather than the raw snapshot identifier.
  Evidence: The first Playwright pass opened `/improvement/...` but hit the custom not-found UI until `src/app/improvement/[improvementId]/page.tsx` and `src/app/agent/[agentId]/page.tsx` explicitly decoded `params` before lookup.

- Observation: Running ESLint in parallel with Playwright can race on the transient `test-results/` directory.
  Evidence: A concurrent gate sweep produced `ENOENT: no such file or directory, scandir '/Users/georgepickett/research-at-home-better-ui/test-results'` until `eslint.config.mjs` was updated to ignore Playwright artifact directories.

## Decision Log

- Decision: Treat Ensue as a server-side dependency only. No browser code will call the Ensue JSON-RPC endpoint directly.
  Rationale: The live feed likely depends on namespaces that are not safely public, and secrets must never be exposed in the browser. A single server normalization layer also prevents client components from reimplementing business logic.
  Date/Author: 2026-03-16 / Codex

- Decision: Treat raw `results/*`, `best/metadata`, `best/agent/*`, `best/tier/*`, `claims/*`, `insights/*`, and `hypotheses/*` as canonical, and treat any precomputed `leaderboard` key as advisory rather than authoritative.
  Rationale: The dashboard’s narrative depends on reconstructing the frontier history, pressure windows, and contribution metrics. Those must be derived from raw records so the UI cannot drift from the underlying swarm history.
  Date/Author: 2026-03-16 / Codex

- Decision: Keep the current editorial visual direction and descent-wall concept, but restructure the code around a real data spine before adding more surface area.
  Rationale: The MVP already proves the design language. The largest remaining risk is data correctness and operational behavior, not visual exploration.
  Date/Author: 2026-03-16 / Codex

- Decision: Split environment validation into a safe base env module and a dashboard-specific server env module instead of making the existing global env import stricter.
  Rationale: The current `layout.tsx` import means strict server-secret parsing in `src/lib/env.ts` would hard-crash the entire app too early. A dedicated server-only env module lets the home page render a graceful configuration error state.
  Date/Author: 2026-03-16 / Codex

## Outcomes & Retrospective

The app now runs as a real data product rather than a static design artifact. The home page fetches and normalizes raw Ensue namespaces on the server, polls a thin `/api/dashboard` route from the client, preserves filter state in the URL, and exposes stable agent and improvement pages. The original local fixture source was retired from the runtime path and replaced by a checked-in raw fixture plus a capture script for tests and local development.

The most important implementation lesson was that the UI work only became reliable once identifiers and boundaries were treated as first-class data concerns. Two concrete examples surfaced during verification: pressure windows needed strict end boundaries to avoid overlapping the next frontier cut, and dynamic route params had to be decoded before matching snapshot identifiers. Once those were fixed, the narrative UI and the live data spine lined up cleanly.

## Context and Orientation

This repository is a Next.js 16 App Router application rooted at `/Users/georgepickett/research-at-home-better-ui`. The home page lives in `src/app/page.tsx`. The top-level client shell lives in `src/features/dashboard/components/dashboard-client.tsx`. The main graphic is `src/features/dashboard/components/descent-wall.tsx`. The leaderboard, feed, and strategy summary panels live in `src/features/dashboard/components/crown-table.tsx`, `src/features/dashboard/components/activity-feed.tsx`, and `src/features/dashboard/components/strategy-pulse.tsx`. The current mock data source is `src/features/dashboard/data/swarm-data.ts`, and the current derived snapshot builder is `src/features/dashboard/lib/dashboard.ts`. Shared type definitions live in `src/features/dashboard/lib/types.ts`.

“Ensue shared memory” means the remote key/value store that the swarm writes to. A “namespace” is a prefix such as `results/`, `best/agent/`, or `claims/`. A “normalization layer” means the server code that reads those raw JSON blobs and converts them into the stable `DashboardSnapshot` object that the UI consumes. A “frontier cut” means a result whose `val_bpb` is strictly lower than every earlier kept result. A “pressure window” means the set of nearby experiments, claims, and notes that happened while one frontier cut was the reigning best.

Assume the live hub organization is `autoresearch-at-home`, the RPC base URL is `https://api.ensue-network.ai/`, and the app receives a valid server-side API key via environment variable. Assume the browser never sees the key. If the key is missing or invalid, the app must fail loudly with an explicit configuration panel and an actionable JSON error from the API route; do not silently fall back to the fixture data.

The current toolchain already exists in `package.json`: `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run e2e`. The current unit test file is `tests/unit/dashboard.test.ts`, which still targets the mock-only `buildDashboardSnapshot()` function, and the current browser test file is `tests/e2e/home.spec.ts`, which only proves that the landing view renders three strings. `playwright.config.ts` already starts a dedicated local dev server on port `3404`, so the implementation and docs must not accidentally assume that browser automation runs against the default `3000` port.

## Plan of Work

Milestone 1 establishes the live data spine and must start by fixing the env-loading trap. Remove the eager `import "@/lib/env";` from `src/app/layout.tsx` or reduce `src/lib/env.ts` to variables that are safe to parse globally. Then add a dedicated server-only env module, either `src/features/dashboard/lib/server-env.ts` or another equally explicit path under `src/features/dashboard/lib/`, that imports `server-only` and parses `ENSUE_API_KEY`, `ENSUE_API_URL`, and `ENSUE_HUB_ORG`. This split is mandatory because the current layout import would otherwise prevent any graceful configuration UI from rendering.

Still in Milestone 1, create `src/features/dashboard/schemas/ensue.ts` and define the exact `zod` schemas for raw Ensue records: result records, per-agent best records, tier-best metadata, claim records, insight records, and hypothesis records. Each schema must describe the raw fields the swarm actually stores, including optional fields such as `train_py`, `repo_url`, or `commit_url`. Add `src/features/dashboard/queries/fetch-ensue.ts` as the only module that knows how to call the Ensue JSON-RPC endpoint. It should export server-only functions such as `fetchResults()`, `fetchAgentBests()`, `fetchGlobalBest()`, `fetchTierBests()`, and `fetchActivityFeedInputs()`. These functions must call the new server env module, not the globally imported `src/lib/env.ts`, and they must produce actionable errors that include the missing variable name or RPC failure status.

In the same milestone, replace the current synchronous `buildDashboardSnapshot()` implementation in `src/features/dashboard/lib/dashboard.ts` with a two-step async pipeline. First, add `src/features/dashboard/lib/normalize-snapshot.ts` to convert raw Ensue data into a `DashboardSnapshot`. Second, change `src/features/dashboard/lib/dashboard.ts` into an async orchestration layer that fetches raw data, invokes normalization, and returns the final snapshot. Rename the exported function if needed so its async nature is obvious, for example `getDashboardSnapshot()`. Move the current fixture arrays in `src/features/dashboard/data/swarm-data.ts` into a test-fixture role only. The normalized model should preserve the editorial concepts already used by the UI: `improvements`, `leaderboard`, `strategies`, and `feed`. Because live raw records do not contain `track` and `note`, add `src/features/dashboard/lib/strategy-taxonomy.ts` to infer a strategy family from each experiment description. Start with explicit text rules for optimizer, attention, shape, depth, systems, residuals, and baseline. Keep the inference deterministic and unit-tested.

Also in Milestone 1, create `src/app/api/dashboard/route.ts`. This route must call the server normalization layer and return a single JSON payload containing `stats`, `improvements`, `leaderboard`, `strategies`, `feed`, and any lookup tables needed by the client. Keep the route thin; unit tests should focus on the fetch and normalize modules rather than forcing route handlers to contain business logic. Add `export const revalidate = 15` or the equivalent App Router cache control in the route module so freshness is explicit in code. Add `src/app/api/health/route.ts` with a minimal health response so deployments can be sanity-checked. Leave `next.config.ts` unchanged unless a real config need appears during implementation, because the current local browser automation already works without additional `allowedDevOrigins`.

Milestone 2 converts the current static dashboard into a real interactive application. Refactor `src/app/page.tsx` from its current synchronous server component into an `async` page that fetches the initial snapshot on the server rather than synthesizing it from local arrays. Have it also accept `searchParams` and pass validated initial filter state into the client shell. Create `src/hooks/use-dashboard-snapshot.ts` to poll `/api/dashboard` from the browser on an interval while the tab is visible. Use React transitions so periodic refreshes do not freeze filters or scrolling. Update `src/features/dashboard/components/dashboard-client.tsx` to own filter state in URL search parameters instead of only local component state. In practice this means adding `useRouter`, `useSearchParams`, and a controlled mapping between UI state and query params. At minimum, support `agent`, `view`, and `step` search params so a shared URL can open directly to a filtered dashboard and selected improvement.

Extend the visual surface without throwing away the current design. Keep `src/features/dashboard/components/descent-wall.tsx` as the main chart, but add keyboard focus states, hover affordances, and click selection. Create `src/features/dashboard/components/improvement-detail-sheet.tsx` and open it when the user clicks a frontier cut or lands on a URL with `?step=<id>`. The sheet must explain the chosen cut in plain language: who made it, what changed, how long it reigned, what other experiments happened during its reign, and which insights or hypotheses are semantically or temporally adjacent. The simplest reliable implementation is to show items from the same pressure window rather than inventing semantic similarity on day one. Add `src/app/loading.tsx` for an intentional loading state and `src/app/error.tsx` for route-level failures so the App Router behavior matches the product goal of clear, humane failure states.

Milestone 2 also strengthens the non-chart panels. Expand `src/features/dashboard/components/crown-table.tsx` so “Frontier” and “Pressure” are not only sorted differently but also explain the metric definition inline. Add one more metric card for “Longest reign” using the derived `reignHours`. Update `src/features/dashboard/components/activity-feed.tsx` to group items by type and to deep-link to the selected agent or improvement when possible. Update `src/features/dashboard/components/strategy-pulse.tsx` so strategy bars can also filter the wall and crown table when clicked. None of these interactions should rely on hidden mutable global state; all selected state should flow through the page-level search params and snapshot filters.

Milestone 3 rounds out the product surface so the dashboard is complete rather than just a single page. Create `src/app/agent/[agentId]/page.tsx` to render an agent profile page. It should reuse the same normalization layer and show the selected agent’s best score, all of their frontier wins, their recent results, and the strategy families where they have contributed. Create `src/app/improvement/[improvementId]/page.tsx` for a shareable story page for a single frontier cut. This page should restate the key change, show the before and after scores, render the reign window, and link back to the home dashboard with the right filters applied. Add `generateMetadata` support to these routes so shared links carry useful titles. Add `src/app/not-found.tsx` and call `notFound()` when an unknown `agentId` or `improvementId` is requested so invalid deep links fail predictably.

Milestone 3 is also where the onboarding and empty-state experience becomes real. Replace the generated `README.md` with project-specific instructions: required environment variables, how live data is fetched, how to run tests, and how the design maps to the autoresearch system. In the UI, add a concise “Join the community” panel that explains what the app is showing and links to the community join page and cloud GPU docs. If `/api/dashboard` fails due to configuration, the page must render a first-class configuration error card that names the missing env var or RPC error. Do not show the fixture data in this state. The rule is fail fast, fail clearly.

Milestone 4 hardens the implementation. Add `tests/fixtures/ensue/` and create a small checked-in corpus of representative raw Ensue records. Add `scripts/capture-ensue-fixtures.mjs` to fetch and refresh those fixtures from the live hub when the maintainer has a valid key. The unit suite must move beyond the current smoke test and cover at least the frontier derivation, pressure-window grouping, strategy inference, feed normalization, and agent leaderboard metrics. Concretely, replace the current assertions in `tests/unit/dashboard.test.ts` so they target the new normalization function over fixture input, and add at least `tests/unit/strategy-taxonomy.test.ts` plus a React Testing Library file such as `tests/unit/dashboard-client.test.tsx` to verify URL-search-param synchronization. Expand Playwright coverage so the browser suite proves the live home dashboard, filter-to-URL behavior, agent page, and improvement page all render correctly when the API route is stubbed or seeded with fixture data. Keep using the existing `playwright.config.ts` server setup on port `3404` instead of introducing a parallel browser-test harness.

## Concrete Steps

Work from `/Users/georgepickett/research-at-home-better-ui`.

Start by wiring the live env contract and route handlers.

    cd /Users/georgepickett/research-at-home-better-ui
    printenv ENSUE_API_KEY
    printenv ENSUE_HUB_ORG
    npm run dev

Expect `ENSUE_API_KEY` to be set, `ENSUE_HUB_ORG` to default to `autoresearch-at-home` if omitted in code, and the dev server to start on `http://localhost:3000`. Do not parse `ENSUE_API_KEY` from `src/app/layout.tsx`; validate it only inside the server-only dashboard data path so the app can still render an intentional configuration error card.

After implementing the API route, validate the normalized snapshot directly.

    cd /Users/georgepickett/research-at-home-better-ui
    curl http://localhost:3000/api/dashboard

Expect JSON with top-level keys similar to:

    {
      "stats": { "experiments": 2742, "improvements": 82, "agents": 95, "currentBest": 0.926381 },
      "improvements": [ ... ],
      "leaderboard": [ ... ],
      "strategies": [ ... ],
      "feed": [ ... ]
    }

Once the client is moved to live data and the detail surfaces exist, run the full local check suite.

    cd /Users/georgepickett/research-at-home-better-ui
    npm run lint
    npm run typecheck
    npm run test
    npm run e2e

The expected result is zero lint errors, a clean TypeScript pass, unit tests that exercise normalization and derived metrics, and browser tests that open the home page, apply filters, open an improvement detail view, and navigate to an agent page.

For browser testing, remember that Playwright already manages its own port through `playwright.config.ts`.

    cd /Users/georgepickett/research-at-home-better-ui
    npm run e2e

Expect Playwright to launch the app on `http://localhost:3404` automatically.

If fixture capture is implemented in Milestone 4, refresh fixtures only from a machine that has the valid key:

    cd /Users/georgepickett/research-at-home-better-ui
    node scripts/capture-ensue-fixtures.mjs

This command must overwrite only the files under `tests/fixtures/ensue/` and print which namespaces were captured.

## Validation and Acceptance

The implementation is complete when a novice can clone the repository, set the required env vars, run `npm run dev`, and see the real autoresearch dashboard on `http://localhost:3000` without touching any source code. The home page must show live numbers from Ensue rather than the hard-coded fixture arrays. Filtering by agent must update the descent wall, crown table, strategy pulse, and activity feed together, and the URL must preserve that filter so the view is shareable. Refreshing the page with `?agent=<id>&view=pressure&step=<id>` must reproduce the same selected state.

Clicking a frontier cut on the wall must open an improvement detail sheet that identifies the winning experiment, the size of the drop, the time it reigned, and the nearby attempts during that reign. Visiting `/agent/<agentId>` must show a stable agent detail page. Visiting `/improvement/<improvementId>` must show a stable improvement story page. These behaviors are user-visible acceptance, not optional embellishments.

On the operational side, `/api/dashboard` must return normalized JSON when configured correctly and an explicit error payload when configuration is missing or invalid. The browser must surface that error clearly instead of showing stale fixture data or an empty wall. Missing configuration must not crash the entire layout before the page can render. The final implementation must pass `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run e2e`.

## Idempotence and Recovery

All read paths against Ensue are safe to rerun because they are read-only. Re-running `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run e2e` is safe and should not mutate repository state. Re-running `node scripts/capture-ensue-fixtures.mjs` is also safe if it only rewrites fixture files under `tests/fixtures/ensue/`.

If the app fails to load because `ENSUE_API_KEY` is missing, do not patch around it in the UI. Add the env var and retry. If the page fails before the error UI appears, check for accidental secret parsing in globally imported modules such as `src/app/layout.tsx`. If the dev server becomes inconsistent after schema or route changes, stop the server, delete `.next/`, and restart `npm run dev`. If normalization logic drifts, regenerate fixtures from the live hub and rerun the unit tests before changing UI code.

## Artifacts and Notes

The current home page already demonstrates the target visual language. Keep these files as the design baseline while replacing the data spine:

    src/features/dashboard/components/dashboard-client.tsx
    src/features/dashboard/components/descent-wall.tsx
    src/features/dashboard/components/crown-table.tsx
    src/features/dashboard/components/activity-feed.tsx
    src/features/dashboard/components/strategy-pulse.tsx

The current mock-only data path that must be retired from runtime is:

    src/features/dashboard/data/swarm-data.ts
    src/features/dashboard/lib/dashboard.ts

The current global env import that must be reconsidered before strict live env validation is:

    src/app/layout.tsx
    src/lib/env.ts

The initial live API contract should remain intentionally small. Favor one aggregated route first:

    GET /api/dashboard
    GET /api/health

Add narrower routes for agent and improvement detail only once the home snapshot is normalized and tested.

## Interfaces and Dependencies

Use the existing dependencies already in `package.json`: `next`, `react`, `zod`, and the current shadcn/ui primitives. Do not add a client-side data fetching library just to poll one route. A small custom hook is sufficient and keeps the data flow obvious. Prefer Next.js and React primitives already in use in this repository: server components for initial data, route handlers under `src/app/api/`, and Vitest plus Playwright for verification.

In `src/features/dashboard/schemas/ensue.ts`, define schemas and exported inferred types for:

    EnsueResultRecordSchema
    EnsueAgentBestSchema
    EnsueTierBestSchema
    EnsueClaimSchema
    EnsueInsightSchema
    EnsueHypothesisSchema

In `src/features/dashboard/queries/fetch-ensue.ts`, define:

    export interface RawEnsueSnapshot {
      results: EnsueResultRecord[]
      globalBest: EnsueResultRecord | null
      agentBests: EnsueAgentBest[]
      tierBests: EnsueTierBest[]
      claims: EnsueClaim[]
      insights: EnsueInsight[]
      hypotheses: EnsueHypothesis[]
    }

    export async function fetchEnsueSnapshot(): Promise<RawEnsueSnapshot>

In `src/features/dashboard/lib/normalize-snapshot.ts`, define:

    export function buildDashboardSnapshotFromEnsue(raw: RawEnsueSnapshot): DashboardSnapshot

In `src/features/dashboard/lib/strategy-taxonomy.ts`, define:

    export type StrategyTrack =
      | "baseline"
      | "optimizer"
      | "attention"
      | "shape"
      | "depth"
      | "systems"
      | "residuals"
      | "other"

    export function inferStrategyTrack(description: string): StrategyTrack

In `src/features/dashboard/lib/dashboard.ts`, expose an async orchestration function, for example:

    export async function getDashboardSnapshot(): Promise<DashboardSnapshot>

In `src/hooks/use-dashboard-snapshot.ts`, define:

    export function useDashboardSnapshot(initial: DashboardSnapshot): {
      snapshot: DashboardSnapshot
      loading: boolean
      error: string | null
      refresh: () => void
    }

In `src/features/dashboard/components/improvement-detail-sheet.tsx`, define a component that accepts the selected improvement identifier, the current `DashboardSnapshot`, and a close callback. The final signature can be simple, but it must be explicit and controlled by the page state rather than hidden internal state.

When the plan changes, append a short note here describing what changed and why.

Change note: Initial plan created after inspecting the current MVP scaffold, the planning rules, and the existing dashboard prototype. The plan is intentionally biased toward replacing the mock data layer first because that is the highest-risk path to a complete product.
Change note: Improved after auditing the current App Router, env import path, and test setup. Added the env/layout blocker, made the live data path explicitly async and server-only, aligned milestones with real route and error files, and grounded the test work in the existing `tests/unit/dashboard.test.ts`, `tests/e2e/home.spec.ts`, and `playwright.config.ts` structure.
