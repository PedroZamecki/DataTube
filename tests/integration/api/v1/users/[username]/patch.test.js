import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/thisdoesnotexist",
        { method: "PATCH" },
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O apelido informado não foi encontrado no sistema.",
        action: "Verifique se o apelido está digitado corretamente",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@gmail.com",
          password: "123",
        }),
      });
      expect(user1Response.status).toBe(201);

      const user1ResponseBody = await user1Response.json();
      expect(user1ResponseBody).toEqual({
        id: user1ResponseBody.id,
        username: "user1",
        email: "user1@gmail.com",
        password: user1ResponseBody.password,
        created_at: user1ResponseBody.created_at,
        updated_at: user1ResponseBody.updated_at,
      });

      expect(uuidVersion(user1ResponseBody.id)).toBe(4);
      expect(user1ResponseBody.created_at).not.toBeNaN();
      expect(user1ResponseBody.updated_at).not.toBeNaN();

      const userInDatabase1 = await user.findOneByUsername("user1");
      const correctPasswordMatch1 = await password.compare(
        "123",
        userInDatabase1.password,
      );
      expect(correctPasswordMatch1).toBe(true);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@gmail.com",
          password: "123",
        }),
      });
      expect(user2Response.status).toBe(201);

      const user2ResponseBody = await user2Response.json();
      expect(user2ResponseBody).toEqual({
        id: user2ResponseBody.id,
        username: "user2",
        email: "user2@gmail.com",
        password: user2ResponseBody.password,
        created_at: user2ResponseBody.created_at,
        updated_at: user2ResponseBody.updated_at,
      });

      expect(uuidVersion(user2ResponseBody.id)).toBe(4);
      expect(user2ResponseBody.created_at).not.toBeNaN();
      expect(user2ResponseBody.updated_at).not.toBeNaN();

      const user2InDatabase = await user.findOneByUsername("user2");
      const correctPasswordMatch2 = await password.compare(
        "123",
        user2InDatabase.password,
      );
      expect(correctPasswordMatch2).toBe(true);

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });
      expect(response.status).toBe(400);
    });

    test("With duplicated 'email'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user1@gmail.com",
        }),
      });
      expect(response.status).toBe(400);

      const response2Body = await response.json();
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Ajuste o email e tente novamente.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user3",
        }),
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "user3",
        email: "user2@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase1 = await user.findOneByUsername("user3");
      const correctPasswordMatch1 = await password.compare(
        "123",
        userInDatabase1.password,
      );
      expect(correctPasswordMatch1).toBe(true);
    });

    test("With unique 'email'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users/user3", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user3@gmail.com",
        }),
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "user3",
        email: "user3@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase1 = await user.findOneByUsername("user3");
      const correctPasswordMatch1 = await password.compare(
        "123",
        userInDatabase1.password,
      );
      expect(correctPasswordMatch1).toBe(true);
    });

    test("With new 'password'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users/user3", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "456",
        }),
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "user3",
        email: "user3@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("user3");
      const correctPasswordMatch = await password.compare(
        "456",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);
    });
  });
});
