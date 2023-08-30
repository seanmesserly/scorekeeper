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

interface PutBody {
  name: string;
  holes: Array<HoleSchema>;
}

function isPutBody(object: unknown): object is PutBody {
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
  const layoutId = getNumericId(req.query.layoutId);
  if (!layoutId) {
    console.log(
      `Layout ID ${req.query.layoutId} could not be parsed as number`
    );
    return res.status(http.Statuses.NotFound).end();
  }

  try {
    if (!(await queries.courseExistsByID(courseId))) {
      console.log(`Course ${courseId} does not exist`);
      return res.status(http.Statuses.NotFound).end();
    }
  } catch (err) {
    console.error(`Failed to determine if course ${courseId} exists`, err);
    return res
      .status(http.Statuses.InternalServerError)
      .json({ error: "failed to determine if course exists" });
  }

  switch (req.method) {
    case http.Methods.Get: {
      try {
        const layout = await queries.getLayout(layoutId);

        if (!layout) {
          console.log(`Failed to find layout ${layoutId}`);
          return res.status(http.Statuses.NotFound).end();
        }

        console.log(`Found layout ${layoutId}`);
        return res.status(http.Statuses.OK).json({ layout });
      } catch (err) {
        console.error(`failed to find layout ${layoutId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to find layout" });
      }
    }
    case http.Methods.Put: {
      try {
        const layout = await queries.getLayout(layoutId);
        if (!layout) {
          console.log(`Failed to find layout ${layoutId}`);
          return res.status(http.Statuses.NotFound).end();
        }
      } catch (err) {
        console.error(`Failed to get layout ${layoutId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to find layout" });
      }

      if (!isPutBody(req.body)) {
        return res
          .status(http.Statuses.BadRequest)
          .json({ error: "Invalid input" });
      }

      const { name, holes } = req.body;

      try {
        const updatedLayout = await queries.updateLayout(layoutId, name, holes);

        console.log(`Updated layout ${layoutId}`);
        return res.status(http.Statuses.OK).json({ layout: updatedLayout });
      } catch (err) {
        console.error(`failed to update layout ${layoutId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to update layout" });
      }
    }
    case http.Methods.Delete: {
      try {
        const layout = await queries.getLayout(layoutId);
        if (!layout) {
          console.log(`Failed to find layout ${layoutId}`);
          return res.status(http.Statuses.NotFound).end();
        }
      } catch (err) {
        console.error(`Failed to get layout ${layoutId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to find layout" });
      }

      try {
        await queries.deleteLayout(layoutId);

        console.log(`Deleted layout ${layoutId}`);
        return res.status(http.Statuses.NoContent).end();
      } catch (err) {
        console.error(`Failed to delete layout ${layoutId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to delete layout" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
