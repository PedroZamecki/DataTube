import retry from "async-retry";
import Database from "infra/database";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (error, attempt) =>
        console.log(
          `Attempt ${attempt} - Could not fetch status page: ${error.message}`,
        ),
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (!response.ok) throw Error(`HTTP error ${response.status}`);
      await response.json();
    }
  }
}

async function clearDatabase() {
  await Database.query("drop schema public cascade; create schema public");
}

const Orchestrator = { waitForAllServices, clearDatabase };

export default Orchestrator;
