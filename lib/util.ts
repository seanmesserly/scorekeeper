import bcrypt from "bcrypt";

export function getNumericId(param: string | string[]): number | null {
  if (param instanceof Array) {
    return null;
  }
  const id = parseInt(param);
  if (isNaN(id)) {
    return null;
  }
  return id;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  return passwordHash;
}
