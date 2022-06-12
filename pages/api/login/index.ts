import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { passwordMatchesHash, getJWT } from "../../../lib/auth";

interface LoginBody {
  email: string;
  password: string;
}

function isLoginBody(obj: any): boolean {
  return (
    obj.email &&
    typeof obj.email === "string" &&
    obj.password &&
    typeof obj.password === "string"
  );
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    if (!isLoginBody(req.body)) {
      return res.status(400).json({
        error: "Invalid input",
      });
    }

    const { email, password } = req.body as LoginBody;

    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user || !(await passwordMatchesHash(password, user.passwordHash))) {
      console.log(`Failed to authenticate user: ${email}`);
      return res.status(400).end();
    }
    console.log(`Authenticated user ${user.email}`);

    const jwt = getJWT({ id: user.id, username: user.username });

    return res.status(200).json({
      username: user.username,
      token: jwt,
    });
  } else {
    res.status(404).end();
  }
}
