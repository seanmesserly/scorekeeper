import type { NextApiRequest, NextApiResponse } from "next";
import { getNumericId, httpError } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { NextRequest, NextResponse } from "next/server";
import { Course } from "@lib/types";
import { z } from "zod";

const putBodySchema = z.object({
  name: z.string().nonempty(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  city: z.string().nonempty(),
  state: z.string().nonempty()
})

type PutBody = z.infer<typeof putBodySchema>

function isPutBody(object: unknown): object is PutBody {
  return putBodySchema.safeParse(object).success
}

type Params = {
  params: {
    courseId: string
  }
}

type ResponseType = { course: Course } | { error: string }

export async function GET(
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
    const course = await queries.getCourseByID(courseId);
    if (!course) {
      console.log(`Course ${courseId} not found`);
      return httpError("Course not found", http.Statuses.NotFound)
    }

    console.log(`Course ${courseId} found`);
    return NextResponse.json({ course }, { status: http.Statuses.OK })
  } catch (err) {
    console.error(`Failed to get course ${courseId}`, err);
    return httpError("failed to get course", http.Statuses.InternalServerError)
  }
}

export async function PUT(
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

  if (!isPutBody(req.body)) {
    console.log("Failed to parse JSON body");
    return httpError("Invalid input", http.Statuses.BadRequest)
  }

  const { name, lat, lon, city, state } = req.body;

  try {
    const existingCourse = await queries.getCourse(name, city, state);

    if (!existingCourse) {
      console.log(`Course ${courseId} not found`);
      return httpError("Course not found", http.Statuses.NotFound)
    }

    if (existingCourse.id !== courseId) {
      console.log(
        `Course ${name} in ${city}, ${state} already exists with ID ${existingCourse.id}`
      );
      return httpError("Course with same name in same location already exists", http.Statuses.Conflict)
    }
  } catch (err) {
    console.error("Failed to check if course became duplicate", err);
    return httpError("Failed to check if course is duplicate", http.Statuses.InternalServerError)
  }

  try {
    const updatedCourse = await queries.updateCourse(
      courseId,
      name,
      city,
      state,
      lat,
      lon
    );

    console.log(`Updated course ${courseId}`);
    return NextResponse.json({ course: updatedCourse }, { status: http.Statuses.OK })
  } catch (err) {
    console.error(`Failed to update course ${courseId}`, err);
    return httpError("failed to update course", http.Statuses.InternalServerError)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<void | { error: string }>> {
  const courseId = getNumericId(params.courseId);
  if (!courseId) {
    console.log(
      `Course ID ${params.courseId} could not be parsed as number`
    );
    return new NextResponse(null, { status: http.Statuses.NoContent })
  }

  try {
    if (!(await queries.courseExistsByID(courseId))) {
      console.log(`Course ${courseId} not found`);
      return new NextResponse(null, { status: http.Statuses.NoContent })
    }
  } catch (err) {
    console.error(`Failed to find course ${courseId}`, err);
    return httpError("failed to find course", http.Statuses.InternalServerError)
  }

  try {
    await queries.deleteCourse(courseId);

    console.log(`Deleted course ${courseId}`);
    return new NextResponse(null, { status: http.Statuses.NoContent })
  } catch (err) {
    console.error(`Failed to delete course ${courseId}`, err);
    return httpError("failed to delete course", http.Statuses.InternalServerError)
  }
}
