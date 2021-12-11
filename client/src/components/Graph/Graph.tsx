import React from "react";
import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../../App";

import { useQuery } from "../../hooks/useQuery";
import { ICompany, isCompany, IShareholder, isShareholder } from "../../models/models";
import {
  getInvestments,
  getInvestors,
  useGetCompany,
  useGetShareholder,
  useInvestments,
  useInvestors,
} from "../../services/apiService";
import Loading from "../Loading";
import { GraphDetailsModal } from "./GraphModal/GraphDetailsModal";
import { graphSimulation, IGraphLink, IGraphNode, ITreeDimensions, useSimpleTree } from "./GraphUtils";
import { GraphView } from "./GraphView";

const treeConfig: ITreeDimensions = {
  width: 1000,
  height: 1000,
  nodeMargins: {
    horisontal: 40,
    vertical: 120,
  },
  nodeDimensions: {
    width: 360,
    height: 150,
  },
};

const defaultSvgTranslate = "translate(0,0) scale(1)";

export interface IGraphContext {
  actions: IGraphActions;
  year: 2020 | 2019;
  limit: number;
}

export interface IGraphActions {
  loadInvestors?: (node: IGraphNode) => Promise<void>;
  loadInvestments?: (node: IGraphNode) => Promise<void>;
  resetGraph?: () => void;
  openInNewWindow?: (entity: ICompany | IShareholder) => void;
  openInNewGraph?: (entity: ICompany | IShareholder) => void;
  showDetails?: (entity: ICompany | IShareholder) => void;
}

export const GraphContext = React.createContext<IGraphContext>({
  actions: {},
  year: 2020,
  limit: 5,
});

