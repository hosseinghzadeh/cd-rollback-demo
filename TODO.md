# TODO — before the demo

## What's already built and verified locally

- `app/` — Express to-do app (`server.js` + `todo.js` + `public/` static frontend).
  - `/health` returns `200 {"status":"ok","app":"<APP_NAME>"}` — verified locally.
  - Server **throws at boot** if `APP_NAME` is unset — verified locally (this is the deliberate failure mode for the demo).
  - `/todos` (GET/POST) and `/todos/:id/toggle` — in-memory list, resets on restart.
- `test/todo.test.js` — 2 unit tests on `todo.js` logic only (`addTodo`, `toggleTodo`). Run with `npm test` from `app/`. **Passing.**
- `.github/workflows/ci.yml` — runs `npm test` on push/PR to `main`. Repo is now pushed to GitHub ([nalin431/DevOps_ToDo_RollbackDemo](https://github.com/nalin431/DevOps_ToDo_RollbackDemo)) — confirm this workflow actually ran green on the push.
- `.github/workflows/deploy.yml` — polls Render for deploy status, hits live `/health`, and on failure calls Render's rollback API + disables `autoDeploy`. Written against Render's real API docs (endpoints, request/response shapes, auth) but **not yet tested against a real Render service**.
- `render.yaml` — Render Blueprint for the service (rootDir `app/`, env var `APP_NAME`).

## What still needs to happen before the demo

1. **Create the Render service.** (repo is already pushed to GitHub — done)
   - Connect the GitHub repo to Render, or apply `render.yaml` as a Blueprint.
   - Confirm the service deploys successfully with `APP_NAME` set (e.g. `todo-rollback-demo`).
   - Note the live URL (e.g. `https://todo-rollback-demo.onrender.com`).

2. **Add GitHub Actions secrets** (repo Settings → Secrets and variables → Actions):
   - `RENDER_API_KEY` — a Render API key (Account Settings → API Keys).
   - `RENDER_SERVICE_ID` — the service's ID (visible in the Render dashboard URL or via `GET /v1/services`).
   - `APP_URL` — the live Render URL from step 1.

3. **Dry-run the rollback logic manually before doing it live.** Don't discover an auth/permissions/API-shape issue during the actual demo.
   - Confirm `curl -H "Authorization: Bearer $RENDER_API_KEY" https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys?limit=1` returns a deploy with the expected shape (`.[0].deploy.status`, `.[0].deploy.id`).
   - Manually trigger one full CI → deploy → healthcheck cycle by pushing a trivial, non-breaking change to `main` and watching `deploy.yml` pass end-to-end (health check succeeds, no rollback fires).

4. **Rehearse the actual failure/rollback end-to-end at least once**, well before the demo:
   - Push the "bad" commit (see below).
   - Confirm: CI stays green → Render deploys the broken commit → `deploy.yml` health check fails → rollback fires → service is restored to the last good deploy → `autoDeploy` gets disabled → workflow run shows this clearly in the Actions log.
   - **After the rehearsal, re-enable `autoDeploy`** on the Render service (`PATCH /v1/services/$RENDER_SERVICE_ID` with `{"autoDeploy": "yes"}`, or via the dashboard) before the real demo, since the rollback step disables it.
   - Revert the bad commit on `main` (or reset to the last good commit) so the repo is back in a known-good state before the live run.

5. **Time the full loop.** Push → CI → Render build/deploy → health check retries → rollback, all needs to comfortably fit in 6 minutes. Render free-tier cold starts/build times are the main risk here — if the rehearsal run is too slow, consider a paid instant-deploy tier, or pre-warm the service just before the demo starts.

## The "bad" commit to use during the demo

Rename the env var `server.js` reads, e.g. change:
```js
if (!process.env.APP_NAME) {
```
to:
```js
if (!process.env.APP_NAME_V2) {
```
(and use `process.env.APP_NAME_V2` in the `/health` handler too). Render's service config still only sets `APP_NAME`, so:
- `npm test` still passes (logic tests never touch env vars) → CI stays green.
- The live deploy crashes at boot (`APP_NAME_V2` is undefined) → health check fails → rollback fires automatically.

Keep this as a ready-to-push commit/branch so it can be triggered on cue during the demo rather than typed live.

## How to run locally

```sh
cd app
npm install
APP_NAME=todo-demo PORT=3000 npm start
# in another terminal:
curl http://localhost:3000/health
```

Run tests:
```sh
node --test test/*.test.js
# or: cd app && npm test
```
