import Link from "next/link";

const SKLogo = () => (
  <h1 className="font-semibold tracking-tight font-mono text-xl sm:text-2xl text-purple-100 cursor-pointer">
    <Link href="/">
      score<span className="text-purple-300">keeper</span>
    </Link>
  </h1>
);

export default SKLogo;
