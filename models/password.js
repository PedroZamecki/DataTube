import bcryptjs from "bcryptjs";

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
  return password + process.env.DATABASE_PEPPER;
}

const password = { hash, compare };

export default password;
