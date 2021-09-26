import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

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
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (course) {
      const location = await prisma.location.findUnique({
        where: { id: course.locationId },
      });
      return res.status(200).json({
        course: {
          id: course.id,
          name: course.name,
          lat: location.lat,
          lon: location.lon,
          state: location.state,
          city: location.city,
        },
      });
    }
    return res.status(404).end();
  }

  return res.status(404).end();
}
