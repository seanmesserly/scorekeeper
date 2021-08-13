import Avatar from "./Avatar";
import SKLogo from "./SKLogo";

const Searchbar = () => {
  return (
    <div className="flex items-center w-full md:w-1/2  xl:w-1/3 px-4 bg-gray-100 hover:bg-white active:bg-white shadow-sm hover:shadow-lg rounded-full mx-8 my-1">
      <svg
        className="h-6 w-6 mr-2 text-gray-500 flex-none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        placeholder="Search locations and courses"
        className="flex-grow py-2 pl-2 border-l border-gray-300 text-gray-600 placeholder-gray-400 bg-transparent outline-none truncate"
      />
    </div>
  );
};

const Header = () => {
  return (
    <nav className="flex justify-between items-center px-4 py-2 bg-gray-700">
      <SKLogo />

      <Searchbar />

      <Avatar />
    </nav>
  );
};

export default Header;
