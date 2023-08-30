import type { NextApiRequest, NextApiResponse } from "next";
import { getNumericId } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";

interface HoleSchema {
  number: number;
  par: number;
  distance: number;
}

function isHole(object: unknown): object is HoleSchema {
  return (
    typeof object === "object" &&
    "number" in object &&
    typeof object.number === "number" &&
    "par" in object &&
    typeof object.par === "number" &&
    "distance" in object &&
    typeof object.distance === "number"
  );
}

interface RequestBody {
  name: string;
  holes: Array<HoleSchema>;
}

function isRequestBody(object: unknown): object is RequestBody {
  return (
    typeof object === "object" &&
    "name" in object &&
    typeof object.name === "string" &&
    "holes" in object &&
    object.holes instanceof Array &&
    object.holes.every((hole) => isHole(hole))
  );
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseId = getNumericId(req.query.courseId);
  if (!courseId) {
    console.log(
      `Course ID ${req.query.courseId} could not be parsed as number`
    );
    return res.status(http.Statuses.NotFound).end();
  }

  switch (req.method) {
    case http.Methods.Post: {
      try {
        if (!(await queries.courseExistsByID(courseId))) {
          console.log(`Course with ID ${courseId} not found`);
          return res.status(http.Statuses.NotFound).end();
        }
      } catch (err) {
        console.error(`Failed to determine if course ${courseId} exists`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to determine if course exists" });
      }

      if (!isRequestBody(req.body)) {
        console.log("Failed to parse request body", req.body);
        return res
          .status(http.Statuses.BadRequest)
          .json({ error: "Invalid input" });
      }

      const { name, holes } = req.body;

      try {
        if (await queries.layoutExists(name, courseId)) {
          console.log(`Layout ${name} for course ${courseId} already exists`);
          return res.status(http.Statuses.Conflict).json({
            error: "Layout with same name already exists for this course",
          });
        }
      } catch (err) {
        console.error(
          `Failed to determine if layout ${name} exists for course ${courseId}`,
          err
        );
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to determine if layout is duplicate" });
      }

      try {
        const layout = await queries.createLayout(name, courseId, holes);

        console.log(`Layout ${name} created for course ${courseId}`);
        return res.status(http.Statuses.Created).json({ layout });
      } catch (err) {
        console.error(
          `Failed to create layout ${name} in course ${courseId}`,
          err
        );
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to create layout" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
