import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

async function post(expectedResponse = 200) {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response.status).toBe(expectedResponse);

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);

  return responseBody;
}

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const firstPostBody = await post(201);
        expect(firstPostBody.length).toBeGreaterThan(0);
      });

      test("For the second time", async () => {
        const secondPostBody = await post();
        expect(secondPostBody.length).toBe(0);
      });
    });
  });
});
