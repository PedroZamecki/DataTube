import database from "infra/database";

beforeAll(cleanDatabase);
async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function post(expectedResponse = 200) {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response.status).toBe(expectedResponse);

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);

  return responseBody;
}

test("POST to /api/v1/migrations returns 200", async () => {
  const firstPostBody = await post(201);
  expect(firstPostBody.length).toBeGreaterThan(0);

  const secondPostBody = await post();
  expect(secondPostBody.length).toBe(0);
});
