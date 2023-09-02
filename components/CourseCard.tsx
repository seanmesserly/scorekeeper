"use client";

import { Course, Layout, ScoreCard } from "../lib/types";
import LayoutPreview from "../components/LayoutPreview";
import { useState } from "react";
import ScoreCardPreview from "./ScoreCardPreview";
import Link from "next/link";

interface Props {
  course: Course;
  layouts: Layout[];
  scores: ScoreCard[];
}

enum Tab {
  Layouts,
  Scores,
}

export default function CourseCard({ course, layouts, scores }: Props) {
  const [tab, setTab] = useState(Tab.Layouts);
  const selectedTabColors = "bg-purple-400 text-white";
  const unselectedTabColors = "bg-white text-purple-400";
  //TODO: Get real user ID
  const userId = 1;

  return (
    <>
      <header className="mb-4">
        <h1 className="text-xl font-bold">{course.name}</h1>
        <h2 className="text-md text-gray-400">
          {course.city}, {course.state}
        </h2>
      </header>
      <section className="flex flex-row mb-4">
        <button
          onClick={() => setTab(Tab.Layouts)}
          className={`w-1/2 max-w-sm border-2 border-purple-400 text-center cursor-pointer ${
            tab === Tab.Layouts ? selectedTabColors : unselectedTabColors
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setTab(Tab.Scores)}
          className={`w-1/2 max-w-sm border-2 border-purple-400 text-center cursor-pointer ${
            tab === Tab.Scores ? selectedTabColors : unselectedTabColors
          }`}
        >
          Scores
        </button>
      </section>
      {tab === Tab.Layouts && (
        <section>
          <ul>
            {layouts.map((layout) => (
              <li key={layout.id}>
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
              <li
                key={
                  scoreCard.courseID + scoreCard.layoutID + scoreCard.datetime
                }
              >
                <Link href={`/profile/${userId}/scores/${scoreCard.id}`}>
                  <ScoreCardPreview
                    scoreCard={scoreCard}
                    layouts={layouts}
                    course={course}
                    key={scoreCard.datetime}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
