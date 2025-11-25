import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";

const migrationConfig = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  migrationsTable: "pgmigrations",
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
