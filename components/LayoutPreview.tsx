import { Hole, Layout } from "../lib/types";

interface Props {
  layout: Layout;
}
export default function LayoutPreview({ layout }: Props) {
  const totalPar = layout.holes
    .map((hole) => hole.par)
    .reduce((total, par) => total + par);
  const totalDistance = layout.holes
    .map((hole) => hole.distance)
    .reduce((total, distance) => total + distance);

  const partitionHoles = (
    arr: Array<Hole>,
    width: number
  ): Array<Array<Hole>> =>
    arr.length <= width ?
      [arr] :
      [arr.slice(0, width)].concat(partitionHoles(arr.slice(width), width));

  const groupedHoles = partitionHoles(layout.holes, 9);

  return (
    <div className="border-t-2 py-2">
      <section>
        <h1 className="text-lg font-bold">{layout.name}</h1>
        {layout.holes.length} holes | Par {totalPar} | {totalDistance} ft
      </section>
      <section className="text-xs flex flex-col space-y-3">
        {groupedHoles.map((holeList, idx) => (
          <section key={idx} className="flex flex-row">
            <div className="text-left text-gray-400 flex flex-col mr-3">
              <p>Hole</p>
              <p>Dist</p>
              <p>Par</p>
            </div>
            {holeList.map((hole, holeIdx) => (
              <div key={holeIdx} className="text-center flex flex-col mx-1">
                <p className="font-bold">{hole.number}</p>
                <p className="text-gray-400">{hole.distance}</p>
                <p className="text-gray-400">{hole.par}</p>
              </div>
            ))}
          </section>
        ))}
      </section>
    </div>
  );
}
