import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { getNumericId } from "../../../../../lib/util";
import * as http from "../../../../../lib/http";

interface HoleSchema {
  number: number;
  par: number;
  distance: number;
}

function isHole(object: unknown): object is HoleSchema {
  return (
    typeof object === "object" &&
    "number" in object &&
    typeof object.number === "number" &&
    "par" in object &&
    typeof object.par === "number" &&
    "distance" in object &&
    typeof object.distance === "number"
  );
}

interface RequestBody {
  name: string;
  holes: Array<HoleSchema>;
}

function isRequestBody(object: unknown): object is RequestBody {
  return (
    typeof object === "object" &&
    "name" in object &&
    typeof object.name === "string" &&
    "holes" in object &&
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

  switch (req.method) {
    case http.Methods.Post: {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return res.status(404).end();
      }

      if (!isRequestBody(req.body)) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const { name, holes } = req.body;

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
    default: {
      return res.status(404).end();
    }
  }
}
