import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

interface RequestBody {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

function isRequestBody(object: any): boolean {
  return (
    object.firstName &&
    typeof object.firstName === "string" &&
    object.lastName &&
    typeof object.lastName === "string" &&
    object.email &&
    typeof object.email === "string" &&
    object.username &&
    typeof object.username === "string" &&
    object.password &&
    typeof object.password === "string"
  );
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    if (!isRequestBody(req.body)) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const { firstName, lastName, email, username, password } =
      req.body as RequestBody;

    const userWithEmail = await prisma.user.findFirst({
      where: { email: email },
    });
    if (userWithEmail) {
      return res.status(409).end();
    }

    const user = await prisma.user.create({
      data: { fName: firstName, lName: lastName, email: email },
    });

    return res.status(201).json(user);
  }

  res.status(404).end();
}
