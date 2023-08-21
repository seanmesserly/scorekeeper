export interface Course {
  id: number;
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
}

export interface Layout {
  id: number;
  name: string;
  holes: Array<Hole>;
}

export interface Hole {
  number: number;
  par: number;
  distance: number;
}

export interface UserAuth {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Score {
  number: number;
  strokes: number;
}

export interface ScoreCard {
  id: number;
  datetime: string;
  courseID: number;
  layoutID: number;
  scores: Array<Score>;
}
