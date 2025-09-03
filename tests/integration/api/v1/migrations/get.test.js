import database from "infra/database";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public");
});

async function get(expectedResponse = 200) {
  const response = await fetch("http://localhost:3000/api/v1/migrations");
  expect(response.status).toBe(expectedResponse);

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);

  return responseBody;
}

test("GET to /api/v1/migrations returns 200", async () => {
  const firstGetBody = await get();
  expect(firstGetBody.length).toBeGreaterThan(0);

  const secondGetBody = await get();
  expect(secondGetBody.length).toBe(firstGetBody.length);
});
