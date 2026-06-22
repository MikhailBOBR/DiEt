const {
  adminUser,
  appEnv,
  dbProvider,
  getConfig,
  host,
  port,
  releaseVersion
} = require("./config/env");
const { createApp } = require("./app");
const { closeDatabase } = require("./db/connection");
const { ensureAdminUser } = require("./db/admin-user");
const { initializeDatabase, runMigrations } = require("./db/init-schema");
const { logger } = require("./lib/logger");
const { createHttpServer } = require("./index");

function summarizeRuntimeConfig() {
  const config = getConfig();

  return {
    environment: config.appEnv,
    release: config.releaseVersion,
    service: config.serviceName,
    host: config.host,
    port: config.port,
    dbProvider: config.dbProvider,
    dbPoolMax: config.dbProvider === "postgres" ? config.dbPoolMax : undefined,
    logLevel: config.logLevel,
    trustProxy: config.trustProxy,
    shutdownTimeoutMs: config.shutdownTimeoutMs
  };
}

function installProcessFailureHandlers(server) {
  let handled = false;

  function fail(event, error) {
    if (handled) {
      return;
    }

    handled = true;
    logger.error("runtime.process.failed", { event, error });

    Promise.resolve(server.shutdown ? server.shutdown(event) : closeDatabase()).finally(() => {
      process.exit(1);
    });
  }

  process.on("uncaughtException", (error) => {
    fail("uncaughtException", error);
  });

  process.on("unhandledRejection", (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    fail("unhandledRejection", error);
  });
}

function parseCliArgs(argv = process.argv.slice(2)) {
  const [command = "server", ...rest] = argv;
  const options = {};

  rest.forEach((item) => {
    if (!item.startsWith("--")) {
      return;
    }

    const [rawKey, rawValue] = item.slice(2).split("=");
    const key = rawKey.trim();

    if (!key) {
      return;
    }

    options[key] = rawValue === undefined ? true : rawValue;
  });

  return {
    command,
    options
  };
}

async function runServerCommand() {
  const app = createApp();
  const server = createHttpServer(app);
  installProcessFailureHandlers(server);

  return server;
}

async function runSeedDemoCommand() {
  await initializeDatabase({ withSeedData: true });
  const summary = { provider: dbProvider, seeded: true };
  logger.info("database.seed-demo.completed", summary);
  await closeDatabase();
  return summary;
}

async function runSeedLargeCommand() {
  const { seedLargeData } = require("./db/seed-large-data");
  const summary = await seedLargeData();
  logger.info("database.seed-large.completed", summary);
  await closeDatabase();
  return summary;
}

async function runMigrateCommand() {
  const summary = await runMigrations();
  logger.info("database.migrate.completed", summary);
  await closeDatabase();
  return summary;
}

async function runCreateAdminCommand(options) {
  const email = String(options.email || adminUser.email).trim();
  const password = String(options.password || adminUser.password);
  const name = String(options.name || adminUser.name).trim();

  if (!email || !name || password.length < 8) {
    throw new Error("create-admin requires email, name and a password of at least 8 characters");
  }

  await runMigrations();

  const result = await ensureAdminUser({
    email,
    password,
    name
  });

  logger.info("admin-user.provisioned", {
    created: result.created,
    email: result.user.email
  });

  await closeDatabase();
  return result;
}

async function runConfigCommand() {
  const summary = summarizeRuntimeConfig();
  logger.info("runtime.config", summary);
  await closeDatabase();
  return summary;
}

async function runCommand(argv = process.argv.slice(2)) {
  const { command, options } = parseCliArgs(argv);

  if (command === "server") {
    logger.info("runtime.boot", {
      mode: "server",
      environment: appEnv,
      dbProvider,
      host,
      port,
      release: releaseVersion
    });
    return runServerCommand();
  }

  if (command === "migrate") {
    return runMigrateCommand();
  }

  if (command === "seed-large") {
    return runSeedLargeCommand();
  }

  if (command === "seed-demo") {
    return runSeedDemoCommand();
  }

  if (command === "create-admin") {
    return runCreateAdminCommand(options);
  }

  if (command === "config") {
    return runConfigCommand();
  }

  throw new Error(`Unknown command: ${command}`);
}

if (require.main === module) {
  runCommand().catch((error) => {
    logger.error("cli.command.failed", { error });
    closeDatabase().finally(() => {
      process.exitCode = 1;
    });
  });
}

module.exports = {
  installProcessFailureHandlers,
  parseCliArgs,
  runCommand,
  runSeedDemoCommand,
  runSeedLargeCommand,
  summarizeRuntimeConfig
};
