import { NextRequest, NextResponse } from "next/server";
import { getNumericId, httpError } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { Layout } from "@lib/types";

type Params = {
  params: {
    courseId: string
  }
}

type ResponseType = { layouts: Layout[] } | { error: string }

export async function GET(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ResponseType>> {
  const courseId = getNumericId(params.courseId);
  if (!courseId) {
    return httpError("Course not found", http.Statuses.NotFound)
  }

  try {
    if (!(await queries.courseExistsByID(courseId))) {
      console.log(`Course ${courseId} does not exist`);
      return httpError("Course not found", http.Statuses.NotFound)
    }
  } catch (err) {
    console.error(`Failed to determine if course ${courseId} exists`, err);
    return httpError("failed to determine if course exists", http.Statuses.InternalServerError)
  }

  try {
    const layouts = await queries.getLayouts(courseId);

    console.log(`found layouts for course ${courseId}`);
    return NextResponse.json({ layouts }, { status: http.Statuses.OK })
  } catch (err) {
    console.error(`failed to get layouts for course ${courseId}`, err);
    return httpError("failed to find layouts for course", http.Statuses.InternalServerError)
  }
}
