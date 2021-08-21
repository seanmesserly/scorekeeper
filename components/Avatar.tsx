import Link from "next/link";

const Avatar = () => {
  return (
    <Link href="/profile">
      <a>
        <div className="h-8 w-8 bg-white rounded-full flex-none cursor-pointer"></div>
      </a>
    </Link>
  );
};

export default Avatar;
