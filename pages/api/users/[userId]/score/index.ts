import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";

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

  if (req.method === "POST") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).end();
    }

    if (
      !req.body.courseId ||
      !req.body.layoutName ||
      !req.body.datetime ||
      !req.body.scores
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const courseId = parseInt(req.body.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: "courseId must be an integer" });
    }
    if (typeof req.body.layoutName !== "string") {
      return res.status(400).json({ error: "layoutName must be a string" });
    }

    const layout = await prisma.layout.findFirst({
      where: { courseId: courseId, name: req.body.layoutName },
    });
    if (!layout) {
      return res.status(400).json({ error: "Layout not found" });
    }

    if (typeof req.body.datetime !== "string") {
      return res
        .status(400)
        .json({ error: "datetime must be an ISO 8601 string" });
    }
    const date = new Date(req.body.datetime);
    if (isNaN(date.getTime()) || req.body.datetime !== date.toISOString()) {
      return res
        .status(400)
        .json({ error: "datetime must be an ISO 8601 string" });
    }

    if (!(req.body.scores instanceof Array)) {
      return res.status(400).json({ error: "scores must be an array" });
    }
    if (!req.body.scores.every((score) => isScore(score))) {
      return res
        .status(400)
        .json({ error: "scores must be an array of Score objects" });
    }

    const scores = req.body.scores as Array<ScoreSchema>;
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
        date: date,
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
        layoutName: layout.name,
        datetime: scoreCard.date.toISOString(),
        scores: scoreObjects,
      },
    });
  }

  return res.status(404).end();
}
