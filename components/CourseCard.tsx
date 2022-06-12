import { Course, Layout, ScoreCard } from "../lib/types";

interface Props {
  course: Course;
}

export default function CourseCard({ course }: Props) {
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
      <header>
        <h1 className="text-xl">{course.name}</h1>
        <div className="text-md text-gray-400">
          {course.city}, {course.state}
        </div>
      </header>
      <section>
        <ul>
          {layouts.map((layout) => {
            const totalPar = layout.holes
              .map((hole) => hole.par)
              .reduce((total, par) => total + par);
            const totalDistance = layout.holes
              .map((hole) => hole.distance)
              .reduce((total, distance) => total + distance);
            return (
              <li>
                {layout.name} | Holes: {layout.holes.length} | Par: {totalPar} |
                Distance: {totalDistance}
              </li>
            );
          })}
        </ul>
      </section>
      <section>
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
      </section>
      <section className="bg-gray-200">
        Coordinates: {course.lat}, {course.lon}
      </section>
    </div>
  );
}
