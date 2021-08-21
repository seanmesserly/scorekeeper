import Layout from "../components/Layout";
import Searchbar from "../components/Searchbar";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center space-y-5">
        <h1 className="text-2xl font-medium">Welcome to Scorekeeper!</h1>
        <p>Start by searching for a course or location below </p>
        <Searchbar />
      </div>
    </Layout>
  );
}
