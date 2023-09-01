import { NextRequest, NextResponse } from "next/server";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { Course } from "@lib/types";
import { httpError } from "@lib/util";

interface RequestBody {
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
}

function isRequestBody(object: unknown): object is RequestBody {
  return (
    typeof object === "object" &&
    object !== null &&
    "name" in object &&
    typeof object.name === "string" &&
    "lat" in object &&
    typeof object.lat === "number" &&
    "lon" in object &&
    typeof object.lon === "number" &&
    "city" in object &&
    typeof object.city === "string" &&
    "state" in object &&
    typeof object.state === "string"
  );
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

