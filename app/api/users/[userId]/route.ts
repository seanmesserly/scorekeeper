import { NextRequest, NextResponse } from "next/server";
import { getNumericId, httpError } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";
import { User } from "@lib/types";
import { z } from "zod";

const putBodySchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.string().email().nonempty()
})

type PutBody = z.infer<typeof putBodySchema>

function isPutBody(object: unknown): object is PutBody {
  return putBodySchema.safeParse(object).success
}

type Params = {
  params: {
    userId: string
  }
}

type ResponseType = { user: User } | { error: string }

export async function GET(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ResponseType>> {
  const userId = getNumericId(params.userId);
  if (!userId) {
    console.log(`User ID ${params.userId} could not be parsed as number`);
    return httpError("User not found", http.Statuses.NotFound);
  }

  try {
    const user = await queries.getUserByID(userId);
    if (!user) {
      console.log(`User ${userId} does not exist`);
      return httpError("User not found", http.Statuses.NotFound);
    }
    console.log(`User ${userId} found`);
    return NextResponse.json({ user }, { status: http.Statuses.OK })
  } catch (err) {
    console.error(`Error when looking for user ${userId}`, err);
    return httpError("Error searching for user", http.Statuses.InternalServerError)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ResponseType>> {
  const userId = getNumericId(params.userId);
  if (!userId) {
    console.log(`User ID ${params.userId} could not be parsed as number`);
    return httpError("User not found", http.Statuses.NotFound);
  }

  try {
    if (!(await queries.userWithIDExists(userId))) {
      console.log(`User ${userId} not found`);
      return httpError("User not found", http.Statuses.NotFound);
    }
  } catch (err) {
    console.error(`Error verifying that user ${userId} exists`, err);
    return httpError("Error verifying user exists", http.Statuses.InternalServerError)
  }

  if (!isPutBody(req.body)) {
    console.log("Failed to validate request body");
    return httpError("Invalid input", http.Statuses.BadRequest)
  }

  const { firstName, lastName, email } = req.body;

  try {
    const userWithSameEmail = await queries.getUserByEmail(email);
    if (userWithSameEmail && userWithSameEmail.id !== userId) {
      console.log(
        `New email already taken by user ${userWithSameEmail.id}`
      );
      return httpError("Email already taken", http.Statuses.Conflict)
    }
  } catch (err) {
    console.error(`Failed to search for user with email ${email}`, err);
    return httpError("Error searching for user with same email", http.Statuses.InternalServerError)
  }

  try {
    const updatedUser = await queries.updateUser(
      userId,
      firstName,
      lastName,
      email
    );
    if (!updatedUser) {
      console.error(`Failed to update user ${userId}`);
      return httpError("Failed to update user", http.Statuses.InternalServerError)

    }

    console.log(`User ${userId} updated`);
    return NextResponse.json({ user: updatedUser }, { status: http.Statuses.OK })
  } catch (err) {
    console.error(`Error to update user ${userId}`, err);
    return httpError("Error updating user", http.Statuses.InternalServerError)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<void | { error: string }>> {
  const userId = getNumericId(params.userId);
  if (!userId) {
    console.log(`User ID ${params.userId} could not be parsed as number`);
    return new NextResponse(null, { status: http.Statuses.NoContent });
  }

  try {
    await queries.deleteUser(userId);

    console.log(`User ${userId} deleted`);
    return new NextResponse(null, { status: http.Statuses.NoContent });
  } catch (err) {
    console.error(`Error deleting user ${userId}`, err);
    return httpError("Error deleting user", http.Statuses.InternalServerError)
  }
}
