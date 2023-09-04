import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as queries from "@lib/queries"
import { User } from "./types";

export type LoginResponse = { username: string, token: string } | null

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const user = await queries.getUserAuth(email);

    if (
      !user ||
      !(await passwordMatchesHash(password, user.passwordHash))
    ) {
      console.log(`Failed to authenticate user: ${email}`);
      return null
    }

    console.log(`Authenticated user ${user.email}`);

    const jwt = getJWT({ id: user.id, username: user.username });

    return {
      username: user.username,
      token: jwt,
    }
  } catch (err) {
    console.error("failed user login process", err);
    return null
  }
}

export async function registerUser(firstName: string, lastName: string, email: string, username: string, password: string): Promise<User | null> {
  // ENsure that username and email are not duplicates
  try {
    if (await queries.userWithUsernameExists(username)) {
      console.log(`User with username ${username} already exists`);
      return null
    }
  } catch (err) {
    console.error(
      `Failed to search for user with username ${username}`,
      err
    );
    return null
  }

  try {
    if (await queries.userWithEmailExists(email)) {
      console.log(`User with email ${email} already exists`);
      return null
    }
  } catch (err) {
    console.error(`Failed to search for user with email ${email}`, err);
    return null
  }

  // register user
  try {
    const passwordHash = await hashPassword(password);

    const user = await queries.createUser(
      username,
      email,
      firstName,
      lastName,
      passwordHash
    );

    console.log(`Created user ${username}`);
    return user
  } catch (err) {
    console.error(`Failed to create user ${username}`, err);
    return null
  }
}

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
