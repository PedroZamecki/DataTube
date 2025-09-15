import migrationRunner from "node-pg-migrate";
import database from "infra/database";
import { resolve } from "node:path";

export default async function migrations(request, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const defaultMigrationConfig = {
      dbClient,
      dryRun: true,
      dir: resolve("infra", "migrations"),
      direction: "up",
      migrationsTable: "pgmigrations",
    };

    // GET Method
    if (request.method == "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationConfig);
      response.status(200).json(pendingMigrations);
    }
    // POST Method
    else if (request.method == "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationConfig,
        dryRun: false,
      });
      response
        .status(migratedMigrations.length > 0 ? 201 : 200)
        .json(migratedMigrations);
    }
    // Methods not implemented
    else {
      response.status(405).end();
    }
  } catch {
    response.status(502).end();
  } finally {
    await dbClient.end();
  }
}
