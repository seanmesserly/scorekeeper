import { NextResponse } from "next/server";
import { HttpStatusCode } from "./http";

export function getNumericId(param: string | string[] | undefined): number | null {
  if (param === undefined) {
    return null
  }
  if (param instanceof Array) {
    return null;
  }
  const id = parseInt(param);
  if (isNaN(id)) {
    return null;
  }
  return id;
}

// httpError is a helper function to create a NextResponse for an error case.
export function httpError(message: string, statusCode: HttpStatusCode): NextResponse<{ error: string }> {
  return NextResponse.json({ error: message }, { status: statusCode })
}
