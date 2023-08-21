import type { NextApiRequest, NextApiResponse } from "next";
import { getNumericId, isValidISOString } from "../../../../../../lib/util";
import * as http from "../../../../../../lib/http";
import * as queries from "../../../../../../lib/queries";

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

interface PutBody {
  datetime: string;
  scores: Array<ScoreSchema>;
}

function isPutBody(object: unknown): object is PutBody {
  return (
    typeof object === "object" &&
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

  const scoreId = getNumericId(req.query.scoreId);
  if (!scoreId) {
    console.log(`Score ID ${req.query.scoreId} could not be parsed as number`);
    return res.status(http.Statuses.NotFound).end();
  }

  try {
    if (!(await queries.userWithIDExists(userId))) {
      console.log(`User ${userId} does not exist`);
      return res
        .status(http.Statuses.NotFound)
        .json({ error: "User not found" });
    }
  } catch (err) {
    console.error(`Failed to check if user ${userId} exists`, err);
    return res
      .status(http.Statuses.InternalServerError)
      .json({ error: "failed to check if user exists" });
  }

  switch (req.method) {
    case http.Methods.Get: {
      try {
        const scoreCard = await queries.getScoreCard(scoreId);
        if (!scoreCard) {
          console.log(`Failed to find score card with ID ${scoreId}`);
          return res
            .status(http.Statuses.NotFound)
            .json({ error: "Score card not fount" });
        }

        return res.status(http.Statuses.OK).json({ scoreCard });
      } catch (err) {
        console.error(`Failed to search for score card ${scoreId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Failed to search for score card" });
      }
    }
    case http.Methods.Put: {
      try {
        const scoreCard = await queries.getScoreCard(scoreId);
        if (!scoreCard) {
          console.log(`Score card ${scoreId} not found`);
          return res
            .status(http.Statuses.NotFound)
            .json({ error: "failed to find score card" });
        }
      } catch (err) {
        console.error(`Failed to search for score card ${scoreId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Failed to search for score card" });
      }

      if (!isPutBody(req.body)) {
        console.log("Failed to parse request body");
        return res
          .status(http.Statuses.BadRequest)
          .json({ error: "Missing or incorrect body parameters" });
      }

      const { datetime, scores } = req.body;

      try {
        const scoreCard = await queries.updateScoreCard(
          scoreId,
          new Date(datetime),
          scores
        );

        if (!scoreCard) {
          console.log(`Failed to update score card ${scoreId}`);
          return res
            .status(http.Statuses.InternalServerError)
            .json({ error: "Failed to update score card" });
        }

        console.log(`Updated score card ${scoreId}`);
        return res.status(http.Statuses.OK).json({ scoreCard });
      } catch (err) {
        console.error(`Error when updating score card ${scoreId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Error when updating score card" });
      }
    }
    case http.Methods.Delete: {
      try {
        await queries.deleteScoreCard(scoreId);

        console.log(`Deleted score card ${scoreId}`);
        return res.status(http.Statuses.NoContent).end();
      } catch (err) {
        console.error(`Error when deleting score card ${scoreId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Error when trying to delete score card" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
