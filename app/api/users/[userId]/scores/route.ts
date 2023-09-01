import { NextRequest, NextResponse } from "next/server";
import { getNumericId, httpError } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { ScoreCard } from "@lib/types";

type Params = {
  params: {
    userId: string
  }
}

type ResponseType = { scoreCards: ScoreCard[] } | { error: string }

export async function GET(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ResponseType>> {
  const userId = getNumericId(params.userId);
  if (!userId) {
    console.log(`User ID ${params.userId} could not be parsed as number`);
    return httpError("Failed to find user", http.Statuses.NotFound);
  }

  try {
    if (!(await queries.userWithIDExists(userId))) {
      console.log(`User ${userId} not found`);
      return httpError("Failed to find user", http.Statuses.NotFound);

    }
  } catch (err) {
    console.error(`Error when trying to find user ${userId}`, err);
    return httpError("Error when searching for user", http.Statuses.InternalServerError)
  }

  try {
    const scoreCards = await queries.getScoreCards(userId);

    console.log(`Score cards for ${userId} found`);
    return NextResponse.json({ scoreCards }, { status: http.Statuses.OK });
  } catch (err) {
    console.error(`Error when searching for score cards by ${userId}`, err);
    return httpError("Error when searching for score cards", http.Statuses.InternalServerError)
  }
}
