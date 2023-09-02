import Link from "next/link";
import Avatar from "./Avatar";
import SKLogo from "./SKLogo";

const Header = () => {
  //TODO: Get this from auth
  const userId = 1;

  return (
    <nav className="flex w-screen justify-between items-center px-4 py-2 bg-gray-700 shadow-lg">
      <SKLogo />
      <div className="flex flex-row space-x-5 items-center text-purple-300">
        <Link
          href={`/profile/${userId}/scores/new`}
          className="block bg-purple-500 text-white px-3 py-2 rounded"
        >
          Create
        </Link>
        {/* //TODO: conditionally render these based on if user is logged in */}
        <Link href={"/register"}>Register</Link>
        <Link href={"/login"}>Login</Link>
        <Avatar />
      </div>
    </nav>
  );
};

export default Header;
