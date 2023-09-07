import Link from "next/link";
import Avatar from "./Avatar";
import SKLogo from "./SKLogo";
import { getUserCookie, logout } from "@lib/auth";

const Header = () => {
  const user = getUserCookie()
  const userExists = user !== null

  const handleLogout = async (_: FormData) => {
    "use server"
    console.log("Handle logout called")
    await logout()
  }

  return (
    <nav className="flex w-screen justify-between items-center px-4 py-2 bg-gray-700 shadow-lg">
      <SKLogo />
      {userExists && <div className="flex flex-row space-x-5 items-center text-purple-300">
        <Link
          href={`/profile/${user.userID}/scores/new`}
          className="block bg-purple-500 text-white px-3 py-2 rounded"
        >
          Create
        </Link>
        {/* Form necessary to make server actions works */}
        <form><button
          formAction={handleLogout}
        >Logout</button></form>
        <Avatar />
      </div>}
      {!userExists && <div className="flex flex-row space-x-5 items-center text-purple-300">
        <Link href={"/register"}>Register</Link>
        <Link href={"/login"}>Login</Link>
      </div>}
    </nav>
  );
};

export default Header;
