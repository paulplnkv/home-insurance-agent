# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config, `eslint.config.mjs`)
- No test framework is configured yet

## Architecture

- **Next.js 16** with App Router (`app/` directory), React 19, TypeScript, Tailwind CSS v4
- Path alias: `@/*` maps to project root
- ESLint uses flat config with `core-web-vitals` and `typescript` presets

## Critical: Next.js 16 Breaking Changes

This project uses Next.js 16.2.4, which has breaking changes from earlier versions. **Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`** — APIs, conventions, and file structure may differ from what you expect. Heed deprecation notices.
