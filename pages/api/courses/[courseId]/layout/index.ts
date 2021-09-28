import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";

interface HoleSchema {
  number: number;
  par: number;
  distance: number;
}

function isHole(object: any): boolean {
  return (
    object.number &&
    typeof object.number === "number" &&
    object.par &&
    typeof object.par === "number" &&
    object.distance &&
    typeof object.distance === "number"
  );
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { courseId: courseIdParam } = req.query;
  if (courseIdParam instanceof Array) {
    return res.status(404).end();
  }
  const courseId = parseInt(courseIdParam);
  if (isNaN(courseId)) {
    return res.status(404).end();
  }

  if (req.method === "POST") {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).end();
    }

    const name = req.body.name as string;
    const holesProvided = req.body.holes;
    if (!(holesProvided instanceof Array)) {
      return res.status(400).json({ error: "holes must be an array" });
    }
    if (!holesProvided.every((hole) => isHole(hole))) {
      return res
        .status(400)
        .json({ error: "holes must be an array of type Hole" });
    }
    const holes = holesProvided as Array<HoleSchema>;

    const layout = await prisma.layout.create({
      data: {
        name: name,
        courseId: courseId,
        holes: {
          create: holes,
        },
      },
    });

    const savedHoles = await prisma.hole.findMany({
      where: { layoutId: layout.id },
    });

    return res.status(201).json({
      layout: {
        name: layout.name,
        holes: savedHoles.map((hole) => {
          return {
            par: hole.par,
            distance: hole.distance,
            number: hole.number,
          };
        }),
      },
    });
  }

  return res.status(404).end();
}
