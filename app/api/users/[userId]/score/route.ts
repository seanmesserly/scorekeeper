import { NextRequest, NextResponse } from "next/server";
import { getNumericId, httpError } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { ScoreCard } from "@lib/types";
import { z } from "zod";

const requestBodySchema = z.object({
  layoutId: z.number(),
  datetime: z.string().datetime().nonempty(),
  scores: z.object({
    number: z.number().min(1),
    strokes: z.number().min(1)
  }).array()
})

type RequestBody = z.infer<typeof requestBodySchema>

function isRequestBody(object: unknown): object is RequestBody {
  return requestBodySchema.safeParse(object).success
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
