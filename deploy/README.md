# Deploy

Раздел описывает подготовленный release/deploy-контур проекта `Рацион`. Наличие конфигурации не считается доказательством фактически выполненного внешнего deployment.

## Локальный контейнерный запуск

1. Скопировать `.env.example` в `.env` и заменить placeholders.
2. Запустить основной стек:

```bash
docker compose up --build
```

Compose выполняет миграцию отдельным одноразовым сервисом `migrate`; процесс `app` запускает только HTTP-сервер. Seed не выполняется автоматически.

Для базовых демо-данных:

```bash
docker compose --profile demo run --rm seed-demo
```

Для расширенного набора:

```bash
docker compose --profile large-demo run --rm seed-large
```

## Состав контура

| Файл | Назначение |
| --- | --- |
| [Dockerfile](../Dockerfile) | environment-neutral runtime image |
| [docker-compose.yml](../docker-compose.yml) | локальные web, migration, optional seed и backing services |
| [render.yaml](../render.yaml) | Render blueprint с ручным deploy и pre-deploy migration |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | тесты, coverage и Docker validation |
| [.github/workflows/cd.yml](../.github/workflows/cd.yml) | GHCR package, migration compatibility, ручной Render deploy и smoke-test |
| [runbook.md](./runbook.md) | порядок выпуска |
| [rollback.md](./rollback.md) | порядок отката |
| [parity-matrix.md](./parity-matrix.md) | сравнение сред |
| [deployment-evidence-template.md](./deployment-evidence-template.md) | шаблон фактического подтверждения deploy |

## Конфигурация

Runtime получает секреты и параметры БД только извне. Обязательны:

- `JWT_SECRET`;
- `DB_PROVIDER=postgres`;
- `DATABASE_URL` либо полный набор `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

`AUTO_MIGRATE_ON_BOOT` и boot-time seed удалены. Пароли demo/admin нужны только явным seed/admin-процессам.

## Render

- `autoDeploy: false` исключает случайный production deploy после обычного push;
- `preDeployCommand: npm run migrate` применяет схему до запуска новой версии;
- `JWT_SECRET` генерируется платформой;
- `DATABASE_URL` поступает из managed PostgreSQL;
- `RENDER_GIT_COMMIT` используется приложением как release version для post-deploy проверки.

## CI/CD

- CI запускается на push, pull request, вручную и по расписанию.
- CD по тегу публикует GHCR image и проверяет migration compatibility.
- Внешний Render deploy возможен только через ручной запуск из `main`/`master` и защищенное environment `production`.
- Если deploy hook или service URL не настроены, deployment job завершается ошибкой.
- Успех требует readiness, OpenAPI и совпадения release version с commit SHA.

Render в текущей схеме самостоятельно собирает исходный commit. Поэтому GHCR image и Render runtime относятся к одному commit, но идентичность image digest пока не доказана. Это ограничение явно зафиксировано в runbook.

## Ограничение текущей среды

Репозиторий содержит pipeline и шаблон evidence. Реальным доказательством эксплуатации является только успешно завершенный внешний workflow с заполненными данными deployment, а не этот текст.
