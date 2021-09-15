import Link from "next/link";
import { useState } from "react";

const Searchbar = () => {
  const [inputFocused, setInputFocused] = useState(false);
  const [input, setInput] = useState("");

  // TODO: populate these results with backend db lookups (probably debounced)
  const results = ["hello world", "api", "what's up?"];

  return (
    <div className="relative w-full max-w-screen-sm">
      <div className="flex items-center mx-auto w-full px-4 ring-1 ring-gray-300 bg-gray-100 focus-within:bg-white hover:bg-white shadow-sm hover:shadow-lg focus-within:shadow-lg rounded-full my-1">
        <svg
          className="h-6 w-6 mr-2 text-gray-500 flex-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          onBlur={() => setInputFocused(false)}
          onFocus={() => setInputFocused(true)}
          type="search"
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search locations and courses"
          className="flex-grow py-2 pl-2 border-l border-gray-300 text-gray-600 placeholder-gray-400 bg-transparent outline-none truncate"
        />
      </div>
      <ul
        className={`absolute top-11 left-12 w-10/12 bg-white rounded-b-lg border border-t-0 border-gray-300 ${
          inputFocused && input.length > 0 ? "" : "hidden"
        }`}
      >
        {results
          .filter((result) => result.includes(input))
          .map((result) => (
            <Link href={`/course/${result}`} key={result}>
              <li className="px-5 py-3 text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer">
                <a>{result}</a>
              </li>
            </Link>
          ))}
        <div className="border-t border-gray-300 bg-gray-50 text-center p-5 rounded-b-lg">
          Not seeing it here?
          <Link href="/create">
            <a className="ml-1 font-medium text-purple-500 hover:text-purple-700">
              Create a new course!
            </a>
          </Link>
        </div>
      </ul>
    </div>
  );
};

export default Searchbar;
