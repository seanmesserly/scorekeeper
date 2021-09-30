import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

interface RequestBody {
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
}

function isRequestBody(object: any): boolean {
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
  if (req.method === "POST") {
    if (!isRequestBody(req.body)) {
      return res.status(400).json({ error: "Invalid fields" });
    }

    const { name, lat, lon, city, state } = req.body as RequestBody;

    const sameLocation = await prisma.location.findFirst({
      where: { city: city, state: state },
    });
    if (sameLocation) {
      const courseWithName = await prisma.course.findFirst({
        where: { name: name, location: sameLocation },
      });
      if (courseWithName) {
        return res
          .status(409)
          .json({ error: "Course with same name in same location exists" });
      }
    }

    const location = await prisma.location.create({
      data: { lat: lat, lon: lon, city: city, state: state },
    });

    const course = await prisma.course.create({
      data: { name: name, locationId: location.id },
    });

    return res.status(201).json({
      course: {
        name: course.name,
        id: course.id,
        lat: location.lat,
        lon: location.lon,
        city: location.city,
        state: location.state,
      },
    });
  }

  res.status(404).end();
}
