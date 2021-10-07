import { useEffect, useLayoutEffect, useState } from "react";
import { select, zoom, forceSimulation, SimulationNodeDatum, Simulation, forceManyBody, forceX, forceY, forceCollide } from "d3";
import { GraphNodeEntity, ICompany, IOwnership } from "../../models/models";

export const useZoom = (svgEl?: React.RefObject<SVGSVGElement>) => {

    const [svgTranslate, setSvgTranslate] = useState("translate(0,0) scale(1)");

    useLayoutEffect(() => {
        if (svgEl) {
            const svg: any = select(svgEl.current);
            const z = zoom().on("zoom", zoomed);
            svg.call(z);
        }
    });

    const zoomed = (event: any) => {
        let svgTransform = event.transform;
        setSvgTranslate(
            `translate(${svgTransform.x},${svgTransform.y}) scale(${svgTransform.k})`
        );
    };

    return svgTranslate
}

export const useForceSimulation = (company?: ICompany, ownerships?: IOwnership[]) => {
    const [simulation, setSimulation] = useState<Simulation<Partial<IOwnership & GraphNodeEntity> & SimulationNodeDatum, undefined>>()

    useEffect(() => {
        if (company && ownerships) {
            setSimulation(
                forceSimulation<Partial<IOwnership & GraphNodeEntity> & SimulationNodeDatum>()
                    .nodes(
                        [...ownerships.map(o => ({ ...o, id: o._id })), {
                            company,
                            fx: 500 - (400 - 2) / 2,
                            fy: 500 - 200 / 2,
                        }]
                    )
                    .force('x', forceX(500 / 2))
                    .force('y', forceY(500 / 2))
                    .force("collide", forceCollide(200))
                    .force('charge', forceManyBody().strength(-100))
                    .tick(100)
            )
        }
        return () => setSimulation(undefined);
    }, [company, ownerships])
    return simulation
}