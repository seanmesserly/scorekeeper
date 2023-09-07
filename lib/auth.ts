// "use server"

import { cookies } from 'next/headers'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as queries from "@lib/queries"
import { CookieKeys } from "./types";
import { z } from 'zod';
import { redirect } from 'next/navigation';

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
    console.log("Auth cookie not found")
    return null
  }

  try {
    const parsed = authCookieSchema.safeParse(JSON.parse(cookie.value))
    if (!parsed.success) {
      console.log("Auth cookie wrong format", cookie)
      return null
    }
    return parsed.data
  } catch (err) {
    console.log("Failed to parse json", err)
    return null
  }
}

export const getUserCookie = (): UserCookie | null => {
  const cookie = cookies().get(CookieKeys.User)
  if (!cookie) {
    console.log("User cookie not found")
    return null
  }

  try {
    const parsed = userCookieSchema.safeParse(JSON.parse(cookie.value))
    if (!parsed.success) {
      console.log("User cookie wrong format", cookie)
      return null
    }
    return parsed.data
  } catch (err) {
    console.log("Failed to parse json", err)
    return null
  }
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

export const registerSchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.string().email().nonempty(),
  username: z.string().nonempty(),
  password: z.string().nonempty()
})

type RegisterSchema = z.infer<typeof registerSchema>

export async function registerUser(data: RegisterSchema): Promise<{ error: string } | null> {
  "use server"

  const { firstName, lastName, email, username, password } = data

  // Ensure that username and email are not duplicates
  try {
    if (await queries.userWithUsernameExists(username)) {
      console.log(`User with username ${username} already exists`);
      return { error: "Username taken" }
    }
  } catch (err) {
    console.error(
      `Failed to search for user with username ${username}`,
      err
    );
    return { error: "Failed to determine if username is unique" }
  }

  try {
    if (await queries.userWithEmailExists(email)) {
      console.log(`User with email ${email} already exists`);
      return { error: "Email already registered" }
    }
  } catch (err) {
    console.error(`Failed to search for user with email ${email}`, err);
    return { error: "Failed to determine if email is registered" }
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

    const jwt = getJWT({ id: user.id, username: user.username })

    setAuthCookie({ userID: user.id, token: jwt })
    setUserCookie({ userID: user.id })
    return null
  } catch (err) {
    console.error(`Failed to create user ${username}`, err);
    return { error: "Failed to register user" }
  }
}

export async function logout() {
  "use server"

  console.log("Deleting cookies")

  cookies().delete(CookieKeys.Auth)
  cookies().delete(CookieKeys.User)

  redirect("/login")
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
