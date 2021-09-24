import Avatar from "./Avatar";
import Searchbar from "./Searchbar";
import SKLogo from "./SKLogo";

const Header = () => {
  return (
    <nav className="flex justify-between items-center px-4 py-2 bg-gray-700 shadow-lg">
      <SKLogo />

      <Avatar />
    </nav>
  );
};

export default Header;
