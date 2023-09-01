import { NextRequest, NextResponse } from "next/server";
import { getNumericId } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { Layout } from "@lib/types";
import { httpError } from "@lib/util";
import { z } from "zod";

const requestBodySchema = z.object({
  name: z.string().nonempty(),
  holes: z.object({
    number: z.number().min(1),
    par: z.number().min(1),
    distance: z.number().min(0)
  }).array()
})

type RequestBody = z.infer<typeof requestBodySchema>

function isRequestBody(object: unknown): object is RequestBody {
  return requestBodySchema.safeParse(object).success
}

type Params = {
  params: {
    courseId: string,
  }
}

type ResponseType = { layout: Layout } | { error: string }

export async function POST(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ResponseType>> {
  const courseId = getNumericId(params.courseId);
  if (!courseId) {
    console.log(
      `Course ID ${params.courseId} could not be parsed as number`
    );
    return httpError("Course not found", http.Statuses.NotFound)
  }

  try {
    if (!(await queries.courseExistsByID(courseId))) {
      console.log(`Course with ID ${courseId} not found`);
      return httpError("Course not found", http.Statuses.NotFound)
    }
  } catch (err) {
    console.error(`Failed to determine if course ${courseId} exists`, err);
    return httpError("failed to determine if course exists", http.Statuses.InternalServerError)
  }

  if (!isRequestBody(req.body)) {
    console.log("Failed to parse request body", req.body);
    return httpError("Invalid input", http.Statuses.BadRequest)
  }

  const { name, holes } = req.body;

  try {
    if (await queries.layoutExists(name, courseId)) {
      console.log(`Layout ${name} for course ${courseId} already exists`);
      return httpError("Layout with same name already exists for this course", http.Statuses.Conflict)
    }
  } catch (err) {
    console.error(
      `Failed to determine if layout ${name} exists for course ${courseId}`,
      err
    );
    return httpError("failed to determine if layout is duplicate", http.Statuses.InternalServerError)
  }

  try {
    const layout = await queries.createLayout(name, courseId, holes);

    console.log(`Layout ${name} created for course ${courseId}`);
    return NextResponse.json({ layout }, { status: http.Statuses.Created })
  } catch (err) {
    console.error(
      `Failed to create layout ${name} in course ${courseId}`,
      err
    );
    return httpError("failed to create layout", http.Statuses.InternalServerError)
  }
}
