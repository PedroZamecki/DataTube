import retry from "async-retry";

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

    async function fetchStatusPage(bail, tryNumber) {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (!response.ok) throw Error(`HTTP error ${response.status}`);
      await response.json();
    }
  }
}

export default { waitForAllServices };
