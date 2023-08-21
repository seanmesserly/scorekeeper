import type { NextApiRequest, NextApiResponse } from "next";
import { getNumericId } from "../../../../lib/util";
import * as http from "../../../../lib/http";
import * as queries from "../../../../lib/queries";

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
    console.log(
      `Course ID ${req.query.courseId} could not be parsed as number`
    );
    return res.status(http.Statuses.NotFound).end();
  }

  switch (req.method) {
    case http.Methods.Get: {
      try {
        const course = await queries.getCourseByID(courseId);
        if (!course) {
          console.log(`Course ${courseId} not found`);
          return res.status(http.Statuses.NotFound).end();
        }

        console.log(`Course ${courseId} found`);
        return res.status(http.Statuses.OK).json({ course });
      } catch (err) {
        console.error(`Failed to get course ${courseId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to get course" });
      }
    }
    case http.Methods.Put: {
      try {
        if (!(await queries.courseExistsByID(courseId))) {
          console.log(`Course ${courseId} not found`);
          return res.status(http.Statuses.NotFound).end();
        }
      } catch (err) {
        console.error(`Failed to find course ${courseId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to find course" });
      }

      if (!isPutBody(req.body)) {
        console.log("Failed to parse JSON body");
        return res
          .status(http.Statuses.BadRequest)
          .json({ error: "Invalid input" });
      }

      const { name, lat, lon, city, state } = req.body;

      try {
        const existingCourse = await queries.getCourse(name, city, state);

        if (existingCourse.id !== courseId) {
          console.log(
            `Course ${name} in ${city}, ${state} already exists with ID ${existingCourse.id}`
          );
          return res.status(http.Statuses.Conflict).json({
            error: "Course with same name in same location already exists",
          });
        }
      } catch (err) {
        console.error("Failed to check if course became duplicate", err);
        return res.status(http.Statuses.InternalServerError);
      }

      try {
        const updatedCourse = await queries.updateCourse(
          courseId,
          name,
          city,
          state,
          lat,
          lon
        );

        console.log(`Updated course ${courseId}`);
        return res.status(http.Statuses.OK).json({ course: updatedCourse });
      } catch (err) {
        console.error(`Failed to update course ${courseId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to update course" });
      }
    }
    case http.Methods.Delete: {
      try {
        if (!(await queries.courseExistsByID(courseId))) {
          console.log(`Course ${courseId} not found`);
          return res.status(http.Statuses.NotFound).end();
        }
      } catch (err) {
        console.error(`Failed to find course ${courseId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to find course" });
      }

      try {
        await queries.deleteCourse(courseId);

        console.log(`Deleted course ${courseId}`);
        return res.status(http.Statuses.NoContent).end();
      } catch (err) {
        console.error(`Failed to delete course ${courseId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to delete course" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
