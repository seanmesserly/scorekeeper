import { Course, Layout, ScoreCard } from "../lib/types";
import LayoutPreview from "../components/LayoutPreview";
import { useState } from "react";

interface Props {
  course: Course;
}

enum Tab {
  Layouts,
  Scores
}

export default function CourseCard({ course }: Props) {
  const [tab, setTab] = useState(Tab.Layouts);
  const selectedTabColors = "bg-purple-400 text-white"
  const unselectedTabColors = "bg-white text-purple-400"
  const layouts: Array<Layout> = [
    {
      id: 1,
      name: "blue tees",
      holes: [
        {
          number: 1,
          par: 3,
          distance: 215,
        },
        {
          number: 2,
          par: 3,
          distance: 185,
        },
        {
          number: 3,
          par: 3,
          distance: 302,
        },
      ],
    },
  ];
  const scores: Array<ScoreCard> = [
    {
      courseId: course.id,
      layoutId: 1,
      datetime: "2011-10-05T14:48:00.000Z",
      scores: [
        {
          number: 1,
          strokes: 3,
        },
        {
          number: 2,
          strokes: 4,
        },
        {
          number: 3,
          strokes: 5,
        },
      ],
    },
  ];
  return (
    <div>
      <header className="mb-4">
        <h1 className="text-xl font-bold">{course.name}</h1>
        <div className="text-md text-gray-400">
          {course.city}, {course.state}
        </div>
      </header>
      <section>
        <div className="flex flex-row mb-4">
          <div className={`w-1/2 max-w-sm border-2 border-purple-400 text-center cursor-pointer ${tab === Tab.Layouts ? selectedTabColors : unselectedTabColors}`}><a onClick={() => setTab(Tab.Layouts)}><div>Info</div></a></div>
          <div className={`w-1/2 max-w-sm border-2 border-purple-400 text-center cursor-pointer ${tab === Tab.Scores ? selectedTabColors : unselectedTabColors}`}><a onClick={() => setTab(Tab.Scores)}><div>Scores</div></a></div>
        </div>
      </section>
      {tab === Tab.Layouts && (<section>
        <ul>
          {layouts.map((layout) => (
              <li>
                <LayoutPreview layout={layout} />
              </li>
            )
          )}
        </ul>
      </section>)}
      {tab === Tab.Scores && (<section>
        <ul>
          {scores.map((scoreCard) => {
            const date = new Date(scoreCard.datetime);
            const month = date.toLocaleString("default", { month: "long" });
            const dateString = `${month} ${date.getDay()}, ${date.getFullYear()}`;
            const layout = layouts.find(
              (layout) => layout.id === scoreCard.layoutId
            );
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
              <li>
                <p>
                  {dateString} | {layout.name} |{" "}
                  <span className={`${scoreColor} px-1`}>
                    {totalStrokes - totalPar}
                  </span>
                </p>
              </li>
            );
          })}
        </ul>
      </section>)}
      <section className="bg-gray-200">
        Coordinates: {course.lat}, {course.lon}
      </section>
    </div>
  );
}
