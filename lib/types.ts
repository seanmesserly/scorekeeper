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

export interface Score {
  number: number;
  strokes: number;
}

export interface ScoreCard {
  courseId: number;
  layoutId: number;
  datetime: string;
  scores: Array<Score>;
}
