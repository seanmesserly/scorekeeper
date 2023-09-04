import { z } from "zod";

export type Course = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
};

export type Layout = {
  id: number;
  name: string;
  holes: Array<Hole>;
};

export type Hole = {
  number: number;
  par: number;
  distance: number;
};

export type UserAuth = {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
};

export const userSchema = z.object({
  id: z.number(),
  username: z.string().nonempty(),
  email: z.string().email().nonempty(),
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
});

export type User = z.infer<typeof userSchema>;

export const storedUserSchema = z.object({
  id: z.number(),
  authToken: z.string().nonempty(),
});

export type StoredUser = z.infer<typeof storedUserSchema>;

export type Score = {
  number: number;
  strokes: number;
};

export type ScoreCard = {
  id: number;
  datetime: string;
  courseID: number;
  layoutID: number;
  scores: Array<Score>;
};
