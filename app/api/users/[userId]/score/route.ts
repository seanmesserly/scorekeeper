import { NextRequest, NextResponse } from "next/server";
import { getNumericId, httpError, isValidISOString } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { ScoreCard } from "@lib/types";

interface ScoreSchema {
  number: number;
  strokes: number;
}

function isScore(object: unknown): object is ScoreSchema {
  return (
    typeof object === "object" &&
    object !== null &&
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
    object !== null &&
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

type Params = {
  params: {
    userId: string
  }
}

type ResponseType = { scoreCard: ScoreCard } | { error: string }

export async function POST(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ResponseType>> {
  const userId = getNumericId(params.userId);
  if (!userId) {
    console.log(`User ID ${params.userId} could not be parsed as number`);
    return httpError("User not found", http.Statuses.NotFound)
  }

  try {
    const user = await queries.getUserByID(userId);
    if (!user) {
      console.log(`user ${userId} not found`);
      return httpError("User not found", http.Statuses.NotFound)
    }
  } catch (err) {
    console.error(`Failed to search for user ${userId}`, err);
    return httpError("failed to search for user", http.Statuses.InternalServerError)
  }

  if (!isRequestBody(req.body)) {
    console.log("Failed to parse request body", req.body);
    return httpError("Invalid input", http.Statuses.BadRequest)
  }

  const { layoutId, datetime, scores } = req.body;

  try {
    const layout = await queries.getLayout(layoutId);
    if (!layout) {
      console.log(`Failed to find layout ${layoutId}`);
      return httpError("Layout not found", http.Statuses.BadRequest)
    }

    // verify that all holes described in scores exist in the layout
    for (const score of scores) {
      const hole = layout.holes.find(
        (hole) => hole.number === score.number
      );
      if (!hole) {
        console.log(`Hole ${score.number} not found in layout ${layoutId}`);
        return httpError(`Hole ${score.number} does not exist in the target layout`, http.Statuses.BadRequest)
      }
    }
  } catch (err) {
    console.error(`Failed to search for layout ${layoutId}`, err);
    return httpError("Failed to search for layout", http.Statuses.InternalServerError)
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
    return NextResponse.json({ scoreCard }, { status: http.Statuses.Created });
  } catch (err) {
    console.error("Failed to create score card", err);
    return httpError("failed to save score card", http.Statuses.InternalServerError)
  }
}
