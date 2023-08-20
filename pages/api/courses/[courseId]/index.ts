import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { getNumericId } from "../../../../lib/util";
import * as http from "../../../../lib/http";

interface PutBody {
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
}

function isPutBody(object: unknown): object is PutBody {
  return (
    typeof object === "object" &&
    "name" in object &&
    typeof object.name === "string" &&
    "lat" in object &&
    typeof object.lat === "number" &&
    "lon" in object &&
    typeof object.lon === "number" &&
    "city" in object &&
    typeof object.city === "string" &&
    "state" in object &&
    typeof object.state === "string"
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

  switch (req.method) {
    case http.Methods.Get: {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (course) {
        const location = await prisma.location.findUnique({
          where: { id: course.locationId },
        });
        return res.status(http.Statuses.OK).json({
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
      return res.status(http.Statuses.NotFound).end();
    }
    case http.Methods.Put: {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return res.status(http.Statuses.NotFound).end();
      }

      if (!isPutBody(req.body)) {
        return res
          .status(http.Statuses.BadRequest)
          .json({ error: "Invalid input" });
      }
      const { name, lat, lon, city, state } = req.body;

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
        return res.status(http.Statuses.OK).json({
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
    }
    case http.Methods.Delete: {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return res.status(http.Statuses.NotFound).end();
      }

      try {
        await prisma.course.delete({ where: { id: course.id } });
        return res.status(http.Statuses.NoContent).end();
      } catch (err: any) {
        return res.status(http.Statuses.Conflict).json({ error: err });
      }
    }
    default: {
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
