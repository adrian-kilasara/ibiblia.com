# iBiblia.com

Bible translation, publishing, and distribution — public marketing site + custom CMS.

Premium, editorial, trust-building. Navy `#2E2B4D` + gold `#D7B66C` accent on a white-dominant
canvas. Built as a pnpm + Turborepo monorepo.

## Structure

```
apps/
  web/     Next.js public marketing site (SSG/ISR)
  admin/   Next.js bespoke admin CMS
  api/     NestJS API + Prisma/Postgres + donations + auth
packages/
  ui/      shared design system (tokens, primitives, motion)
  types/   shared TypeScript types + API client
  config/  shared tsconfig + tailwind preset
infra/
  docker-compose.yml   Postgres + Redis + MinIO (local dev)
```

## Getting started

```bash
pnpm install
cp .env.example .env         # fill in secrets
pnpm infra:up                # start Postgres + Redis + MinIO
pnpm db:migrate
pnpm db:seed
pnpm dev                     # runs web + admin + api
```

- Public site → http://localhost:3200
- Admin CMS → http://localhost:3201
- API → http://localhost:4400

> This machine already runs other stacks on the common ports, so iBiblia uses a high port
> block: web 3200, admin 3201, API 4400, Postgres 55432, Redis 63817, MinIO 9002/9003.

## Status

Phase 1: marketing site + CMS + integrated donations (Stripe + Paystack).
See `.claude/plans/` for the full plan. Later phases: bookstore checkout, digital reading /
audio, donor/volunteer/partner portals, AI search.
