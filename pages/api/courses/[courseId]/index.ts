import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

interface PutBody {
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
}

function isPutBody(object: any): boolean {
  return (
    object.name &&
    typeof object.name === "string" &&
    object.lat &&
    typeof object.lat === "number" &&
    object.lon &&
    typeof object.lon === "number" &&
    object.city &&
    typeof object.city === "string" &&
    object.state &&
    typeof object.state === "string"
  );
}

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
  } else if (req.method === "PUT") {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).end();
    }

    if (!isPutBody(req.body)) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const { name, lat, lon, city, state } = req.body as PutBody;

    const sameLocation = await prisma.location.findFirst({
      where: { city: city, state: state },
    });
    if (sameLocation) {
      const courseWithName = await prisma.course.findFirst({
        where: { name: name, location: sameLocation },
      });
      if (courseWithName && courseWithName.id !== course.id) {
        return res
          .status(409)
          .json({ error: "Course with same name in same location exists" });
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id: course.id },
      include: { location: true },
      data: {
        name,
        location: {
          update: {
            id: course.locationId,
            lat,
            lon,
            city,
            state,
          },
        },
      },
    });
    if (updatedCourse) {
      return res.status(200).json({
        user: {
          id: updatedCourse.id,
          name: updatedCourse.name,
          lat: updatedCourse.location.lat,
          lon: updatedCourse.location.lon,
          city: updatedCourse.location.city,
          state: updatedCourse.location.state,
        },
      });
    }
  } else if (req.method === "DELETE") {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).end();
    }

    try {
      await prisma.course.delete({ where: { id: course.id } });
      return res.status(204).end();
    } catch (err: any) {
      return res.status(409).json({ error: err });
    }
  }
  return res.status(404).end();
}
