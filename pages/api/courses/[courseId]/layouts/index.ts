import type { NextApiRequest, NextApiResponse } from "next";
import { getNumericId } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";

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

      try {
        const layouts = await queries.getLayouts(courseId);

        console.log(`found layouts for course ${courseId}`);
        return res.status(http.Statuses.OK).json({ layouts });
      } catch (err) {
        console.error(`failed to get layouts for course ${courseId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to find layouts for course" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
