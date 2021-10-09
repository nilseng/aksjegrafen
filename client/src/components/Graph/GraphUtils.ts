import { useEffect, useLayoutEffect, useState } from "react";
import { select, zoom, forceSimulation, SimulationNodeDatum, Simulation, forceManyBody, forceX, forceY, forceCollide } from "d3";
import { ICompany, IOwnership, IShareholder } from "../../models/models";

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

export const useForceSimulation = (entity?: ICompany | IShareholder, ownerships?: IOwnership[]) => {
    const [simulation, setSimulation] = useState<Simulation<{ id: string, entity: ICompany | IShareholder } & SimulationNodeDatum, undefined>>()

    useEffect(() => {
        if (entity && ownerships) {
            const o = [...ownerships.map(o => {
                if (o.company) return { entity: o.company, id: o.company._id }
                else if (o.shareholder) return { entity: o.shareholder, id: o.shareholder._id }
                else return null;
            })];
            const oFiltered = o.filter(o_ => o_ !== null) as { id: string, entity: ICompany | IShareholder }[];
            setSimulation(
                forceSimulation<{ id: string, entity: ICompany | IShareholder } & SimulationNodeDatum>()
                    .nodes(
                        [
                            ...oFiltered,
                            {
                                id: entity._id,
                                entity,
                                fx: 500 - (400 - 2) / 2,
                                fy: 500 - 200 / 2,
                            }
                        ]
                    )
                    .force('x', forceX(100))
                    .force('y', forceY(100))
                    .force("collide", forceCollide(200))
                    .force('charge', forceManyBody().strength(-100))
                    .tick(100)
            );
        }
        return () => setSimulation(undefined);
    }, [entity, ownerships])

    return simulation;
}