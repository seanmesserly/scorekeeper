import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CourseCard from "../../components/CourseCard";
import Layout from "../../components/Layout";
import { getCourse } from "../../lib/util";
import { Course } from "../../lib/types";

export default function CoursePage() {
  const router = useRouter();
  const { courseId } = router.query;
  const [course, setCourse] = useState<Course>();

  useEffect(() => {
    if (!courseId) {
      return;
    }
    getCourse(courseId.toString())
      .then((c) => setCourse(c))
      .catch((err) => {
        console.error(err);
      });
  }, [courseId]);

  return (
    course && (
      <Layout>
        <CourseCard course={course} />
      </Layout>
    )
  );
}
