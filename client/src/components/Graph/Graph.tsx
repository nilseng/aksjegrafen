import React from "react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";

import { useQuery } from "../../hooks/useQuery";
import { ICompany, IShareholder } from "../../models/models";
import {
  getInvestments,
  getInvestors,
  useGetCompany,
  useGetShareholder,
  useInvestments,
  useInvestors,
} from "../../services/apiService";
import Loading from "../Loading";
import {
  graphSimulation,
  IGraphLink,
  IGraphNode,
  ITreeDimensions,
  useSimpleTree,
} from "./GraphUtils";
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
    height: 180,
  },
};

const defaultSvgTranslate = "translate(0,0) scale(1)";

export interface IGraphContext {
  actions: IGraphActions;
  year: 2020 | 2019;
  limit: number;
}

export interface IGraphActions {
  loadInvestors?: (entity: ICompany | IShareholder) => Promise<void>;
  loadInvestments?: (entity: ICompany | IShareholder) => Promise<void>;
  resetGraph?: () => void;
}

export const GraphContext = React.createContext<IGraphContext>({
  actions: {},
  year: 2020,
  limit: 5,
});

export const Graph = () => {
  const { theme } = useContext(AppContext);

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
  }, [company, shareholder]);

  const { investors, loading: loadingInvestors } = useInvestors(
    company,
    year,
    5
  );
  const { investments, loading: loadingInvestments } = useInvestments(
    entity,
    year,
    5
  );

  const {
    nodes: treeNodes,
    links: treeLinks,
    creatingTree,
  } = useSimpleTree(treeConfig, entity, investors, investments);

  const [actions, setActions] = useState<IGraphActions>({});

  const [nodes, setNodes] = useState<IGraphNode[]>();
  const [links, setLinks] = useState<IGraphLink[]>();

  useEffect(() => {
    setActions({
      loadInvestors: async (entity: ICompany | IShareholder) => {
        const ownerships = await getInvestors(entity, year, limit);
        if (ownerships) {
          const { nodes: simulationNodes, links: simulationLinks } =
            graphSimulation(
              treeConfig.nodeDimensions,
              ownerships,
              nodes ?? treeNodes,
              links ?? treeLinks
            );
          setNodes(simulationNodes);
          setLinks(simulationLinks);
        }
      },
      loadInvestments: async (entity: ICompany | IShareholder) => {
        const ownerships = await getInvestments(entity, year, limit);
        if (ownerships) {
          const { nodes: simulationNodes, links: simulationLinks } =
            graphSimulation(
              treeConfig.nodeDimensions,
              ownerships,
              nodes ?? treeNodes,
              links ?? treeLinks
            );
          setNodes(simulationNodes);
          setLinks(simulationLinks);
        }
      },
      resetGraph: () => {
        setNodes(undefined);
        setLinks(undefined);
        setSvgTranslate(defaultSvgTranslate);
        setResetZoom(true);
      },
    });
  }, [limit, links, nodes, treeLinks, treeNodes, year]);

  if (loadingInvestments || loadingInvestors || creatingTree)
    return <Loading color={theme.primary} backgroundColor={theme.background} />;

  if (!treeNodes || !treeLinks) {
    return (
      <p className="container mt-5" style={{ color: theme.text }}>
        Oh, noes! Something went terribly wrong.
      </p>
    );
  }

  return (
    <GraphContext.Provider value={{ year, limit: 5, actions }}>
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
