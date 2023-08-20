import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { getNumericId } from "../../../../../lib/util";
import * as http from "../../../../../lib/http";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = getNumericId(req.query.userId);
  if (!userId) {
    return res.status(http.Statuses.NotFound).end();
  }

  switch (req.method) {
    case http.Methods.Get: {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(http.Statuses.NotFound).end();
      }
      const scores = await prisma.scoreCard.findMany({
        where: { userId: user.id },
        include: {
          layout: true,
          scores: { include: { hole: true } },
        },
      });

      return res.status(http.Statuses.OK).json({
        scoreCards: scores.map((score) => {
          return {
            courseId: score.layout.courseId,
            layoutId: score.layout.id,
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
    default: {
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
