import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

async function get(expectedResponse = 200) {
  const response = await fetch("http://localhost:3000/api/v1/migrations");
  expect(response.status).toBe(expectedResponse);

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);

  return responseBody;
}

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const firstGetBody = await get();
      expect(firstGetBody.length).toBeGreaterThan(0);

      const secondGetBody = await get();
      expect(secondGetBody.length).toBe(firstGetBody.length);
    });
  });
});
