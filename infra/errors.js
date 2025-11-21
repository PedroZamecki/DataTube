export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Um erro interno interno não esperado aconteceu.", {
      cause,
    });

    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte.";
    this.statusCode = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Método não permitido para esse este endpoint.");

    this.name = "MethodNotAllowedError";
    this.action =
      "Verifique se o método HTTP enviado é válido para este endpoint.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
