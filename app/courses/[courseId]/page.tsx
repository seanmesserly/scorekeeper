"use client"

import { useEffect, useState } from "react";
import CourseCard from "@components/CourseCard";
import { getCourse, getLayouts, getScoreCards } from "@lib/util";
import { Course, Layout as CourseLayout, ScoreCard } from "@lib/types";

const logErr = (err: any) => {
  console.error(err);
};

type Props = {
  params: {
    courseId: string
  }
}

export default function CoursePage({ params }: Props) {
  console.log(`Loading courses page`)
  const courseIdQuery = params.courseId;
  const [course, setCourse] = useState<Course>();
  const [layouts, setLayouts] = useState<CourseLayout[]>([]);
  const [scores, setScores] = useState<ScoreCard[]>([]);

  const courseId = courseIdQuery?.toString();

  // TODO: Get real ID when login is added
  const userId = "1";

  useEffect(() => {
    if (!courseId) {
      return;
    }
    getCourse(courseId).then(setCourse).catch(logErr);
    getLayouts(courseId).then(setLayouts).catch(logErr);
    getScoreCards(userId).then(setScores).catch(logErr);
  }, [courseId, userId]);

  return (
    course && (
      <CourseCard course={course} layouts={layouts} scores={scores} />
    )
  );
}
