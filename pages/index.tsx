import Layout from "../components/Layout";
import Image from "next/image";
import SKLogo from "../components/SKLogo";

export default function Home() {
  return (
    <Layout>
      <h1 className="text-2xl font-medium">Welcome to Scorekeeper!</h1>
      <p>Let's get started.</p>
    </Layout>
  );
}
