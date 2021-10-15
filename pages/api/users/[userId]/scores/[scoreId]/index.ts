import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/prisma";
import { getNumericId } from "../../../../../../lib/util";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = getNumericId(req.query.userId);
  if (!userId) {
    return res.status(404).end();
  }

  const scoreId = getNumericId(req.query.scoreId);
  if (!scoreId) {
    return res.status(404).end();
  }

  if (req.method === "GET") {
    const scoreCard = await prisma.scoreCard.findUnique({
      where: { id: scoreId },
      include: { scores: { include: { hole: true } }, layout: true },
    });
    if (!scoreCard) {
      return res.status(404).end();
    }

    return res.status(200).json({
      scoreCard: {
        id: scoreCard.id,
        courseId: scoreCard.layout.courseId,
        layoutId: scoreCard.layoutId,
        datetime: scoreCard.date.toISOString(),
        scores: scoreCard.scores.map((score) => {
          return {
            number: score.hole.number,
            strokes: score.strokes,
          };
        }),
      },
    });
  }

  return res.status(404).end();
}
