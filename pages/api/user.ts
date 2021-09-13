import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { firstName, lastName, email } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string"
    ) {
      return res.status(400).end();
    }

    const userWithEmail = await prisma.user.findFirst({
      where: { email: email },
    });
    if (userWithEmail) {
      return res.status(409).end();
    }

    const user = await prisma.user.create({
      data: { fName: firstName, lname: lastName, email: email },
    });

    return res.status(201).json(user);
  }

  res.status(404).end();
}
