import { getNumericId } from "@lib/util";
import Link from "next/link";

type Params = {
  params: {
    userId: string;
  };
};

const profile = ({ params }: Params) => {
  const userId = getNumericId(params.userId);
  if (!userId) {
    return "Failed to find user";
  }

  //TODO: show user metadata, allow edits, either show scores here or maybe a few previews

  return (
    <main>
      <h1>Test profile page</h1>
      <p>
        View score cards <Link href={`/profile/${userId}/scores`}>here</Link>
      </p>
    </main>
  );
};

export default profile;
