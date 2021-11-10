import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { getNumericId } from "../../../../../lib/util";

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

interface RequestBody {
  name: string;
  holes: Array<HoleSchema>;
}

function isRequestBody(object: any): boolean {
  return (
    object.name &&
    typeof object.name === "string" &&
    object.holes &&
    object.holes instanceof Array &&
    object.holes.every((hole) => isHole(hole))
  );
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseId = getNumericId(req.query.courseId);
  if (!courseId) {
    return res.status(404).end();
  }

  if (req.method === "POST") {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).end();
    }

    if (!isRequestBody(req.body)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { name, holes } = req.body as RequestBody;

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
        id: layout.id,
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
