import { NextResponse } from "next/server";
import { Course, Layout, ScoreCard } from "./types";
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

export async function listCourses(): Promise<Array<Course>> {
  const response = await fetch("/api/courses");
  const { courses }: { courses: Course[] } = await response.json();
  console.log(courses);
  return courses.map((course) => {
    return {
      id: course.id,
      name: course.name,
      lat: course.lat,
      lon: course.lon,
      city: course.city,
      state: course.state,
    };
  });
}

export async function getCourse(courseId: string): Promise<Course> {
  const response = await fetch(`/api/courses/${courseId}`);
  const { course }: { course: Course } = await response.json();
  console.log(course);
  return {
    id: course.id,
    name: course.name,
    lat: course.lat,
    lon: course.lon,
    city: course.city,
    state: course.state,
  };
}

export async function getLayouts(courseId: string): Promise<Layout[]> {
  const response = await fetch(`/api/courses/${courseId}/layouts`);
  const { layouts }: { layouts: Layout[] } = await response.json();
  console.log({ layouts });
  return layouts;
}

export async function getScoreCards(userId: string): Promise<ScoreCard[]> {
  const response = await fetch(`/api/users/${userId}/scores`);
  const { scoreCards }: { scoreCards: ScoreCard[] } = await response.json();
  console.log({ scoreCards });
  return scoreCards;
}
