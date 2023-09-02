import Link from "next/link";
import Avatar from "./Avatar";
import SKLogo from "./SKLogo";

const Header = () => {
  return (
    <nav className="flex w-screen justify-between items-center px-4 py-2 bg-gray-700 shadow-lg">
      <SKLogo />
      <div>
        <Link href={"/register"}>Register</Link>
        <Avatar />
      </div>
    </nav>
  );
};

export default Header;
