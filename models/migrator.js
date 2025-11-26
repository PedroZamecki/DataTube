import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { ServiceError } from "infra/errors.js";

const migrationConfig = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  migrationsTable: "pgmigrations",
  log: () => {},
};

async function getMigrationsList(options = {}) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const migrations = await migrationRunner({
      ...migrationConfig,
      dbClient,
      ...options,
    });
    return migrations;
  } catch (error) {
    console.error(error);
    const publicServiceError = new ServiceError({
      message: "Serviço de migração indisponível no momento.",
      cause: error,
    });
    throw publicServiceError;
  } finally {
    dbClient?.end();
  }
}

async function listPendingMigrations() {
  return await getMigrationsList({ dryRun: true });
}

async function runPendingMigrations() {
  return await getMigrationsList();
}

const migrator = {
  runPendingMigrations,
  listPendingMigrations,
};

export default migrator;
