import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { getNumericId } from "../../../../../lib/util";
import * as http from "../../../../../lib/http";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseId = getNumericId(req.query.courseId);
  if (!courseId) {
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
      const layouts = await prisma.layout.findMany({
        where: { courseId: courseId },
      });

      const layoutObjects = await Promise.all(
        layouts.map(async (layout) => {
          const holes = await prisma.hole.findMany({
            where: { layoutId: layout.id },
          });
          return {
            id: layout.id,
            name: layout.name,
            holes: holes.map((hole) => {
              return {
                number: hole.number,
                par: hole.par,
                distance: hole.distance,
              };
            }),
          };
        })
      );
      return res.status(http.Statuses.OK).json({
        layouts: layoutObjects,
      });
    }
    default: {
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
