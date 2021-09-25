import { Layout } from ".prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    if (!req.body.name) {
      return res.status(400).json({ error: "Missing course name" });
    }

    if (!req.body.lat || !req.body.lon || !req.body.city || !req.body.state) {
      return res.status(400).json({ error: "Missing course location" });
    }

    const name = req.body.name as string;
    const lat = req.body.lat as number;
    const lon = req.body.lon as number;
    const city = req.body.lat as string;
    const state = req.body.lat as string;

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
      name: course.name,
      id: course.id,
      lat: location.lat,
      lon: location.lon,
      city: location.city,
      state: location.state,
    });
  }

  res.status(400).json({ error: "unknown" });
}
