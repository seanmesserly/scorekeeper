import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";

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
    if (!user) {
      return res.status(404).end();
    }
    const scores = await prisma.scoreCard.findMany({
      where: { userId: user.id },
      include: {
        layout: { include: { holes: true } },
        scores: { include: { hole: true } },
      },
    });

    return res.status(200).json({
      scoreCards: scores.map((score) => {
        return {
          layout: {
            name: score.layout.name,
            holes: score.layout.holes.map((hole) => {
              return {
                number: hole.number,
                distance: hole.distance,
                par: hole.par,
              };
            }),
          },
          scores: score.scores.map((s) => {}),
        };
      }),
    });
  }

  return res.status(404).end();
}
