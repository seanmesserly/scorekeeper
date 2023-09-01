import { NextRequest, NextResponse } from "next/server";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { Course } from "@lib/types";
import { httpError } from "@lib/util";

type ResponseType = { courses: Course[] } | { error: string }

export async function GET(
  req: NextRequest,
): Promise<NextResponse<ResponseType>> {
  try {
    const courses = await queries.getCourses();
    console.log("Retrieved courses");
    return NextResponse.json({ courses }, { status: http.Statuses.OK })
  } catch (err) {
    console.error("Failed to get courses", err);
    return httpError("failed to list courses", http.Statuses.InternalServerError)
  }
}
