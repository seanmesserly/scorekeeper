import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId: userIdParam } = req.query;
  if (userIdParam instanceof Array) {
    return res.status(404).end();
  }
  const userId = parseInt(userIdParam);
  if (isNaN(userId)) {
    return res.status(404).end();
  }

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      return res.status(200).json(user);
    }
    return res.status(404).end();
  }

  return res.status(404).end();
}
