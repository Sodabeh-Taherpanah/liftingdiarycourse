# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Requirements

- **Node.js 20.9+** (Next.js 16 minimum). The current environment is on Node 18 — upgrade before running the dev server or builds.

## Commands

```bash
npm run dev      # start dev server (Turbopack, localhost:3000)
npm run build    # production build (Turbopack by default)
npm run start    # serve production build
npm run lint     # run ESLint
```

No test suite is configured yet.

## Architecture

This is a **Next.js 16** App Router project with TypeScript, React 19, and Tailwind CSS v4.

- `src/app/` — App Router root. `layout.tsx` is the root layout (Geist font, full-height flex body). `page.tsx` is the home route.
- `src/app/globals.css` — global styles and **all Tailwind theme config**. Tailwind v4 uses `@theme inline { ... }` CSS blocks instead of `tailwind.config.js` — extend colors/fonts here, not in a config file.
- `public/` — static assets served at `/`.
- `next.config.ts` — typed Next.js config (currently empty defaults).
- `postcss.config.mjs` — Tailwind CSS v4 via `@tailwindcss/postcss`.
- ESLint uses flat config (`eslint.config.mjs`) with `eslint-config-next/core-web-vitals` and `/typescript`.
- TypeScript path alias: `@/*` → `src/*` (e.g. `import Foo from "@/components/Foo"`).

## React 19 Notes

This project uses **React 19**. Key new APIs available:

- `use(promise)` — read async values inside render (replaces `useEffect`-based data fetching in many patterns).
- `useActionState(action, initialState)` — manage form action state; replaces manual `useState` + server action patterns.
- `useFormStatus()` — read the pending state of a parent `<form>` submission (import from `react-dom`).
- Server Components can `async/await` directly — no need to hoist data fetching to a client wrapper.
- `'use client'` / `'use server'` directives are how you opt components into the client bundle or mark Server Actions.

## Next.js 16 Breaking Changes

**Always consult `node_modules/next/dist/docs/` before writing Next.js-specific code.**

Key breaks from prior versions:

- **Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, route `params`, and page `searchParams` are fully async. Synchronous access is removed. Always `await` them.
  ```ts
  // correct
  const { slug } = await props.params
  const cookieStore = await cookies()
  ```
- **`middleware` → `proxy`** — rename `middleware.ts` → `proxy.ts`; export `proxy` instead of `middleware`. The `edge` runtime is not supported in `proxy` (use `nodejs`). Config flag `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`.
- **Turbopack by default** — `next dev` and `next build` use Turbopack. Custom `webpack` config in `next.config.ts` will cause `next build` to fail unless `--webpack` is passed. Use top-level `turbopack: {}` (not `experimental.turbopack`).
- **`revalidateTag` requires second arg** — `revalidateTag('key', 'max')`. Single-arg form is deprecated. For immediate refresh use `updateTag` in Server Actions.
- **`cacheLife` / `cacheTag`** — no longer prefixed with `unstable_`; import directly from `next/cache`.
- **PPR** — `experimental.ppr` is removed; use `cacheComponents: true` in `next.config.ts` instead.
- **Local images with query strings** — require `images.localPatterns[].search` config to work.
- **OG/icon image functions** — `params` and `id` are now Promises; `await` them inside the generating function.
- **Sitemap `id`** — `id` passed to the sitemap generating function is now `Promise<string>`; `await` it.

Run `npx next typegen` to auto-generate `PageProps`, `LayoutProps`, and `RouteContext` type helpers after adding dynamic routes.
