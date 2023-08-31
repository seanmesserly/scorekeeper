import type { NextApiRequest, NextApiResponse } from "next";
import * as http from "@lib/http";
import * as queries from "@lib/queries";

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
    object !== null &&
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
        return res
          .status(http.Statuses.BadRequest)
          .json({ error: "Invalid fields" });
      }

      const { name, lat, lon, city, state } = req.body;

      try {
        if (await queries.courseExists(name, city, state)) {
          console.log(`Course ${name} already exists in ${city}, ${state}`);
          return res
            .status(http.Statuses.Conflict)
            .json({ error: "Course with same name in same location exists" });
        }
      } catch (err) {
        console.error(
          `Failed to determine if course ${name} in ${city}, ${state} existed`,
          err
        );
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Failed to determine if course existed" });
      }

      try {
        const course = await queries.createCourse(name, city, state, lat, lon);

        console.log(`Course ${name} created in ${city}, ${state}`);
        return res.status(http.Statuses.Created).json({ course });
      } catch (err) {
        console.error(
          `Failed to create course ${name} in ${city}, ${state}`,
          err
        );
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Failed to create course" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      res.status(http.Statuses.NotFound).end();
    }
  }
}
