import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
  describe("Default user", () => {
    test("With nonexistent session", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: "session-id=nonexistent-session",
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: "Verifique se este usuário está logado e tente novamente.",
        message: "Usuário não possui sessão ativa.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const userObject = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(userObject.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session-id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: "Verifique se este usuário está logado e tente novamente.",
        message: "Usuário não possui sessão ativa.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });

    test("With valid session", async () => {
      const userObject = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(userObject.id);

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: sessionObject.id,
        token: sessionObject.token,
        user_id: sessionObject.user_id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.expires_at).not.toBeNaN();
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();

      // Session invalidation assertion
      expect(
        responseBody.expires_at < sessionObject.expires_at.toISOString(),
      ).toEqual(true);
      expect(
        responseBody.updated_at > sessionObject.updated_at.toISOString(),
      ).toEqual(true);

      // Set-Cookie assertion
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });

      // Double assertion
      const secondResponse = await fetch(
        "http://localhost:3000/api/v1/sessions",
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(secondResponse.status).toBe(401);

      const secondResponseBody = await secondResponse.json();
      expect(secondResponseBody).toEqual({
        action: "Verifique se este usuário está logado e tente novamente.",
        message: "Usuário não possui sessão ativa.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });
  });
});
