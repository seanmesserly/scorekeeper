import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Course, getCourse } from "../../lib/util";

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
        <div>{course.name}</div>
      </Layout>
    )
  );
}