export const Graph = () => {
  const { theme } = useContext(AppContext);

  const history = useHistory();
  const query = useQuery();

  const [year] = useState<2019 | 2020>(2020);
  const [limit] = useState<number>(5);
  const [companyId, setCompanyId] = useState<string>();
  const [shareholder_id, setShareholder_id] = useState<string>();
  const [orgnr, setOrgnr] = useState<string>();

  const [svgTranslate, setSvgTranslate] = useState("translate(0,0) scale(1)");
  const [resetZoom, setResetZoom] = useState<boolean>(true);

  // #1: Query parameters are read
  useEffect(() => {
    const c_id = query.get("_id");
    const orgnr = query.get("orgnr");
    const s_id = query.get("shareholder_id");
    setCompanyId(c_id ?? undefined);
    setOrgnr(orgnr ?? undefined);
    setShareholder_id(s_id ?? undefined);
  }, [query]);

  // #2: If there is a shareholder_id, a shareholder is retrieved
  const shareholder = useGetShareholder(shareholder_id);

  // #3: If there is a shareholder and the shareholder has an orgnr, set orgnr
  useEffect(() => {
    if (shareholder?.orgnr) setOrgnr(shareholder.orgnr);
  }, [shareholder]);

  // #4: If there is an orgnr, a company is retrieved if it exists
  const company = useGetCompany(companyId, orgnr);

  const [entity, setEntity] = useState<ICompany | IShareholder>();

  useEffect(() => {
    setEntity(company ?? shareholder);
    if (company) document.title = company.name;
    else if (shareholder) document.title = shareholder.name;
    else document.title = "Aksjegrafen";
    return () => setEntity(undefined);
  }, [company, shareholder]);

  const { investors, loading: loadingInvestors, setInvestors } = useInvestors(entity, year, 5);
  const { investments, loading: loadingInvestments, setInvestments } = useInvestments(entity, year, 5);

  const {
    nodes: treeNodes,
    setNodes: setTreeNodes,
    links: treeLinks,
    setLinks: setTreeLinks,
    creatingTree,
  } = useSimpleTree(treeConfig, entity, investors, investments);

  const [actions, setActions] = useState<IGraphActions>({});

  const [nodes, setNodes] = useState<IGraphNode[]>();
  const [links, setLinks] = useState<IGraphLink[]>();

  const [selectedEntity, setSelectedEntity] = useState<ICompany | IShareholder>();

  useEffect(() => {
    setActions({
      loadInvestors: async (node: IGraphNode) => {
        const ownerships = await getInvestors(node.entity, year, limit, node.skipInvestors);
        if (ownerships) {
          const { nodes: simulationNodes, links: simulationLinks } = graphSimulation(
            treeConfig.nodeDimensions,
            ownerships,
            node,
            nodes ?? treeNodes,
            links ?? treeLinks,
            node.y - treeConfig.nodeDimensions.height
          );
          setNodes(
            simulationNodes.map((n) => {
              if (n.id === node.id) {
                n.skipInvestors = n.skipInvestors ? n.skipInvestors + ownerships.length : ownerships.length;
              }
              return n;
            })
          );
          setLinks(simulationLinks);
        }
      },
      loadInvestments: async (node: IGraphNode) => {
        const ownerships = await getInvestments(node.entity, year, limit, node.skipInvestments);
        if (ownerships) {
          const { nodes: simulationNodes, links: simulationLinks } = graphSimulation(
            treeConfig.nodeDimensions,
            ownerships,
            node,
            nodes ?? treeNodes,
            links ?? treeLinks,
            node.y + treeConfig.nodeDimensions.height
          );
          setNodes(
            simulationNodes.map((n) => {
              if (n.id === node.id) {
                n.skipInvestments = n.skipInvestments ? n.skipInvestments + ownerships.length : ownerships.length;
              }
              return n;
            })
          );
          setLinks(simulationLinks);
        }
      },
      resetGraph: () => {
        setNodes(undefined);
        setLinks(undefined);
        setTreeNodes(undefined);
        setTreeLinks(undefined);
        setSvgTranslate(defaultSvgTranslate);
        setResetZoom(true);
        setEntity(entity ? { ...entity } : undefined);
      },
      openInNewWindow: (entity: ICompany | IShareholder) => {
        const key = isCompany(entity) ? "_id" : "shareholder_id";
        const baseUrl =
          window.location.hostname === "localhost"
            ? `http://${window.location.hostname}:${window.location.port}`
            : `https://${window.location.hostname}`;
        window.open(`${baseUrl}/graph?${key}=${entity._id}`);
      },
      showDetails: (entity: ICompany | IShareholder) => {
        setSelectedEntity(entity);
      },
      openInNewGraph: (nodeEntity: ICompany | IShareholder) => {
        setNodes(undefined);
        setLinks(undefined);
        setTreeNodes(undefined);
        setTreeLinks(undefined);
        setSvgTranslate(defaultSvgTranslate);
        setResetZoom(true);
        setEntity(nodeEntity);
        setCompanyId(undefined);
        setOrgnr(undefined);
        setShareholder_id(undefined);
        setInvestments(undefined);
        setInvestors(undefined);
        // If nodeEntity is a shareholder, use shareholderId, else assume it's a company and use _id
        history.push(
          `/graph?${isShareholder(nodeEntity) ? "shareholder_id=" + nodeEntity._id : "_id=" + nodeEntity._id}`
        );
      },
    });
  }, [
    entity,
    history,
    limit,
    links,
    nodes,
    setInvestments,
    setInvestors,
    setTreeLinks,
    setTreeNodes,
    treeLinks,
    treeNodes,
    year,
  ]);

  //TODO: Assuming here that if treeNodes and treeLinks are undefined, the graph is loading...
  if (loadingInvestments || loadingInvestors || creatingTree || !treeNodes || !treeLinks)
    return <Loading color={theme.primary} backgroundColor={theme.background} />;

  return (
    <GraphContext.Provider value={{ year, limit: 5, actions }}>
      {selectedEntity && <GraphDetailsModal entity={selectedEntity} setEntity={setSelectedEntity} />}
      <GraphView
        year={year}
        nodeDimensions={treeConfig.nodeDimensions}
        nodes={nodes ?? treeNodes}
        links={links ?? treeLinks}
        svgTranslate={svgTranslate}
        setSvgTranslate={setSvgTranslate}
        resetZoom={resetZoom}
        setResetZoom={setResetZoom}
      />
    </GraphContext.Provider>
  );
};
