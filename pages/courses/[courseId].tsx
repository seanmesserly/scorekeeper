import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CourseCard from "../../components/CourseCard";
import Layout from "../../components/Layout";
import { getCourse, getLayouts, getScoreCards } from "../../lib/util";
import { Course, Layout as CourseLayout, ScoreCard } from "../../lib/types";

const logErr = (err: any) => {
  console.error(err);
};

export default function CoursePage() {
  const router = useRouter();
  const { courseId: courseIdQuery } = router.query;
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
      <Layout>
        <CourseCard course={course} layouts={layouts} scores={scores} />
      </Layout>
    )
  );
}