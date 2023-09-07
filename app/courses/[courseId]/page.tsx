"use server"

import { redirect } from 'next/navigation'
import { getNumericId } from "@lib/util";
import { RedirectType } from 'next/dist/client/components/redirect';
import * as queries from "@lib/queries"
import { getUserCookie } from "@lib/auth"
import CourseCard from '@components/CourseCard';

type Props = {
  params: {
    courseId: string
  }
}

export default async function CoursePage({ params }: Props) {
  const user = getUserCookie()
  if (!user) {
    console.log("User not logged in")
    redirect("/login", RedirectType.push)
  }

  const courseIdQuery = params.courseId;
  const courseId = getNumericId(courseIdQuery)
  if (!courseId) {
    console.log("Bad course ID")
    redirect("/", RedirectType.replace)
  }

  const course = await queries.getCourseByID(courseId)
  const layouts = await queries.getLayouts(courseId)
  const scores = await queries.getScoreCards(user.userID)

  return (
    course && (
      <CourseCard course={course} layouts={layouts} scores={scores} />
    )
  );
}
