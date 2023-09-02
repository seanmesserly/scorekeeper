import { getScoreCards } from "@lib/queries";
import { getNumericId } from "@lib/util";

type Params = {
  params: {
    userId: string;
  };
};

const ScoresPage = async ({ params }: Params) => {
  const userId = getNumericId(params.userId);
  if (!userId) {
    return "User not found";
  }
  const scoreCards = await getScoreCards(userId);
  console.log({ scoreCards });

  //TODO: Display paginated scores

  return <main>View all score cards here</main>;
};

export default ScoresPage;
