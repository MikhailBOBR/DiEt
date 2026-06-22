# Operations

## Run

```bash
npm install
npm start
```

## Migrate

```bash
npm run migrate
docker compose run --rm migrate
```

Web-процесс не применяет миграции при старте.

## Seed demo explicitly

```bash
npm run seed:demo
docker compose --profile demo run --rm seed-demo
```

## Create admin manually

```bash
npm run create-admin -- --email=admin@example.com --password="$ADMIN_PASSWORD" --name="Admin User"
```

## Docker

```bash
docker compose up --build
```

## Checks

```bash
npm run check:client
npm test
npm run pre-release
```
