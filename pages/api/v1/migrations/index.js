import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import database from "infra/database";
import { resolve } from "node:path";
import controller from "infra/controller";

const router = createRouter();
router.get(getMethod);
router.post(postMethod);

export default router.handler(controller.errorHandlers);

async function getSafeDbClient() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
  } catch (e) {
    dbClient?.end();
    throw e;
  }

  return dbClient;
}

async function getMethod(request, response) {
  const dbClient = await getSafeDbClient();

  const migrationConfig = {
    dbClient,
    dryRun: true,
    dir: resolve("infra", "migrations"),
    direction: "up",
    migrationsTable: "pgmigrations",
  };

  const pendingMigrations = await migrationRunner(migrationConfig);
  response.status(200).json(pendingMigrations);
  dbClient?.end();
}

async function postMethod(request, response) {
  const dbClient = await getSafeDbClient();

  const migrationConfig = {
    dbClient,
    dir: resolve("infra", "migrations"),
    direction: "up",
    migrationsTable: "pgmigrations",
  };

  const migratedMigrations = await migrationRunner(migrationConfig);
  response
    .status(migratedMigrations.length > 0 ? 201 : 200)
    .json(migratedMigrations);
  dbClient?.end();
}
