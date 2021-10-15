import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { getNumericId } from "../../../../../lib/util";

interface ScoreSchema {
  number: number;
  strokes: number;
}

function isScore(object: any): boolean {
  return (
    object.number &&
    typeof object.number === "number" &&
    object.strokes &&
    typeof object.strokes === "number"
  );
}

interface RequestBody {
  courseId: number;
  layoutId: number;
  datetime: string;
  scores: Array<ScoreSchema>;
}

function isRequestBody(object: any): boolean {
  if (
    !object.courseId ||
    typeof object.courseId !== "number" ||
    !object.layoutId ||
    typeof object.layoutId !== "number" ||
    !object.datetime ||
    typeof object.datetime !== "string" ||
    !(object.scores instanceof Array) ||
    !object.scores.every((score) => isScore(score))
  ) {
    return false;
  }
  const date = new Date(object.datetime);
  if (isNaN(date.getTime()) || object.datetime !== date.toISOString()) {
    return false;
  }

  return true;
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = getNumericId(req.query.userId);
  if (!userId) {
    return res.status(404).end();
  }

  if (req.method === "POST") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).end();
    }

    if (!isRequestBody(req.body)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { courseId, layoutId, datetime, scores } = req.body as RequestBody;

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
    });
    if (!layout) {
      return res.status(400).json({ error: "Layout not found" });
    }

    const scoreObjects = await Promise.all(
      scores.map(async (score) => {
        // TODO: we are assuming this returns a value
        const hole = await prisma.hole.findFirst({
          where: { layoutId: layout.id, number: score.number },
        });
        return {
          holeId: hole.id,
          strokes: score.strokes,
        };
      })
    );

    const scoreCard = await prisma.scoreCard.create({
      data: {
        date: new Date(datetime),
        layoutId: layout.id,
        userId: user.id,
        scores: {
          create: scoreObjects,
        },
      },
    });

    return res.status(201).json({
      scoreCard: {
        courseId: layout.courseId,
        layoutId: layout.id,
        datetime: scoreCard.date.toISOString(),
        scores: scoreObjects,
      },
    });
  }

  return res.status(404).end();
}
