# Wiki: Развертывание И CI/CD

## Локальный Запуск

```bash
npm install
npm start
```

Или через Docker:

```bash
docker compose up --build
```

## Контейнерный Слой

- [docker-compose.yml](../docker-compose.yml)
- [deploy/docker/server.Dockerfile](../deploy/docker/server.Dockerfile)
- [deploy/docker/client.Dockerfile](../deploy/docker/client.Dockerfile)

## CI/CD

- CI: матрица `Node 20/22`, фронтенд-контракты, тесты, coverage, docker validation;
- CD: multi-platform image в `GHCR`, `SBOM`, `provenance`, migration compatibility и ручной Render deploy с post-deploy smoke-test.

Файлы:

- [ci.yml](../.github/workflows/ci.yml)
- [cd.yml](../.github/workflows/cd.yml)

## Облако

Для облачного запуска подготовлен [render.yaml](../render.yaml). Автоматический deploy на каждый commit отключен; миграция выполняется отдельной pre-deploy командой, а финальный deploy — вручную после зеленого CI и настройки секретов/Render-интеграции. Порядок выпуска и ограничения описаны в [deploy/runbook.md](../deploy/runbook.md).
