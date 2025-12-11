import * as cookie from "cookie";
import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors.js";
import session from "models/session.js";

const controller = {
  setSessionCookie,
  clearSessionCookie,
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error);
  }
  if (error instanceof UnauthorizedError) {
    clearSessionCookie(response);
    return response.status(error.statusCode).json(error);
  }
  const publicErrorObject = new InternalServerError({
    cause: error,
  });
  console.log(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

export default controller;
