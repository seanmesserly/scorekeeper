import * as queries from "@lib/queries";
import { getNumericId } from "@lib/util";

type Params = {
  params: {
    userId: string;
    scoreId: string;
  };
};

const ScorePage = async ({ params }: Params) => {
  const scoreId = getNumericId(params.scoreId);
  if (!scoreId) {
    return "Failed to parse score ID";
  }
  const scoreCard = await queries.getScoreCard(scoreId);
  console.log({ scoreCard });

  //TODO: Show scorecard and allow for edits to scores and time

  return <main>Singular score card page</main>;
};

export default ScorePage;
