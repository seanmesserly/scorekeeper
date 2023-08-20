import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import * as http from "../../../lib/http";

interface RequestBody {
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
}

function isRequestBody(object: unknown): object is RequestBody {
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
  switch (req.method) {
    case http.Methods.Get: {
      if (!isRequestBody(req.body)) {
        return res.status(400).json({ error: "Invalid fields" });
      }

      const { name, lat, lon, city, state } = req.body;

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
    default: {
      res.status(404).end();
    }
  }
}
