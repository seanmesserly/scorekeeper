import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { passwordMatchesHash, getJWT } from "../../../lib/auth";
import * as http from "../../../lib/http";

interface LoginBody {
  email: string;
  password: string;
}

function isLoginBody(object: unknown): object is LoginBody {
  return (
    typeof object === "object" &&
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
        return res.status(http.Statuses.BadRequest).json({
          error: "Invalid input",
        });
      }

      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email: email } });
      if (!user || !(await passwordMatchesHash(password, user.passwordHash))) {
        console.log(`Failed to authenticate user: ${email}`);
        return res.status(http.Statuses.BadRequest).end();
      }
      console.log(`Authenticated user ${user.email}`);

      const jwt = getJWT({ id: user.id, username: user.username });

      return res.status(http.Statuses.OK).json({
        username: user.username,
        token: jwt,
      });
    }
    default: {
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
