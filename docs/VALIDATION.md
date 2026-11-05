# Validation and preview readiness

The current application was validated in this cloud workspace. GitHub Actions is configured; its remote execution has not been independently observed. The user manages the Render deployment; this workspace has no Render account credentials, so hosted deployment success has not been independently verified. See the production-install regression below.

## Executed checks

- Development startup (npm run dev) was also verified in Chromium: client hydration completed, Play became enabled, and the PostgreSQL health request succeeded.
- Clean `npm ci --no-audit --no-fund` from the committed lockfile: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: 34 passed, zero failed, zero skipped across four test files (15 pure game-engine, four persistent PostgreSQL integration, four HTTP/security, 11 NFL identity/data/scoring checks).
- `npm run data:audit`: passed. The saved compact bank matches regenerated predicates, eligible entity IDs, evidence, source references, and frozen points.
- `npm run build`: passed, including Next.js production TypeScript and route generation.
- `npm start` against a disposable real PostgreSQL 17 server: passed. `/api/health` returned HTTP200 with `status:ok` and `database:connected`.
- Playwright on Chromium against the production server and PostgreSQL17: all seven end-to-end tests passed, zero skipped. This includes authenticated admin checks with a temporary local token. The CI admin test is explicitly skipped unless matching E2E_ADMIN_TOKEN/server credentials are supplied.

Browser coverage includes complete seven-round daily and practice games, sourced correct answers, skipped/unknown input behavior, timer persistence, duplicate scoring protection, cross-player ownership, cross-origin refusal, immutable active daily snapshots, future admin edits, report moderation, refresh/resume, sharing to clipboard, keyboard autocomplete, sound preference, reduced-motion settings, About the Data, and360px mobile overflow checks. Two subsequent presentation fixes replace a decorative glyph with SVG and expose Archive in the mobile footer. The affected mobile test passed again on the final build, including Archive, sound controls, practice, About, and zero horizontal overflow at 360px.

## Data audit

Dataset version: `nflverse-1999-2024-ccfa9337f81d`.

- 3,250 published distinct logical questions and distinct eligible-answer sets.
- 127,418 question-answer eligibility records.
- 24,958 canonical player identities, plus32canonical NFL franchises.
- 15,102 player-seasons derived from128,878 regular-season weekly rows (1999–2024).
- 12,413 draft selections (1980–2024).
- 5,592 postseason rows explicitly excluded from regular-season facts.
- 24,664 candidate predicates audited;18,413 rejected for fewer than10verified answers,114 identical eligible sets,51 overly broad sets, one detected near-duplicate;2,835 otherwise-valid candidates omitted from the published bank to meet preview memory limits.
- Eight categories: Draft room600, Defense373, College pipeline600, Connections209, Pass catchers600, Ground game406, Franchises141, Quarterbacks321.
- Eligible answers per published question: minimum10, mean39.21, maximum467. Daily selection prefers15–200.
- Rarity pairs: Practice Squad5,252; Rookie14,561; Starter33,112; Pro Bowler51,658; GOAT22,835. These are editorial classifications, not fabricated real-user selection frequencies.

Full audit is checked in at `data/question-audit.json`. Import provenance, source checksums, definitions and licensing qualifications are documented in `docs/DATA.md`. Runtime question-bank loading was measured at approximately225MiB RSS in a standalone TypeScript process; initial Next.js production server RSS with PostgreSQL was approximately154MiB, and approximately222MiB after browser validation (plus approximately44MiB for the npm parent). These local measurements are not load testing or proof of Render runtime performance.

## Deployment and remaining scope

`render.yaml` configures Node, production build/start, database connection, generated admin token and readiness checks. It is prepared for review and application in Render. The free database expires after30days; upgrade before retaining real users.

The full specification is preserved in `docs/PRODUCT_SPEC.md`. This preview does not claim complete all-time data, coaching/award/Super Bowl/defensive-statistic coverage, measured-popularity calibration, formal emergency active-puzzle corrections, admin data-import approvals, or production-scale load validation. Review commercial data/name rights and production operations before launch; see `docs/STATUS.md`.

Reusable cloud `install_script` and `start_skill` fields were saved in the environment configuration draft. Saving them does not publish a snapshot; review/save them in environment settings and publish the cloud environment to make that setup reusable. This cloud publication is separate from deploying the web app on Render.

## Render production-install regression

The first hosted build of `c6b11dd` failed to resolve `@/components/brand`. Reproduced from a clean archive of that commit with `NODE_ENV=production npm ci --no-audit --no-fund`: npm omitted development dependencies, and Next could not read TypeScript path aliases without TypeScript installed. Tailwind/PostCSS were also missing.

Added `.npmrc` with `include=dev`, preserving compatibility with the existing Render command. The Blueprint now explicitly uses `npm ci --include=dev --no-audit --no-fund && npm run build`. CI installs with `NODE_ENV=production` so this condition is covered.

Verified in the isolated clean source copy: the original production-mode installation reproduced the reported failure; after adding `.npmrc`, the same installation command installed the required tools and a cold `NODE_ENV=production npm run build` passed webpack compilation, TypeScript checks, and production page generation. No application source or gameplay behavior changed. Actual Render redeployment remains to be observed in the user account.
