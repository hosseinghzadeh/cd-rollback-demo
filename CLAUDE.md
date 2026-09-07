# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the `app/` directory:
- `npm install` — install dependencies
- `npm start` — run the server locally (requires `APP_NAME` env var set, e.g. `APP_NAME=todo-demo PORT=3000 npm start`)
- `npm test` — run the CI gating tests (`test/*.test.js`, via Node's built-in test runner)

## Architecture

- `app/server.js` — Express app. Serves `app/public/` as static files, exposes `/todos` (GET/POST) and `/todos/:id/toggle` JSON endpoints, and `/health`. Throws at boot if `APP_NAME` is unset — this is the deliberate failure mode used for the demo (see below).
- `app/todo.js` — pure list-manipulation logic (`addTodo`, `toggleTodo`), no server/env dependency. This is what `test/todo.test.js` covers.
- `test/todo.test.js` — the CI gate. Deliberately narrow: it only exercises `todo.js` logic in-memory, never boots a real server or touches env vars, so it cannot catch environment/config-only failures.
- `.github/workflows/ci.yml` — runs `npm test` on push/PR to `main`.
- `.github/workflows/deploy.yml` — runs on push to `main`. Polls the Render API until the new deploy is `live`, then hits the live `/health` endpoint. If unhealthy, it calls Render's rollback API to redeploy the last known-good deploy and disables `autoDeploy` (Render's rollback endpoint does not do this automatically), then fails loudly so the Actions run visibly shows the auto-recovery.
- `render.yaml` — Render Blueprint definition for the single web service (rootDir `app/`, env var `APP_NAME`).

Required GitHub Actions secrets for `deploy.yml`: `RENDER_API_KEY`, `RENDER_SERVICE_ID`, `APP_URL` (the live Render URL, e.g. `https://todo-rollback-demo.onrender.com`).

The demo's "bad" commit renames the env var `server.js` reads (e.g. `APP_NAME` → a typo'd name) while Render's service config still sets `APP_NAME`. `npm test` still passes since it never touches env vars; the live deploy crashes at boot; the health check catches it and the rollback fires automatically.

## Project purpose

This is a course demo (KTH DD2482) illustrating automated rollback in continuous deployment. The plan:

- A small, standalone to-do list app (static frontend + lightweight API), built specifically for this demo.
- A GitHub Actions CI/CD pipeline that runs tests before deployment and deploys to Render (or similar).
- An automated health check that runs against the live app immediately after deployment.
- The demo ships a change that passes CI but breaks the app in production; the health check detects this and the pipeline automatically rolls back to the last healthy release — without manual intervention.

The core point being demonstrated is the distinction between a manually-triggered rollback and one the system performs automatically upon detecting a live failure, and why automatic rollback is what makes frequent, unattended deployment safe.

## TA guidance (not in the approved proposal)

The only feedback given outside the approved proposal: the health check must catch a class of failure that is hard to incorporate into the CI test suite. If the failure could just as easily be caught by a normal test before deployment, there's no real need for a post-deploy rollback — the demo's premise depends on the break only being observable once the app is live (e.g. bad runtime configuration, environment-specific issues, or a broken dependency in the deployed environment) rather than something a pre-deploy test would catch.
