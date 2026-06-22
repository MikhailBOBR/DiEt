# Dev/prod parity matrix

| Характеристика | Local Compose | CI/release check | Render |
| --- | --- | --- | --- |
| Node.js | Docker image: Node 22 | Node 20/22 tests, image: Node 22 | Docker image: Node 22 |
| Database | PostgreSQL 16 | PostgreSQL 16 | Managed PostgreSQL |
| Schema command | `npm run migrate` | `npm run migrate` | pre-deploy `npm run migrate` |
| Web command | `npm start` | container smoke | `npm start` |
| Seed | Только явный profile/CLI | Не выполняется | Не выполняется автоматически |
| Secrets | Локальный `.env` | GitHub ephemeral values/secrets | Render environment secrets |
| Health checks | live/ready/health | migration compatibility | live/ready/health + release version |

Фактические версии managed PostgreSQL и успешность внешнего deployment должны переноситься в deployment evidence после каждого релиза.
