import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { getNumericId } from "../../../../../lib/util";

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
    if (!user) {
      return res.status(404).end();
    }
    const scores = await prisma.scoreCard.findMany({
      where: { userId: user.id },
      include: {
        layout: true,
        scores: { include: { hole: true } },
      },
    });

    return res.status(200).json({
      scoreCards: scores.map((score) => {
        return {
          courseId: score.layout.courseId,
          layoutname: score.layout.name,
          datetime: score.date.toISOString(),
          scores: score.scores.map((s) => {
            return {
              number: s.hole.number,
              strokes: s.strokes,
            };
          }),
        };
      }),
    });
  }

  return res.status(404).end();
}
