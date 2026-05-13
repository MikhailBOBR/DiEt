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
- CD: multi-platform image в `GHCR`, `SBOM`, `provenance`, optional Render deploy hook по тегу `v*` или ручному запуску.

Файлы:

- [ci.yml](../.github/workflows/ci.yml)
- [cd.yml](../.github/workflows/cd.yml)

## Облако

Для облачного запуска подготовлен [render.yaml](../render.yaml). Автоматический deploy на каждый commit отключен; финальный deploy выполняется вручную после зеленого CI и настройки секретов/Render-интеграции.
