import type { NextApiRequest, NextApiResponse } from "next";
import { getNumericId } from "@lib/util";
import * as http from "@lib/http";
import * as queries from "@lib/queries";

interface PutBody {
  firstName: string;
  lastName: string;
  email: string;
}

function isPutBody(object: unknown): object is PutBody {
  return (
    typeof object === "object" &&
    object !== null &&
    "firstName" in object &&
    typeof object.firstName === "string" &&
    "lastName" in object &&
    typeof object.lastName === "string" &&
    "email" in object &&
    typeof object.email === "string"
  );
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = getNumericId(req.query.userId);
  if (!userId) {
    console.log(`User ID ${req.query.userId} could not be parsed as number`);
    return res.status(http.Statuses.NotFound).end();
  }

  switch (req.method) {
    case http.Methods.Get: {
      try {
        const user = await queries.getUserByID(userId);
        if (!user) {
          console.log(`User ${userId} does not exist`);
          return res.status(http.Statuses.NotFound).end();
        }
        console.log(`User ${userId} found`);
        return res.status(http.Statuses.OK).json({ user });
      } catch (err) {
        console.error(`Error when looking for user ${userId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Error searching for user" });
      }
    }
    case http.Methods.Put: {
      try {
        if (!(await queries.userWithIDExists(userId))) {
          console.log(`User ${userId} not found`);
          return res.status(http.Statuses.NotFound).end();
        }
      } catch (err) {
        console.error(`Error verifying that user ${userId} exists`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Error verifying user exists" });
      }

      if (!isPutBody(req.body)) {
        console.log("Failed to validate request body");
        return res
          .status(http.Statuses.BadRequest)
          .json({ error: "Invalid input" });
      }

      const { firstName, lastName, email } = req.body;

      try {
        const userWithSameEmail = await queries.getUserByEmail(email);
        if (userWithSameEmail && userWithSameEmail.id !== userId) {
          console.log(
            `New email already taken by user ${userWithSameEmail.id}`
          );
          return res
            .status(http.Statuses.Conflict)
            .json({ error: "Email already taken" });
        }
      } catch (err) {
        console.error(`Failed to search for user with email ${email}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Error searching for user with same email" });
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
          return res
            .status(http.Statuses.InternalServerError)
            .json({ error: "Failed to update user" });
        }

        console.log(`User ${userId} updated`);
        return res.status(http.Statuses.OK).json({ user: updatedUser });
      } catch (err) {
        console.error(`Error to update user ${userId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Error updating user" });
      }
    }
    case http.Methods.Delete: {
      try {
        await queries.deleteUser(userId);

        console.log(`User ${userId} deleted`);
        return res.status(http.Statuses.NoContent).end();
      } catch (err) {
        console.error(`Error deleting user ${userId}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "Error deleting user" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
