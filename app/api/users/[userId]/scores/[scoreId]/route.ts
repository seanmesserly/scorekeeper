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

interface PutBody {
  datetime: string;
  scores: Array<ScoreSchema>;
}

function isPutBody(object: unknown): object is PutBody {
  return (
    typeof object === "object" &&
    object !== null &&
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
    userId: string,
    scoreId: string
  }
}

type ResponseType = { scoreCard: ScoreCard } | { error: string }

export async function GET(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ResponseType>> {
  const userId = getNumericId(params.userId);
  if (!userId) {
    console.log(`User ID ${params.userId} could not be parsed as number`);
    return httpError("User not found", http.Statuses.NotFound)
  }

  const scoreId = getNumericId(params.scoreId);
  if (!scoreId) {
    console.log(`Score ID ${params.scoreId} could not be parsed as number`);
    return httpError("Score card not found", http.Statuses.NotFound)
  }

  try {
    if (!(await queries.userWithIDExists(userId))) {
      console.log(`User ${userId} does not exist`);
      return httpError("User not found", http.Statuses.NotFound)
    }
  } catch (err) {
    console.error(`Failed to check if user ${userId} exists`, err);
    return httpError("failed to check if user exists", http.Statuses.InternalServerError)
  }

  try {
    const scoreCard = await queries.getScoreCard(scoreId);
    if (!scoreCard) {
      console.log(`Failed to find score card with ID ${scoreId}`);
      return httpError("Score card not found", http.Statuses.NotFound)
    }

    return NextResponse.json({ scoreCard }, { status: http.Statuses.OK })
  } catch (err) {
    console.error(`Failed to search for score card ${scoreId}`, err);
    return httpError("Failed to search for score card", http.Statuses.InternalServerError)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ResponseType>> {
  const userId = getNumericId(params.userId);
  if (!userId) {
    console.log(`User ID ${params.userId} could not be parsed as number`);
    return httpError("User not found", http.Statuses.NotFound)
  }

  const scoreId = getNumericId(params.scoreId);
  if (!scoreId) {
    console.log(`Score ID ${params.scoreId} could not be parsed as number`);
    return httpError("Score card not found", http.Statuses.NotFound)
  }

  try {
    if (!(await queries.userWithIDExists(userId))) {
      console.log(`User ${userId} does not exist`);
      return httpError("User not found", http.Statuses.NotFound)
    }
  } catch (err) {
    console.error(`Failed to check if user ${userId} exists`, err);
    return httpError("failed to check if user exists", http.Statuses.InternalServerError)
  }

  try {
    const scoreCard = await queries.getScoreCard(scoreId);
    if (!scoreCard) {
      console.log(`Score card ${scoreId} not found`);
      return httpError("failed to find score card", http.Statuses.NotFound)
    }
  } catch (err) {
    console.error(`Failed to search for score card ${scoreId}`, err);
    return httpError("Failed to search for score card", http.Statuses.InternalServerError)
  }

  if (!isPutBody(req.body)) {
    console.log("Failed to parse request body");
    return httpError("Missing or incorrect body parameters", http.Statuses.BadRequest)
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
      return httpError("Failed to update score card", http.Statuses.InternalServerError)
    }

    console.log(`Updated score card ${scoreId}`);
    return NextResponse.json({ scoreCard }, { status: http.Statuses.OK });
  } catch (err) {
    console.error(`Error when updating score card ${scoreId}`, err);
    return httpError("Error when updating score card", http.Statuses.InternalServerError)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<void | { error: string }>> {
  const userId = getNumericId(params.userId);
  if (!userId) {
    console.log(`User ID ${params.userId} could not be parsed as number`);
    return httpError("User not found", http.Statuses.NotFound)
  }

  const scoreId = getNumericId(params.scoreId);
  if (!scoreId) {
    console.log(`Score ID ${params.scoreId} could not be parsed as number`);
    return new NextResponse(null, { status: http.Statuses.NoContent });
  }

  try {
    if (!(await queries.userWithIDExists(userId))) {
      console.log(`User ${userId} does not exist`);
      return new NextResponse(null, { status: http.Statuses.NoContent });
    }
  } catch (err) {
    console.error(`Failed to check if user ${userId} exists`, err);
    return httpError("failed to check if user exists", http.Statuses.InternalServerError)
  }

  try {
    await queries.deleteScoreCard(scoreId);

    console.log(`Deleted score card ${scoreId}`);
    return new NextResponse(null, { status: http.Statuses.NoContent });
  } catch (err) {
    console.error(`Error when deleting score card ${scoreId}`, err);
    return httpError("Error when trying to delete score card", http.Statuses.InternalServerError)
  }
}
