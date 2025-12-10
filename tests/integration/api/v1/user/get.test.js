import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const userObject = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObject = await orchestrator.createSession(userObject.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: { Cookie: `session_id=${sessionObject.token}` },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: userObject.id,
        username: "UserWithValidSession",
        email: userObject.email,
        password: userObject.password,
        created_at: userObject.created_at.toISOString(),
        updated_at: userObject.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      // Session renew assertion
      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      // Set-Cookie assertion
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: { Cookie: "session_id=non-existent-token" },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        action: "Verifique se este usuário está logado e tente novamente.",
        message: "Usuário não possui sessão ativa.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const createdSessionObject = await orchestrator.createSession(
        createdUser.id,
      );

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: { Cookie: `session_id=${createdSessionObject.token}` },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        action: "Verifique se este usuário está logado e tente novamente.",
        message: "Usuário não possui sessão ativa.",
        status_code: 401,
      });
    });

    test("With valid but old session", async () => {
      jest.useFakeTimers({
        // 200ms before expiration.
        now: new Date() - session.EXPIRATION_IN_MILLISECONDS + 200,
      });

      const userObject = await orchestrator.createUser({
        username: "UserWithValidButOldSession",
      });

      const sessionObject = await orchestrator.createSession(userObject.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: { Cookie: `session_id=${sessionObject.token}` },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: userObject.id,
        username: "UserWithValidButOldSession",
        email: userObject.email,
        password: userObject.password,
        created_at: userObject.created_at.toISOString(),
        updated_at: userObject.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      // Session renew assertion
      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      // Set-Cookie assertion
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With valid session with half-life", async () => {
      jest.useFakeTimers({
        now: new Date() - session.EXPIRATION_IN_MILLISECONDS / 2,
      });

      const userObject = await orchestrator.createUser({
        username: "HalfLifeSession",
      });

      const sessionObject = await orchestrator.createSession(userObject.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: { Cookie: `session_id=${sessionObject.token}` },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: userObject.id,
        username: "HalfLifeSession",
        email: userObject.email,
        password: userObject.password,
        created_at: userObject.created_at.toISOString(),
        updated_at: userObject.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      // Session renew assertion
      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      // Set-Cookie assertion
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
