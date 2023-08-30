import type { NextApiRequest, NextApiResponse } from "next";
import { getNumericId } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = getNumericId(req.query.userId);
  if (!userId) {
    console.log(`User ID ${req.query.userId} could not be parsed as number`);
    return res.status(http.Statuses.NotFound).end();
  }

  switch (req.method) {
    case http.Methods.Get: {
      try {
        if (!(await queries.userWithIDExists(userId))) {
          console.log(`User ${userId} not found`);
          return res
            .status(http.Statuses.NotFound)
            .json({ error: "User not found" });
        }
      } catch (err) {
        console.error(`Error when trying to find user ${userId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Error when searching for user" });
      }

      try {
        const scoreCards = await queries.getScoreCards(userId);

        console.log(`Score cards for ${userId} found`);
        return res.status(http.Statuses.OK).json({ scoreCards });
      } catch (err) {
        console.error(`Error when searching for score cards by ${userId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Error when searching for score cards" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
