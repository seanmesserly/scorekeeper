export type Course = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
}

export type Layout = {
  id: number;
  name: string;
  holes: Array<Hole>;
}

export type Hole = {
  number: number;
  par: number;
  distance: number;
}

export type UserAuth = {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
}

export type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export type Score = {
  number: number;
  strokes: number;
}

export type ScoreCard = {
  id: number;
  datetime: string;
  courseID: number;
  layoutID: number;
  scores: Array<Score>;
}
