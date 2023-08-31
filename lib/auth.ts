import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  return passwordHash;
}

export async function passwordMatchesHash(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export interface TokenBody {
  id: number;
  username: string;
}
export function getJWT(body: TokenBody): string {
  return jwt.sign(body, process.env.JWT_SECRET as string);
}
