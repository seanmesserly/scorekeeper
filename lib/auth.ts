// "use server"

import { cookies } from 'next/headers'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as queries from "@lib/queries"
import { CookieKeys, User } from "./types";
import { z } from 'zod';

export type LoginResponse = { error: string } | null

const authCookieSchema = z.object({
  userID: z.number(),
  token: z.string().nonempty()
})

type AuthCookie = z.infer<typeof authCookieSchema>

const userCookieSchema = z.object({
  userID: z.number()
})

type UserCookie = z.infer<typeof userCookieSchema>


const setAuthCookie = (data: AuthCookie): void => {
  cookies().set(CookieKeys.Auth, JSON.stringify(data), { httpOnly: true, secure: process.env.NODE_ENV === "production" })
}

export const getAuthCookie = (): AuthCookie | null => {
  const cookie = cookies().get(CookieKeys.Auth)
  if (!cookie) {
    return null
  }

  const parsed = authCookieSchema.safeParse(cookie.value)
  if (!parsed.success) {
    return null
  }
  return parsed.data
}

export const getUserCookie = (): UserCookie | null => {
  const cookie = cookies().get(CookieKeys.User)
  if (!cookie) {
    console.log("User cookie not found")
    return null
  }

  const parsed = userCookieSchema.safeParse(JSON.parse(cookie.value))
  console.log("User cookie wrong format", cookie)
  if (!parsed.success) {
    return null
  }
  return parsed.data
}

const setUserCookie = (data: UserCookie): void => {
  cookies().set(CookieKeys.User, JSON.stringify(data), { httpOnly: false, secure: process.env.NODE_ENV === "production" })
}

export const loginSchema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().nonempty()
})

type LoginSchema = z.infer<typeof loginSchema>

export async function login(data: LoginSchema): Promise<LoginResponse> {
  "use server"
  const { email, password } = data

  try {
    const user = await queries.getUserAuth(email);

    if (
      !user ||
      !(await passwordMatchesHash(password, user.passwordHash))
    ) {
      console.log(`Failed to authenticate user: ${email}`);
      return { error: "Failed to authenticate user" }
    }

    console.log(`Authenticated user ${user.email}`);

    const jwt = getJWT({ id: user.id, username: user.username });
    setAuthCookie({ userID: user.id, token: jwt })
    setUserCookie({ userID: user.id })

    return null
  } catch (err) {
    console.error("failed user login process", err);
    return { error: "User login process failed" }
  }
}

export async function registerUser(firstName: string, lastName: string, email: string, username: string, password: string): Promise<User | null> {
  "use server"

  // Ensure that username and email are not duplicates
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

async function passwordMatchesHash(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

interface TokenBody {
  id: number;
  username: string;
}
function getJWT(body: TokenBody): string {
  return jwt.sign(body, process.env.JWT_SECRET as string);
}
