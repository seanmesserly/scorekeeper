import type { NextApiRequest, NextApiResponse } from "next";
import * as http from "@lib/http";
import * as queries from "@lib/queries";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case http.Methods.Get: {
      try {
        const courses = await queries.getCourses();

        console.log("Retrieved courses");
        return res.status(http.Statuses.OK).json({ courses });
      } catch (err) {
        console.error("Failed to get courses", err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to list courses" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
