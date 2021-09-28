import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";

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
