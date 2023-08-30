import type { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "@lib/auth";
import * as http from "@lib/http";
import * as queries from "@lib/queries";

interface RequestBody {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

function isRequestBody(object: unknown): object is RequestBody {
  return (
    typeof object === "object" &&
    "firstName" in object &&
    typeof object.firstName === "string" &&
    "lastName" in object &&
    typeof object.lastName === "string" &&
    "email" in object &&
    typeof object.email === "string" &&
    "username" in object &&
    typeof object.username === "string" &&
    "password" in object &&
    typeof object.password === "string"
  );
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case http.Methods.Post: {
      if (!isRequestBody(req.body)) {
        console.log("Failed to parse request body", req.body);
        return res
          .status(http.Statuses.BadRequest)
          .json({ error: "Invalid input" });
      }

      const { firstName, lastName, email, username, password } = req.body;

      // ENsure that username and email are not duplicates
      try {
        if (await queries.userWithUsernameExists(username)) {
          console.log(`User with email ${email} already exists`);
          return res
            .status(http.Statuses.Conflict)
            .json({ error: "email already in use" });
        }
      } catch (err) {
        console.error(
          `Failed to search for user with username ${username}`,
          err
        );
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to check for unique username" });
      }

      try {
        if (await queries.userWithEmailExists(email)) {
          console.log(`User with email ${email} already exists`);
          return res
            .status(http.Statuses.Conflict)
            .json({ error: "email already in use" });
        }
      } catch (err) {
        console.error(`Failed to search for user with email ${email}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to check for unique email" });
      }

      // register user
      try {
        const passwordHash = await hashPassword(password);

        const user = await queries.createUser(
          username,
          email,
          firstName,
          lastName,
          passwordHash
        );

        console.log(`Created user ${username}`);
        return res.status(http.Statuses.Created).json(user);
      } catch (err) {
        console.error(`Failed to create user ${username}`, err);
        return res
          .status(http.Statuses.InternalServerError)
          .json({ error: "failed to create user" });
      }
    }
    default: {
      console.log(`Unsupported method ${req.method} for path ${req.url}`);
      return res.status(http.Statuses.NotFound).end();
    }
  }
}
