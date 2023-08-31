import Link from "next/link";

const Avatar = () => {
  return (
    <Link href="/profile">
      <div className="h-8 w-8 bg-white rounded-full flex-none cursor-pointer"></div>
    </Link>
  );
};

export default Avatar;
