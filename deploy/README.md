# Deploy

Этот раздел описывает контейнерный запуск, облачную конфигурацию и правила CD для проекта `Рацион`.

## Локальный контейнерный запуск

Для локального стенда используется корневой [Dockerfile](../Dockerfile), [docker-compose.yml](../docker-compose.yml), PostgreSQL и Redis:

```bash
docker compose up --build
```

После запуска:

- приложение: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/api/docs`
- readiness check: `http://localhost:8080/api/ready`

## Состав deploy-контура

| Файл | Назначение |
| --- | --- |
| [Dockerfile](../Dockerfile) | основной runtime-образ приложения |
| [docker/server.Dockerfile](./docker/server.Dockerfile) | серверный Dockerfile для отдельных deploy-сценариев |
| [docker/client.Dockerfile](./docker/client.Dockerfile) | заготовка для варианта с отдельным frontend-контейнером |
| [docker-compose.yml](../docker-compose.yml) | локальная оркестрация приложения, PostgreSQL и Redis |
| [render.yaml](../render.yaml) | blueprint для облачного запуска на Render |
| [.github/workflows/cd.yml](../.github/workflows/cd.yml) | публикация образа в GHCR и ручной deploy hook |

## Переменные окружения

Ключевые переменные runtime-контура:

- `APP_ENV`
- `RELEASE_VERSION`
- `SERVICE_NAME`
- `SERVER_HOST`
- `SERVER_PORT`
- `PORT`
- `JWT_SECRET`
- `LOG_LEVEL`
- `TRUST_PROXY`
- `DB_PROVIDER`
- `DATABASE_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_PATH` только для локального SQLite fallback
- `AUTO_MIGRATE_ON_BOOT`
- `SEED_DEMO_DATA`
- `SEED_LARGE_DATA`

Полный пример находится в [.env.example](../.env.example).

## Постоянное хранилище

Production-friendly режим рассчитан на PostgreSQL. В `render.yaml` web service получает `DATABASE_URL` из managed PostgreSQL database `nutritrack-db`.

SQLite сохранен как легкий fallback для локальных тестов и изолированных запусков. Production-базу данных нельзя коммитить в репозиторий.

Для демонстрационного облачного стенда `SEED_LARGE_DATA=true` включает массовое наполнение PostgreSQL через общий seed-скрипт. Это позволяет Render-базе содержать большой набор демо-данных без SQLite-файла в Git.

## Render

В [render.yaml](../render.yaml) подготовлен Docker-based web service `nutritrack-app` и managed database `nutritrack-db`.

Важная настройка:

```yaml
autoDeploy: false
```

Это сделано специально: обычный commit/push в GitHub не должен запускать production deploy и создавать запись `production` в GitHub Deployments. Облачный деплой остается возможным, но запускается осознанно вручную.

## CI/CD

- [ci.yml](../.github/workflows/ci.yml) проверяет проект на каждом push, pull request, ручном запуске и nightly schedule.
- [cd.yml](../.github/workflows/cd.yml) не запускается на обычный branch push в `main` или `master`.
- CD запускается только при push тега `v*` или вручную через `workflow_dispatch`.
- Render deploy hook вызывается только при ручном запуске CD с ветки `main` или `master`.
- В CD workflow не используется `environment: production`, чтобы documentation commits не создавали GitHub Deployments.

## Что важно для production

1. Задать безопасный `JWT_SECRET`.
2. Использовать managed PostgreSQL как основное хранилище.
3. Не коммитить production-данные и локальные SQLite-файлы.
4. Проверить `DATABASE_URL` и параметры подключения к БД.
5. Запускать CD вручную или через release tag, а не через каждый commit.
6. Перед деплоем убедиться, что workflow `CI` зеленый.

## Ограничение текущей среды

В локальной sandbox-сессии подготовлены конфигурация, Docker-контур, workflow и документация. Фактический внешний deploy требует доступа к GitHub, GHCR и Render.
