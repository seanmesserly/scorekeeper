import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/prisma";
import { getNumericId } from "../../../../../../lib/util";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseId = getNumericId(req.query.courseId);
  if (!courseId) {
    return res.status(404).end();
  }
  const layoutId = getNumericId(req.query.layoutId);
  if (!layoutId) {
    return res.status(404).end();
  }

  if (req.method === "GET") {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).end();
    }
    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      include: { holes: true },
    });
    if (!layout) {
      return res.status(404).end();
    }

    return res.status(200).json({
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

  return res.status(404).end();
}
