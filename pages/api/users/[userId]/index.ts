import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { getNumericId } from "../../../../lib/util";

interface PutBody {
  firstName: string;
  lastName: string;
  email: string;
}

function isPutBody(object: unknown): object is PutBody {
  return (
    typeof object === "object" &&
    "firstName" in object &&
    typeof object.firstName === "string" &&
    "lastName" in object &&
    typeof object.lastName === "string" &&
    "email" in object &&
    typeof object.email === "string"
  );
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = getNumericId(req.query.userId);
  if (!userId) {
    return res.status(404).end();
  }

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      return res.status(200).json(user);
    }
    return res.status(404).end();
  } else if (req.method === "PUT") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).end();
    }

    if (!isPutBody(req.body)) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const { firstName, lastName, email } = req.body;

    const userWithEmail = await prisma.user.findFirst({
      where: { email: email },
    });
    if (userWithEmail && userWithEmail.id !== user.id) {
      return res.status(409).end();
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { fName: firstName, lName: lastName, email: email },
    });
    if (updatedUser) {
      return res.status(200).json({
        user: {
          id: updatedUser.id,
          firstName: updatedUser.fName,
          lastName: updatedUser.lName,
          email: updatedUser.email,
          createDate: updatedUser.createdAt.toISOString(),
        },
      });
    }
  } else if (req.method === "DELETE") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).end();
    }

    try {
      await prisma.user.delete({ where: { id: user.id } });
      return res.status(204).end();
    } catch (err: any) {
      return res.status(409).json({ error: err });
    }
  }

  return res.status(404).end();
}
