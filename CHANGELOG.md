# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.0] - 2025-09-23

Initial public release.

Highlights:
- Dev orchestrator script (`scripts/dev-all.js`) with fixed port, restart policy, debounce, and graceful shutdown.
- Simplified Express backend with `/health` endpoint and clean shutdown.
- React + Vite + TypeScript + Tailwind app builds and typechecks cleanly.
- ESLint baseline relaxed (warnings allowed), fixed hooks ordering in Sidebar.
- Supabase integration skeleton with audit script (`scripts/provision-audit.cjs`).
- GitHub Actions: CI (lint/typecheck/build), Supabase Audit (manual), and manual Release creation.

Notes:
- Configure repository secrets (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) before running the audit workflow or deploying.
- Future: finalize RLS across remaining tables, deployment setup, and progressive lint tightening.
