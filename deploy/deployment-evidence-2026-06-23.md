# Deployment evidence — 2026-06-23

Этот файл фиксирует фактически выполненное развертывание production-окружения DiEt/NutriTrack.

- Environment: production / Render
- Service URL: https://kyrsrksp.onrender.com
- Started at: 2026-06-23T17:45:47Z
- Completed at: 2026-06-23T17:48:24Z
- Commit SHA: `d41b185f7eb4ec5816ae0c150bcfd27e9e065a75`
- Release image/tag: `ghcr.io/mikhailbobr/diet/food-diary-app:git-d41b185f7eb4ec5816ae0c150bcfd27e9e065a75`
- GitHub Actions run: https://github.com/MikhailBOBR/DiEt/actions/runs/28045448248
- Workflow status: completed / success
- Migration compatibility: passed in GitHub Actions against temporary PostgreSQL
- Production database migration: applied as a separate administrative operation before runtime checks
- Deployment trigger: Render deploy hook from GitHub Actions
- `/api/live` result: `alive: true`
- `/api/ready` result: `ready: true`, database provider `postgres`, database status `ok`
- `/api/health` result: `status: ok`, `version: d41b185f7eb4ec5816ae0c150bcfd27e9e065a75`
- `/api/openapi.json` result: HTTP 200, OpenAPI `3.0.3`, title `Рацион API`
- Post-deploy smoke: passed
- Rollback target: previous stable Render deployment / previous GitHub Container Registry image
- Notes: web runtime does not run automatic migrations or seed commands; administrative database operations are separated from the HTTP process.
