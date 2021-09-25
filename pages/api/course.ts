import { Layout } from ".prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

interface HoleSchema {
  number: number;
  par: number;
  distance: number;
}

interface LayoutSchema {
  name: string;
  holes: Array<HoleSchema>;
}

function isHole(object: any): boolean {
  return (
    object.number &&
    typeof object.number === "number" &&
    object.par &&
    typeof object.par === "number" &&
    object.distance &&
    typeof object.distance === "number"
  );
}

function isLayout(object: any): boolean {
  return (
    object.name &&
    typeof object.name === "string" &&
    object.holes &&
    object.holes instanceof Array &&
    object.holes.every((hole) => isHole(hole))
  );
}

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

    if (!req.body.layouts) {
      return res.status(400).json({ error: "Missing course layouts" });
    }

    if (!(req.body.layouts instanceof Array)) {
      return res.status(400).json({ error: "Layouts must be an array" });
    }

    if (!req.body.layouts.every((layout) => isLayout(layout))) {
      return res.status(400).json({ error: "Layouts schema invalid" });
    }

    const name = req.body.name as string;
    const layouts = req.body.layouts as Array<LayoutSchema>;
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

    layouts.forEach(async (layout) => {
      const createdLayout = await prisma.layout.create({
        data: { name: layout.name, courseId: course.id },
      });

      layout.holes.forEach(async (hole) => {
        await prisma.hole.create({
          data: {
            number: hole.number,
            par: hole.par,
            distance: hole.distance,
            layoutId: createdLayout.id,
          },
        });
      });
    });

    return res.status(201).json(course);
  }

  res.status(404).end();
}
