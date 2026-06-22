# Twelve-Factor App

Документ фиксирует фактическое, а не заявленное соответствие проекта методологии Twelve-Factor App.

| Factor | Статус | Подтверждение и ограничение |
| --- | --- | --- |
| I. Codebase | Реализован | Один Git-репозиторий содержит frontend, backend, тесты и инфраструктурные файлы. |
| II. Dependencies | Реализован | Зависимости объявлены в `package.json` и зафиксированы `package-lock.json`. |
| III. Config | Реализован для runtime | Секреты и параметры БД поступают извне; Docker image не содержит JWT/DB credentials. Примеры конфигурации содержат только заменяемые placeholders. |
| IV. Backing services | Реализован | PostgreSQL подключается через `DATABASE_URL`/`DB_*`; SQLite используется только в изолированных локальных тестах. |
| V. Build, release, run | Реализован в приложении, частичен на платформе | Web-процесс не выполняет миграции и seed. Миграция запускается отдельной release-командой. Render пока самостоятельно собирает тот же commit, поэтому GHCR digest не является доказанным deployed artifact. |
| VI. Processes | Реализован | Web-процесс stateless; долговременные данные находятся в PostgreSQL. |
| VII. Port binding | Реализован | Порт задается через `SERVER_PORT`/`PORT`. |
| VIII. Concurrency | Подготовлен | Состояние вынесено в PostgreSQL; фактическая проверка нескольких реплик остается эксплуатационной задачей. |
| IX. Disposability | Реализован | Есть graceful shutdown, liveness и readiness endpoints. |
| X. Dev/prod parity | Частично | Node 22, PostgreSQL 16, Dockerfile и команда миграции унифицированы; реальная parity подтверждается только после staging/production deployment evidence. |
| XI. Logs | Реализован | Структурированные логи направляются в `stdout/stderr`. |
| XII. Admin processes | Реализован | Миграция, seed и создание администратора запускаются отдельными CLI-процессами. |

## Config

Обязательные секреты и deploy-specific параметры не имеют рабочих значений по умолчанию:

- `JWT_SECRET`;
- `DATABASE_URL` либо полный набор `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`;
- пароли bootstrap-пользователей — только для явного seed-процесса.

Безопасные технические defaults, например порт и timeout, остаются в коде. Для `production`, `staging`, `release` и `container` включена усиленная проверка: PostgreSQL обязателен, а JWT secret должен содержать не менее 32 символов.

## Build, release, run

- build: Docker image создается без секретов и environment-specific DB-настроек;
- release: `npm run migrate` выполняется отдельным процессом, seed запускается только явно;
- run: `npm start` запускает только HTTP-сервис;
- Render: `preDeployCommand` применяет миграцию до запуска новой версии;
- Compose: одноразовый сервис `migrate` должен успешно завершиться до запуска `app`.

## Admin processes

- `npm run migrate`;
- `npm run seed:demo`;
- `npm run seed:readable`;
- `npm run seed:large`;
- `npm run create-admin`;
- `npm run config:check`.

## Dev/prod parity

Матрица сред находится в [deploy/parity-matrix.md](../deploy/parity-matrix.md). Статус Factor X остается частичным, пока репозиторий не содержит реального результата staging/production smoke-test. Шаблон evidence не считается доказательством выполненного deploy.

## Вывод

Кодовые нарушения Config и Build/Release/Run устранены. Полное соответствие Factor X и неизменяемость deployed artifact не заявляются без фактических эксплуатационных данных.
