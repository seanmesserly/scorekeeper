import { NextRequest, NextResponse } from "next/server";
import { getNumericId, httpError } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { Layout } from "@lib/types";

interface HoleSchema {
  number: number;
  par: number;
  distance: number;
}

function isHole(object: unknown): object is HoleSchema {
  return (
    typeof object === "object" &&
    object !== null &&
    "number" in object &&
    typeof object.number === "number" &&
    "par" in object &&
    typeof object.par === "number" &&
    "distance" in object &&
    typeof object.distance === "number"
  );
}

interface PutBody {
  name: string;
  holes: Array<HoleSchema>;
}

function isPutBody(object: unknown): object is PutBody {
  return (
    typeof object === "object" &&
    object !== null &&
    "name" in object &&
    typeof object.name === "string" &&
    "holes" in object &&
    object.holes instanceof Array &&
    object.holes.every((hole) => isHole(hole))
  );
}

type Params = {
  params: {
    courseId: string,
    layoutId: string
  }
}

type ResponseType = { layout: Layout } | { error: string }

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
  const layoutId = getNumericId(params.layoutId);
  if (!layoutId) {
    console.log(
      `Layout ID ${params.layoutId} could not be parsed as number`
    );
    return httpError("Layout not found", http.Statuses.NotFound)
  }

  try {
    if (!(await queries.courseExistsByID(courseId))) {
      console.log(`Course ${courseId} does not exist`);
      return httpError("Layout not found", http.Statuses.NotFound)
    }
  } catch (err) {
    console.error(`Failed to determine if course ${courseId} exists`, err);
    return httpError("failed to determine if course exists", http.Statuses.InternalServerError)
  }

  try {
    const layout = await queries.getLayout(layoutId);

    if (!layout) {
      console.log(`Failed to find layout ${layoutId}`);
      return httpError("Layout not found", http.Statuses.NotFound)
    }

    console.log(`Found layout ${layoutId}`);
    return NextResponse.json({ layout }, { status: http.Statuses.OK })
  } catch (err) {
    console.error(`failed to find layout ${layoutId}`, err);
    return httpError("failed to find layout", http.Statuses.InternalServerError)
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
    return httpError("Layout not found", http.Statuses.NotFound)
  }
  const layoutId = getNumericId(params.layoutId);
  if (!layoutId) {
    console.log(
      `Layout ID ${params.layoutId} could not be parsed as number`
    );
    return httpError("Layout not found", http.Statuses.NotFound)
  }

  try {
    if (!(await queries.courseExistsByID(courseId))) {
      console.log(`Course ${courseId} does not exist`);
      return httpError("Layout not found", http.Statuses.NotFound)
    }
  } catch (err) {
    console.error(`Failed to determine if course ${courseId} exists`, err);
    return httpError("failed to determine if course exists", http.Statuses.InternalServerError)
  }

  try {
    const layout = await queries.getLayout(layoutId);
    if (!layout) {
      console.log(`Failed to find layout ${layoutId}`);
      return httpError("Layout not found", http.Statuses.NotFound)
    }
  } catch (err) {
    console.error(`Failed to get layout ${layoutId}`, err);
    return httpError("failed to find layout", http.Statuses.InternalServerError)
  }

  if (!isPutBody(req.body)) {
    console.log("Bad put body", req.body)
    return httpError("Invalid input", http.Statuses.BadRequest)
  }

  const { name, holes } = req.body;

  try {
    const updatedLayout = await queries.updateLayout(layoutId, name, holes);

    console.log(`Updated layout ${layoutId}`);
    return NextResponse.json({ layout: updatedLayout }, { status: http.Statuses.OK })
  } catch (err) {
    console.error(`failed to update layout ${layoutId}`, err);
    return httpError("failed to update layout", http.Statuses.InternalServerError)
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
    return httpError("Layout not found", http.Statuses.NotFound)
  }
  const layoutId = getNumericId(params.layoutId);
  if (!layoutId) {
    console.log(
      `Layout ID ${params.layoutId} could not be parsed as number`
    );
    return new NextResponse(null, { status: http.Statuses.NoContent });
  }

  try {
    if (!(await queries.courseExistsByID(courseId))) {
      console.log(`Course ${courseId} does not exist`);
      return httpError("Layout not found", http.Statuses.NotFound)
    }
  } catch (err) {
    console.error(`Failed to determine if course ${courseId} exists`, err);
    return httpError("failed to determine if course exists", http.Statuses.InternalServerError)
  }

  try {
    const layout = await queries.getLayout(layoutId);
    if (!layout) {
      console.log(`Failed to find layout ${layoutId}`);
      return new NextResponse(null, { status: http.Statuses.InternalServerError });
    }
  } catch (err) {
    console.error(`Failed to get layout ${layoutId}`, err);
    return httpError("failed to find layout", http.Statuses.InternalServerError)
  }

  try {
    await queries.deleteLayout(layoutId);

    console.log(`Deleted layout ${layoutId}`);
    return new NextResponse(null, { status: http.Statuses.InternalServerError });
  } catch (err) {
    console.error(`Failed to delete layout ${layoutId}`, err);
    return httpError("failed to delete layout", http.Statuses.InternalServerError)
  }
}
