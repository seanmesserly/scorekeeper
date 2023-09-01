import CourseCard from "@components/CourseCard";
import { getNumericId } from "@lib/util";
import * as queries from "@lib/queries"

type Props = {
  params: {
    courseId: string
  }
}

export default async function CoursePage({ params }: Props) {
  console.log(`Loading courses page`)
  const courseIdQuery = params.courseId;
  const courseId = getNumericId(courseIdQuery)
  if (!courseId) {
    // TODO redirect or something
    return "Bad ID"
  }

  // TODO: Get real ID when login is added
  const userId = 1;

  const course = await queries.getCourseByID(courseId)
  const layouts = await queries.getLayouts(courseId)
  const scores = await queries.getScoreCards(userId)

  return (
    course && (
      <CourseCard course={course} layouts={layouts} scores={scores} />
    )
  );
}
