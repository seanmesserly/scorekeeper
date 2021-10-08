import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const courses = await prisma.course.findMany({});
    const courseObjects = await Promise.all(
      courses.map(async (course) => {
        const location = await prisma.location.findUnique({
          where: { id: course.locationId },
        });
        return {
          id: course.id,
          name: course.name,
          lat: location.lat,
          lon: location.lon,
          state: location.state,
          city: location.city,
        };
      })
    );
    return res.status(200).json({
      courses: courseObjects,
    });
  }

  return res.status(404).end();
}
