import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator.js";

const router = createRouter();
router.get(getMethod);
router.post(postMethod);

export default router.handler(controller.errorHandlers);

async function getMethod(request, response) {
  try {
    const pendingMigrations = await migrator.listPendingMigrations();
    response.status(200).json(pendingMigrations);
  } catch (error) {
    console.error(error);
    response.status(error?.statusCode || 500);
  }
}

async function postMethod(request, response) {
  try {
    const migratedMigrations = await migrator.runPendingMigrations();
    response
      .status(migratedMigrations.length > 0 ? 201 : 200)
      .json(migratedMigrations);
  } catch (error) {
    console.error(error);
    response.status(error?.statusCode || 500);
  }
}
