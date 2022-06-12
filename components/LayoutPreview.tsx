import { Hole, Layout} from "../lib/types";

interface Props {
    layout: Layout;
}
export default function LayoutPreview({ layout }: Props) {
    const totalPar = layout.holes.map(hole => hole.par).reduce((total, par) => total + par);
    const totalDistance = layout.holes.map(hole => hole.distance).reduce((total, distance) => total + distance);

    const partitionHoles = (arr: Array<Hole>, width: number): Array<Array<Hole>> => 
    arr.reduce((rows, key, index) => (index % width == 0 ? rows.push([key]) 
      : rows[rows.length-1].push(key)) && rows, []);

    const groupedHoles = partitionHoles(layout.holes, 9);
    
    return (
        <div className="border-y-2 py-2">
            <section>
                <h1 className="text-lg font-bold">{layout.name}</h1>
                {layout.holes.length} holes | Par {totalPar} | {totalDistance} ft
            </section>
            <section className="text-xs">
                {groupedHoles.map(holeList => (
                    <div className="flex flex-row">
                        <div className="text-right text-gray-400 flex flex-col mr-3">
                            <div>Hole</div>
                            <div>Dist</div>
                            <div>Par</div>
                        </div>
                        {holeList.map(hole => (
                            <div className="text-center flex flex-col mx-1">
                                <div className="font-bold">{hole.number}</div>
                                <div className="text-gray-400">{hole.distance}</div>
                                <div className="text-gray-400">{hole.par}</div>
                            </div>
                        ))}
                    </div>
                ))}
            </section>
        </div>
    )
}