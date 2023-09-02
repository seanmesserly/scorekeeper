import Link from "next/link";

const Avatar = () => {
  // TODO: Get this from auth
  const userId = 1
  return (
    <Link href={`/profile/${userId}`}>
      <div className="h-8 w-8 bg-white rounded-full flex-none cursor-pointer"></div>
    </Link>
  );
};

export default Avatar;
