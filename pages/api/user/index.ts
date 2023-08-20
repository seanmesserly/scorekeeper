import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { hashPassword } from "../../../lib/auth";

interface RequestBody {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

function isRequestBody(object: unknown): object is RequestBody {
  return (
    typeof object === "object" &&
    "firstName" in object &&
    typeof object.firstName === "string" &&
    "lastName" in object &&
    typeof object.lastName === "string" &&
    "email" in object &&
    typeof object.email === "string" &&
    "username" in object &&
    typeof object.username === "string" &&
    "password" in object &&
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
    const { firstName, lastName, email, username, password } = req.body;

    const userWithEmail = await prisma.user.findFirst({
      where: { email: email },
    });

    const userWithUsername = await prisma.user.findFirst({
      where: { username: username },
    });
    if (userWithEmail || userWithUsername) {
      return res.status(409).end();
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fName: firstName,
        lName: lastName,
        email: email,
        username: username,
        passwordHash: passwordHash,
      },
    });

    return res.status(201).json(user);
  }

  res.status(404).end();
}
