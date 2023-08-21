import type { NextApiRequest, NextApiResponse } from "next";
import { getNumericId, isValidISOString } from "../../../../../lib/util";
import * as http from "../../../../../lib/http";
import * as queries from "../../../../../lib/queries";

interface ScoreSchema {
  number: number;
  strokes: number;
}

function isScore(object: unknown): object is ScoreSchema {
  return (
    typeof object === "object" &&
    "number" in object &&
    typeof object.number === "number" &&
    "strokes" in object &&
    typeof object.strokes === "number"
  );
}

interface RequestBody {
  layoutId: number;
  datetime: string;
  scores: Array<ScoreSchema>;
}

function isRequestBody(object: unknown): object is RequestBody {
  return (
    typeof object === "object" &&
    "layoutId" in object &&
    typeof object.layoutId === "number" &&
    "datetime" in object &&
    typeof object.datetime === "string" &&
    isValidISOString(object.datetime) &&
    "scores" in object &&
    object.scores instanceof Array &&
    object.scores.every((score) => isScore(score))
  );
}

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
    case http.Methods.Post: {
      try {
        const user = await queries.getUserByID(userId);
        if (!user) {
          console.log(`user ${userId} not found`);
          return res.status(http.Statuses.NotFound).end();
        }
      } catch (err) {
        console.error(`Failed to search for user ${userId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to search for user" });
      }

      if (!isRequestBody(req.body)) {
        console.log("Failed to parse request body", req.body);
        return res
          .status(http.Statuses.BadRequest)
          .json({ error: "Invalid input" });
      }

      const { layoutId, datetime, scores } = req.body;

      try {
        const layout = await queries.getLayout(layoutId);
        if (!layout) {
          console.log(`Failed to find layout ${layoutId}`);
          return res
            .status(http.Statuses.BadRequest)
            .json({ error: "Layout not found" });
        }

        // verify that all holes described in scores exist in the layout
        for (const score of scores) {
          const hole = layout.holes.find(
            (hole) => hole.number === score.number
          );
          if (!hole) {
            console.log(`Hole ${score.number} not found in layout ${layoutId}`);
            return res.status(http.Statuses.BadRequest).json({
              error: `Hole ${score.number} does not exist in the target layout`,
            });
          }
        }
      } catch (err) {
        console.error(`Failed to search for layout ${layoutId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Failed to search for layout" });
      }

      // save score card
      try {
        const scoreCard = await queries.createScoreCard(
          userId,
          layoutId,
          new Date(datetime),
          scores
        );

        console.log(`Returned score card ${scoreCard.id}`);
        return res.status(http.Statuses.Created).json({
          scoreCard: {
            layoutId: layoutId,
            datetime: scoreCard.datetime,
            scores: scoreCard.scores,
          },
        });
      } catch (err) {
        console.error("Failed to create score card", err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to save score card" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
