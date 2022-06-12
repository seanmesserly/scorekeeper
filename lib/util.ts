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

interface CourseListItem {
  id: number;
  name: string;
}
export async function listCourses(): Promise<Array<CourseListItem>> {
  const response = await (await fetch("/api/courses")).json();
  console.log(response);
  return response.courses.map((course) => {
    return {
      id: course.id,
      name: course.name,
    };
  });
}
