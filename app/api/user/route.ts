import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@lib/auth";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { User } from "@lib/types";
import { httpError } from "@lib/util";
import { z } from "zod";

const requestBodySchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.string().email().nonempty(),
  username: z.string().nonempty(),
  password: z.string().nonempty(),
})

type RequestBody = z.infer<typeof requestBodySchema>

function isRequestBody(object: unknown): object is RequestBody {
  return requestBodySchema.safeParse(object).success
}

type ResponseType = { user: User } | { error: string }

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ResponseType>> {
  if (!isRequestBody(req.body)) {
    console.log("Failed to parse request body", req.body);
    return httpError("Invalid input", http.Statuses.BadRequest)
  }

  const { firstName, lastName, email, username, password } = req.body;

  // ENsure that username and email are not duplicates
  try {
    if (await queries.userWithUsernameExists(username)) {
      console.log(`User with username ${username} already exists`);
      return httpError("username already in use", http.Statuses.Conflict)
    }
  } catch (err) {
    console.error(
      `Failed to search for user with username ${username}`,
      err
    );
    return httpError("failed to check for unique username", http.Statuses.InternalServerError)
  }

  try {
    if (await queries.userWithEmailExists(email)) {
      console.log(`User with email ${email} already exists`);
      return httpError("email already in use", http.Statuses.Conflict)
    }
  } catch (err) {
    console.error(`Failed to search for user with email ${email}`, err);
    return httpError("failed to check for unique email", http.Statuses.InternalServerError)
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
    return NextResponse.json({ user }, { status: http.Statuses.Created })
  } catch (err) {
    console.error(`Failed to create user ${username}`, err);
    return httpError("failed to create user", http.Statuses.InternalServerError)
  }
}
