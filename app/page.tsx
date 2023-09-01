import Searchbar from "@components/Searchbar";
import * as queries from "@lib/queries";

export default async function Home() {
  const courses = await queries.getCourses()

  return (
    <main className="mt-5 flex flex-col items-center space-y-5">
      <h1 className="text-2xl font-medium">Welcome to Scorekeeper!</h1>
      <p>Start by searching for a course or location below </p>
      <Searchbar courses={courses} />
    </main>
  );
}
