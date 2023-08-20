import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import * as http from "../../../lib/http";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case http.Methods.Get: {
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
    default: {
      return res.status(404).end();
    }
  }
}
