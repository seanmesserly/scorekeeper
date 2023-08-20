import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/prisma";
import { getNumericId } from "../../../../../../lib/util";
import * as http from "../../../../../../lib/http";

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

interface PutBody {
  name: string;
  holes: Array<HoleSchema>;
}

function isPutBody(object: unknown): object is PutBody {
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
    return res.status(http.Statuses.NotFound).end();
  }
  const layoutId = getNumericId(req.query.layoutId);
  if (!layoutId) {
    return res.status(http.Statuses.NotFound).end();
  }

  switch (req.method) {
    case http.Methods.Get: {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return res.status(http.Statuses.NotFound).end();
      }
      const layout = await prisma.layout.findUnique({
        where: { id: layoutId },
        include: { holes: true },
      });
      if (!layout) {
        return res.status(http.Statuses.NotFound).end();
      }

      return res.status(http.Statuses.OK).json({
        layout: {
          id: layout.id,
          name: layout.name,
          holes: layout.holes.map((hole) => {
            return {
              number: hole.number,
              par: hole.par,
              distance: hole.distance,
            };
          }),
        },
      });
    }
    case http.Methods.Put: {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return res.status(http.Statuses.NotFound).end();
      }
      const layout = await prisma.layout.findUnique({
        where: { id: layoutId },
        include: { holes: true },
      });
      if (!layout) {
        return res.status(http.Statuses.NotFound).end();
      }

      if (!isPutBody(req.body)) {
        return res
          .status(http.Statuses.BadRequest)
          .json({ error: "Invalid input" });
      }

      const { name, holes } = req.body;

      const updatedLayout = await prisma.layout.update({
        where: { id: layout.id },
        data: {
          name: name,
          holes: {
            create: holes,
          },
        },
      });

      const savedHoles = await prisma.hole.findMany({
        where: { layoutId: layout.id },
      });

      return res.status(http.Statuses.OK).json({
        layout: {
          id: updatedLayout.id,
          name: updatedLayout.name,
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
    case http.Methods.Delete: {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return res.status(http.Statuses.NotFound).end();
      }
      const layout = await prisma.layout.findUnique({
        where: { id: layoutId },
        include: { holes: true },
      });
      if (!layout) {
        return res.status(http.Statuses.NotFound).end();
      }

      await prisma.layout.delete({ where: { id: layout.id } });

      return res.status(http.Statuses.NoContent).end();
    }
    default: {
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
