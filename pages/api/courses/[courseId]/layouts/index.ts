import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { getNumericId } from "../../../../../lib/util";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseId = getNumericId(req.query.courseId);
  if (!courseId) {
    return res.status(404).end();
  }

  if (req.method === "GET") {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).end();
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
    return res.status(200).json({
      layouts: layoutObjects,
    });
  }

  return res.status(404).end();
}
