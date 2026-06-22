# Deployment runbook

## Предварительные условия

- CI для выбранного commit завершен успешно;
- в GitHub environment `production` настроено ручное подтверждение;
- заданы secrets `RENDER_DEPLOY_HOOK_URL` и `RENDER_SERVICE_URL`;
- Render получает `JWT_SECRET` и `DATABASE_URL` извне;
- перед изменением схемы проверена актуальная резервная копия PostgreSQL.

## Порядок выпуска

1. Запустить CD вручную из `main`/`master`.
2. CD публикует multi-platform image в GHCR и фиксирует commit-based tag.
3. Команда миграции из опубликованного image проверяется на чистой временной PostgreSQL.
4. После подтверждения environment вызывается Render deploy hook.
5. Render выполняет `npm run migrate` как pre-deploy process и только затем запускает web-процесс.
6. CD ожидает `/api/live`, `/api/ready`, `/api/health` и `/api/openapi.json`.
7. Проверка считается успешной только при совпадении `health.version` с commit SHA.
8. Commit, release image, target и результат smoke-test записываются в GitHub Job Summary.

## Важное ограничение

Текущий Render blueprint собирает тот же Git commit самостоятельно. GHCR image является проверенным release package, но не следует утверждать, что именно его digest запущен в Render. Для строгой immutable delivery платформу нужно перевести на запуск image по digest.
