import bcryptjs from "bcryptjs";
import { ConfigurationError } from "infra/errors.js";
import crypto from "crypto";

async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(passwordWithPepper(password), rounds);
}

async function compare(password, hash) {
  return await bcryptjs.compare(passwordWithPepper(password), hash);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV == "production" ? 14 : 1;
}

function passwordWithPepper(password) {
  if (!process.env.DATABASE_PEPPER) {
    throw new ConfigurationError({
      message:
        "Variável de ambiente 'DATABASE_PEPPER' não presente no sistema.",
    });
  }

  return crypto
    .createHmac("sha256", process.env.DATABASE_PEPPER)
    .update(password)
    .digest("hex");
}

const password = { hash, compare };

export default password;
