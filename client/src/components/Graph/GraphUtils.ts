import { useEffect, useLayoutEffect, useState } from "react";
import { select, zoom, forceSimulation, SimulationNodeDatum, Simulation, forceManyBody, forceX, forceY, forceCollide, tree, hierarchy } from "d3";
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

export type IForceSimulationNode = { id: string; entity: ICompany | IShareholder } & INodeDimensions & SimulationNodeDatum

export interface INodeDimensions { width: number; height: number; }

// Used to differ between ForceSimulationNode and SimpleTreeNode. Update if strict type guard is needed
export const isForceSimulationNode = (o: any): o is IForceSimulationNode => {
    return o && o.id && o.entity;
}

export const isSimpleTreeNode = (o: any): o is ISimpleTreeNode => {
    return o && o.data;
}

export const useForceSimulation = (width: number, height: number, entity?: ICompany | IShareholder, ownerships?: IOwnership[]) => {
    const [simulation, setSimulation] = useState<Simulation<IForceSimulationNode, undefined>>()
    const [nodes, setNodes] = useState<IForceSimulationNode[]>()

    useEffect(() => {
        if (entity && ownerships) {
            const nodeDimensions = { width, height };
            const o = [...ownerships.map(o => {
                if (o.company) return { entity: o.company, id: o._id, ...nodeDimensions }
                else if (o.shareholder) return { entity: o.shareholder, id: o._id, ...nodeDimensions }
                else return null;
            })];
            const oFiltered = o.filter(o_ => o_ !== null) as ({ id: string, entity: ICompany | IShareholder } & INodeDimensions)[];
            const simulation = forceSimulation<IForceSimulationNode>()
                .nodes(
                    [
                        ...oFiltered,
                        {
                            id: entity._id,
                            entity,
                            ...nodeDimensions,
                            fx: 500 - (width - 2) / 2,
                            fy: 500 - height / 2,
                        }
                    ]
                )
                .force('x', forceX(100))
                .force('y', forceY(100))
                .force("collide", forceCollide(200))
                .force('charge', forceManyBody().strength(-100))
                .tick(100)
            setSimulation(simulation);
            setNodes(simulation?.nodes())
        }
        return () => {
            setSimulation(undefined);
            setNodes(undefined);
        };
    }, [entity, height, ownerships, width])

    return { simulation, nodes };
}

export interface ITreeDimensions {
    width: number;
    height: number;
    nodeMargins: {
        horisontal: number;
        vertical: number;
    },
    nodeDimensions: INodeDimensions;
}

export type ISimpleTreeNode = d3.HierarchyPointNode<ISimpleTreeDatum> & { fx?: number, fy?: number };
type ISimpleTreeLink = d3.HierarchyPointLink<ISimpleTreeDatum>;

interface ISimpleTreeDatum {
    id: string;
    entity: ICompany | IShareholder | IOwnership;
    children?: ISimpleTreeDatum[]
}

export const useSimpleTree = (treeConfig: ITreeDimensions, entity?: ICompany | IShareholder, investors?: IOwnership[], investments?: IOwnership[]) => {

    const [nodes, setNodes] = useState<ISimpleTreeNode[]>();

    const [investorNodes, setInvestorNodes] = useState<ISimpleTreeNode[]>();
    const [investorLinks, setInvestorLinks] = useState<ISimpleTreeLink[]>();
    const [investmentNodes, setInvestmentNodes] = useState<ISimpleTreeNode[]>();
    const [investmentLinks, setInvestmentLinks] = useState<ISimpleTreeLink[]>();

    // Creating investor tree
    useEffect(() => {
        if (entity && investors) {
            const investorTree = tree<ISimpleTreeDatum>();
            investorTree.size([treeConfig.width, treeConfig.height]);
            investorTree.nodeSize([
                treeConfig.nodeDimensions.width + treeConfig.nodeMargins.horisontal,
                treeConfig.nodeDimensions.height + treeConfig.nodeMargins.vertical,
            ]);
            const root: ISimpleTreeNode =
                investorTree(
                    hierarchy<ISimpleTreeDatum>({
                        id: entity.orgnr ?? (entity as IShareholder).id,
                        entity,
                        children: [...investors.map(o => ({ entity: o, id: o.orgnr ?? o.shareHolderId }))],
                    })
                );

            const nodes = root.descendants();

            // Centering tree, turning it "upside down" and adding top margin
            nodes.forEach((node) => {
                node.x += treeConfig.width / 2 - treeConfig.nodeDimensions.width / 2;
                node.y = treeConfig.height - node.y - treeConfig.height / 2 - treeConfig.nodeDimensions.height / 2;
            });

            setInvestorLinks(root.links());
            setInvestorNodes(nodes);
        }
        return () => {
            setInvestorNodes(undefined);
            setInvestorLinks(undefined);
        }
    }, [treeConfig, entity, investors]);

    // Creating investment tree
    useEffect(() => {
        if (entity && investments) {
            const investmentTree = tree();
            investmentTree.size([treeConfig.width, treeConfig.height]);
            investmentTree.nodeSize([
                treeConfig.nodeDimensions.width + treeConfig.nodeMargins.horisontal,
                treeConfig.nodeDimensions.height + treeConfig.nodeMargins.vertical,
            ]);
            const root: ISimpleTreeNode =
                investmentTree(
                    hierarchy({
                        entity,
                        children: [...investments.map(o => ({ entity: o, id: o.orgnr ?? o.shareHolderId }))],
                    })
                ) as ISimpleTreeNode

            const nodes: ISimpleTreeNode[] = root.descendants();

            // Aligning company tree with shareholder tree
            nodes.forEach((node) => {
                node.x += treeConfig.width / 2 - treeConfig.nodeDimensions.width / 2;
                node.y = node.y + treeConfig.height / 2 - treeConfig.nodeDimensions.height / 2;
                // Adding fx and fy in order to fix the nodes to position when using them in force simulation
                node.fx = node.x;
                node.fy = node.y;
            });

            setInvestmentLinks(root.links());
            setInvestmentNodes(nodes);
        }
        return () => {
            setInvestmentNodes(undefined);
            setInvestmentLinks(undefined);
        }
    }, [investments, entity, treeConfig]);

    useEffect(() => {
        if (investorNodes && investmentNodes) setNodes([...investmentNodes.slice(1), ...investorNodes]);
        else if (investorNodes) setNodes(investorNodes);
        else if (investmentNodes) setNodes(investmentNodes);
    }, [investmentNodes, investorNodes])

    return { nodes, investorNodes, investorLinks, setInvestorLinks, investmentNodes, investmentLinks, setInvestmentLinks }
}