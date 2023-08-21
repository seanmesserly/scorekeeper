import { Course, Layout, ScoreCard } from "../lib/types";

interface Props {
  scoreCard: ScoreCard;
  layouts: Array<Layout>;
  course: Course;
}

export default function ScoreCardPreview({
  scoreCard,
  layouts,
  course,
}: Props) {
  const date = new Date(scoreCard.datetime);
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const month = date.toLocaleString("default", { month: "long" });
  const dateString = `${month} ${date.getDay()}, ${date.getFullYear()} ${time}`;
  const layout = layouts.find((layout) => layout.id === scoreCard.layoutID);
  const totalPar = layout.holes
    .map((layout) => layout.par)
    .reduce((total, par) => total + par);
  const totalStrokes = scoreCard.scores
    .map((score) => score.strokes)
    .reduce((total, strokes) => total + strokes);
  const finalScore = totalStrokes - totalPar;
  // Do this better
  let scoreColor = "bg-white-200";
  if (finalScore > 0) {
    scoreColor = "bg-red-200";
  } else if (finalScore < 0) {
    scoreColor = "bg-green-200";
  }
  return (
    <div className="border-t-2 py-2">
      <section>
        <div className="text-lg">
          <span className="font-bold">{course.name}</span> |{" "}
          <span>{layout.name}</span>
        </div>
        <div className="text-gray-400 text-sm">
          <span>{dateString}</span> | <span>{layout.holes.length} holes</span>
        </div>
      </section>
      <section>
        <div>
          <span className="font-bold">
            {finalScore >= 0 ? "+" : ""}
            {finalScore}
          </span>{" "}
          ({totalStrokes})
        </div>
      </section>
    </div>
  );
}
