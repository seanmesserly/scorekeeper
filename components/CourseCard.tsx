import { Course, Layout, ScoreCard } from "../lib/types";
import LayoutPreview from "../components/LayoutPreview";
import { useState } from "react";
import ScoreCardPreview from "./ScoreCardPreview";

interface Props {
  course: Course;
}

enum Tab {
  Layouts,
  Scores,
}

export default function CourseCard({ course }: Props) {
  const [tab, setTab] = useState(Tab.Layouts);
  const selectedTabColors = "bg-purple-400 text-white";
  const unselectedTabColors = "bg-white text-purple-400";
  const layouts: Array<Layout> = [
    {
      id: 1,
      name: "Blue Tees",
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
    {
      id: 2,
      name: "Red Tees",
      holes: [
        {
          number: 1,
          par: 3,
          distance: 180,
        },
        {
          number: 2,
          par: 3,
          distance: 166,
        },
        {
          number: 3,
          par: 4,
          distance: 252,
        },
      ],
    },
  ];
  const scores: Array<ScoreCard> = [
    {
      courseId: course.id,
      layoutId: 1,
      datetime: "2011-10-05T18:48:00.000Z",
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
    {
      courseId: course.id,
      layoutId: 2,
      datetime: "2011-11-05T10:48:00.000Z",
      scores: [
        {
          number: 1,
          strokes: 4,
        },
        {
          number: 2,
          strokes: 2,
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
          <div
            className={`w-1/2 max-w-sm border-2 border-purple-400 text-center cursor-pointer ${
              tab === Tab.Layouts ? selectedTabColors : unselectedTabColors
            }`}
          >
            <a onClick={() => setTab(Tab.Layouts)}>
              <div>Info</div>
            </a>
          </div>
          <div
            className={`w-1/2 max-w-sm border-2 border-purple-400 text-center cursor-pointer ${
              tab === Tab.Scores ? selectedTabColors : unselectedTabColors
            }`}
          >
            <a onClick={() => setTab(Tab.Scores)}>
              <div>Scores</div>
            </a>
          </div>
        </div>
      </section>
      {tab === Tab.Layouts && (
        <section>
          <ul>
            {layouts.map((layout) => (
              <li>
                <LayoutPreview layout={layout} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {tab === Tab.Scores && (
        <section>
          <ul>
            {scores.map((scoreCard) => (
              <li>
                <ScoreCardPreview
                  scoreCard={scoreCard}
                  layouts={layouts}
                  course={course}
                  key={scoreCard.datetime}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
