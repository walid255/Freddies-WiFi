# Freddies WiFi

Multi-tenant ISP operations console built with Next.js App Router / React Server Components and deployed on Cloudflare Workers. D1 holds relational tenant data; KV and R2 bindings are ready for cache and media integrations. The responsive operator dashboard uses server-rendered, minimized DTOs and tenant-scoped aggregate queries.

## Local setup

1. Install Node.js 20+ and dependencies with `npm install`.
2. Create D1, KV, and R2 resources in Cloudflare, then replace the binding IDs and names in `wrangler.jsonc`.
3. Configure Cloudflare Access for the app. Set `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` in Worker secrets/vars (or local `.dev.vars`).
4. Apply the schema with `npx wrangler d1 migrations apply freddies-wifi --local`.
5. Provision tenant and user records through a trusted administrative process. `users.access_sub` must match the immutable subject (`sub`) claim in a verified Cloudflare Access JWT. Never provision users from an unverified browser request.
6. Run `npm run dev` for the local Workers runtime.

Cloudflare Access protects the app at the edge. Middleware gates protected paths, and every server component/API handler independently verifies the signed Access JWT, resolves an active application user, and enforces role checks. SQL access is bound to the authenticated user's tenant; the sessions API returns a minimized DTO and is uncached. Components do not render user-authored HTML. There are currently no realtime subscriptions or untrusted HTML templates.

## Deploy

This app uses Next.js server rendering and is packaged for the existing **Cloudflare Pages** project using Advanced mode. `npm run build` creates the OpenNext Worker, packages it as `dist/_worker.js`, and copies static assets into `dist`. The Pages Worker serves those static assets through Pages' `ASSETS` binding and forwards dynamic requests to Next.js. The root `wrangler.jsonc` sets `pages_build_output_dir` to `./dist`, so keep Cloudflare Pages configured with build command `npm run build` and output directory `dist`. Enable the Pages v2 build system and deploy this Wrangler config as the project configuration source.

`wrangler.worker.jsonc` is the OpenNext build/runtime configuration; `wrangler.jsonc` is the Pages configuration. Provision D1/KV/R2 and Cloudflare Access settings in Pages before deploying, replacing all placeholder values. For a local preview, run `npm run preview`; for a direct Pages deployment, run `npm run deploy`. Never deploy with placeholder IDs or Access values. Use Cloudflare's encrypted secrets for credentials, restrict data access to this project, and configure database backups, alerting, and retention before onboarding customer data.

## Integration status

The database and runtime bindings are provisioned for the planned product, but external services are intentionally not represented as connected: Omada, mobile-money providers, RADIUS/FreeRADIUS, captive-portal customization, ad delivery, and payment webhooks still require their provider-specific adapters, credentials, and deployment/testing. Cloudflare Workers cannot originate RADIUS UDP traffic; deploy FreeRADIUS in a network environment that supports UDP and connect it through a separately authenticated, network-restricted service. Do not expose RADIUS shared secrets to the browser or Worker.

The dashboard currently has a tenant-scoped read model and an authenticated sessions API. New server procedures must use `requireProcedure`, check resource ownership/tenant scope in each query, and return explicit DTOs rather than database rows.
