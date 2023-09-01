import { passwordMatchesHash, getJWT } from "@lib/auth";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { NextRequest, NextResponse } from "next/server";
import { httpError } from "@lib/util";

interface LoginBody {
  email: string;
  password: string;
}

function isLoginBody(object: unknown): object is LoginBody {
  return (
    typeof object === "object" &&
    object !== null &&
    "email" in object &&
    typeof object.email === "string" &&
    "password" in object &&
    typeof object.password === "string"
  );
}

type ResponseType = { username: string, token: string } | { error: string }

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ResponseType>> {
  if (!isLoginBody(req.body)) {
    console.log("Failed to parse request body", req.body);
    return httpError("Invalid input", http.Statuses.BadRequest)
  }

  const { email, password } = req.body;

  try {
    const user = await queries.getUserAuth(email);

    if (
      !user ||
      !(await passwordMatchesHash(password, user.passwordHash))
    ) {
      console.log(`Failed to authenticate user: ${email}`);
      return httpError("Failed to authenticate user", http.Statuses.BadRequest)
    }

    console.log(`Authenticated user ${user.email}`);

    const jwt = getJWT({ id: user.id, username: user.username });

    return NextResponse.json({
      username: user.username,
      token: jwt,
    }, { status: http.Statuses.OK });
  } catch (err) {
    console.error("failed user login process", err);
    return httpError("failed user login process", http.Statuses.InternalServerError)
  }
}
