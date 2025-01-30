test("GET to /api/v1/status returns 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.updated_at).toBeDefined();

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toBe(parsedUpdatedAt);

  const dependencies = responseBody?.dependencies;
  const database = dependencies?.database;

  expect(database.version).toBe("17.2");
  expect(database.max_connections).toBe(100);
  expect(database.opened_connections).toBe(1);
});
