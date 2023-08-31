import type { NextApiRequest, NextApiResponse } from "next";
import { passwordMatchesHash, getJWT } from "@lib/auth";
import * as http from "@lib/http";
import * as queries from "@lib/queries";

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

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case http.Methods.Post: {
      if (!isLoginBody(req.body)) {
        console.log("Failed to parse request body", req.body);
        return res.status(http.Statuses.BadRequest).json({
          error: "Invalid input",
        });
      }

      const { email, password } = req.body;

      try {
        const user = await queries.getUserAuth(email);

        if (
          !user ||
          !(await passwordMatchesHash(password, user.passwordHash))
        ) {
          console.log(`Failed to authenticate user: ${email}`);
          return res.status(http.Statuses.BadRequest).end();
        }

        console.log(`Authenticated user ${user.email}`);

        const jwt = getJWT({ id: user.id, username: user.username });

        return res.status(http.Statuses.OK).json({
          username: user.username,
          token: jwt,
        });
      } catch (err) {
        console.error("failed user login process", err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed user login process" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
