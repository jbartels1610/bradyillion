# Render deployment

In Render choose New → Blueprint, connect github.com/jbartels1610/bradyillion and branch main, and review/apply render.yaml. The web service and PostgreSQL database share a region. Render supplies an internal DATABASE_URL and generates ADMIN_TOKEN. Never commit secret values.

Build: npm ci --include=dev --no-audit --no-fund && npm run build
Start: npm start (respects PORT)
Health: /api/health checks an actual database query.

For an existing web service, set the same commands, DATABASE_URL to PostgreSQL's internal connection, and a strong ADMIN_TOKEN of at least24characters. RENDER_EXTERNAL_URL is accepted as the trusted browser origin. Do not persist ranked data on Render's ephemeral disk.

After deployment, verify health HTTP200, a full7-round game, refresh preserving the original deadline and result, practice mode, sharing, restart persistence with PostgreSQL, and unauthorized admin refusal. Open the service's Render-assigned HTTPS address only after actual deployment succeeds. Local validation cannot establish that the hosted service is ready.

Free instances sleep and the free database expires after30days. Review pricing, upgrade to durable storage, configure backups and observability, and load-test before public launch. Anonymous cookies cannot prevent determined multiple-identity abuse. The current transaction design prioritizes correctness for playtesting; production throughput needs measurement and tuning.

## Production-mode dependency installation

Keep `NODE_ENV=production`. The build needs development dependencies, including TypeScript (which enables the `@/` aliases), Tailwind/PostCSS, and types. The Blueprint explicitly installs them with `--include=dev`. The checked-in `.npmrc` also sets `include=dev`, so an existing Render service using the earlier `npm ci --no-audit --no-fund && npm run build` command receives the same fix without a settings edit. CI performs a clean production-mode installation to cover this deployment condition.
