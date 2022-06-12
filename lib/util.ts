export function getNumericId(param: string | string[]): number | null {
  if (param instanceof Array) {
    return null;
  }
  const id = parseInt(param);
  if (isNaN(id)) {
    return null;
  }
  return id;
}

export interface Course {
  id: number;
  name: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
}

export async function listCourses(): Promise<Array<Course>> {
  const response = await fetch("/api/courses");
  const data = await response.json();
  console.log(data);
  return data.courses.map((course) => {
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
  const { course } = await response.json();
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
