import { NextRequest, NextResponse } from "next/server";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { Course } from "@lib/types";
import { httpError } from "@lib/util";
import { z } from "zod";

const requestBodySchema = z.object({
  name: z.string().nonempty(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  city: z.string().nonempty(),
  state: z.string().nonempty()
})

type RequestBody = z.infer<typeof requestBodySchema>

function isRequestBody(object: unknown): object is RequestBody {
  return requestBodySchema.safeParse(object).success
}

type ResponseType = { course: Course } | { error: string }

export async function GET(
  req: NextRequest,
): Promise<NextResponse<ResponseType>> {
  if (!isRequestBody(req.body)) {
    return httpError("Invalid fields", http.Statuses.BadRequest)
  }

  const { name, lat, lon, city, state } = req.body;

  try {
    if (await queries.courseExists(name, city, state)) {
      console.log(`Course ${name} already exists in ${city}, ${state}`);
      return httpError("Course with same name in same location exists", http.Statuses.Conflict)
    }
  } catch (err) {
    console.error(
      `Failed to determine if course ${name} in ${city}, ${state} existed`,
      err
    );
    return httpError("Failed to determine if course existed", http.Statuses.InternalServerError)
  }

  try {
    const course = await queries.createCourse(name, city, state, lat, lon);

    console.log(`Course ${name} created in ${city}, ${state}`);
    return NextResponse.json({ course }, { status: http.Statuses.Created })
  } catch (err) {
    console.error(
      `Failed to create course ${name} in ${city}, ${state}`,
      err
    );
    return httpError("Failed to create course", http.Statuses.InternalServerError)
  }
}

