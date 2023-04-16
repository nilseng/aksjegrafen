import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../App";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
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
import { graphSimulation, initializeGraphSimulation } from "./GraphService";
import { getDuplicateCount, IGraphDimensions, IGraphLink, IGraphNode } from "./GraphUtils";
import { GraphView } from "./GraphView";

export type Year = 2021 | 2020 | 2019;

const graphConfig: IGraphDimensions = {
  width: 1000,
  height: 1000,
  nodeDimensions: {
    width: 360,
    height: 150,
  },
};

export const defaultSvgTransform = "translate(0,0) scale(1)";

export interface IGraphContext {
  nodeActions: IGraphNodeActions;
  actions: IGraphDefaultActions;
  year: Year;
  setYear: Dispatch<SetStateAction<Year>>;
  limit: number;
  setNodes: Dispatch<SetStateAction<IGraphNode[] | undefined>>;
  setLinks: Dispatch<SetStateAction<IGraphLink[] | undefined>>;
  hoveredNode: IGraphNode | undefined;
  setHoveredNode: Dispatch<SetStateAction<IGraphNode | undefined>>;
  svgTransform: string;
  setSvgTransform: Dispatch<SetStateAction<string>>;
  resetZoom: boolean;
  setResetZoom: Dispatch<SetStateAction<boolean>>;
}

export interface IGraphNodeActions {
  loadInvestors: (node: IGraphNode) => Promise<void>;
  loadInvestments: (node: IGraphNode) => Promise<void>;
  openInNewWindow: (node: IGraphNode) => void;
  openInNewGraph: (node: IGraphNode) => void;
  showDetails: (node: IGraphNode) => void;
  showInvestorTable: (node: IGraphNode) => Promise<void>;
  showInvestmentTable: (node: IGraphNode) => Promise<void>;
}

export interface IGraphDefaultActions {
  resetGraph: () => void;
}

export const GraphContext = createContext<IGraphContext | undefined>(undefined);

export const GraphContainer = () => {
  const {
    theme,
    tableModalInput: { setInvestor, setInvestment },
  } = useContext(AppContext);

  const history = useHistory();
  const query = useQuery();

  const [year, setYear] = useState<Year>(2021);
  const [limit] = useState<number>(5);
  const [companyId, setCompanyId] = useState<string>();
  const [shareholder_id, setShareholder_id] = useState<string>();
  const [orgnr, setOrgnr] = useState<string>();

  const [svgTransform, setSvgTransform] = useState(defaultSvgTransform);
  const [resetZoom, setResetZoom] = useState<boolean>(true);

  // #1: Query parameters are read
  useEffect(() => {
    const c_id = query.get("_id");
    const orgnr = query.get("orgnr");
    const s_id = query.get("shareholder_id");
    setCompanyId(c_id ?? undefined);
    setOrgnr(orgnr ?? undefined);
    setShareholder_id(s_id ?? undefined);
    return () => {
      setCompanyId(undefined);
      setOrgnr(undefined);
      setShareholder_id(undefined);
    };
  }, [query]);

  // #2.1.1: If there is a shareholder_id, a shareholder is retrieved
  const shareholder = useGetShareholder(shareholder_id);

  // #2.1.2: If there is a shareholder and the shareholder has an orgnr, set orgnr
  useEffect(() => {
    if (shareholder?.orgnr) setOrgnr(shareholder.orgnr);
    return () => setOrgnr(undefined);
  }, [shareholder]);

  // #2.2.1 || #2.1.3: If there is an orgnr, a company is retrieved if it exists
  const company = useGetCompany(companyId, orgnr);

  const [entity, setEntity] = useState<ICompany | IShareholder>();

  useEffect(() => {
    setEntity(company ?? shareholder);
    return () => setEntity(undefined);
  }, [company, shareholder]);

  useDocumentTitle("Aksjegrafen", entity?.name);

  const { investors, loading: loadingInvestors, setInvestors } = useInvestors(entity, year, 5);
  const { investments, loading: loadingInvestments, setInvestments } = useInvestments(entity, year, 5);

  useEffect(() => {
    if (entity && !loadingInvestments && !loadingInvestors) {
      const { nodes: simulationNodes, links: simulationLinks } = initializeGraphSimulation(
        graphConfig,
        entity,
        investors,
        investments
      );
      setNodes(simulationNodes);
      setLinks(simulationLinks);
    }
    return () => {
      setNodes(undefined);
      setLinks(undefined);
    };
  }, [investors, investments, loadingInvestments, loadingInvestors, entity]);

  const [nodeActions, setNodeActions] = useState<IGraphNodeActions>();
  const [actions, setActions] = useState<IGraphDefaultActions>();

  const [nodes, setNodes] = useState<IGraphNode[]>();
  const [links, setLinks] = useState<IGraphLink[]>();

  const [hoveredNode, setHoveredNode] = useState<IGraphNode>();

  const [selectedEntity, setSelectedEntity] = useState<ICompany | IShareholder>();

  // Initializing actions for graph menu
  useEffect(() => {
    const resetState = () => {
      setNodes(undefined);
      setLinks(undefined);
      setSvgTransform(defaultSvgTransform);
      setResetZoom(true);
      setCompanyId(undefined);
      setOrgnr(undefined);
      setShareholder_id(undefined);
      setInvestments(undefined);
      setInvestors(undefined);
    };

    setActions({
      resetGraph: () => {
        resetState();
        setEntity(entity);
      },
    });

    setNodeActions({
      loadInvestors: async (node: IGraphNode) => {
        const ownerships = await getInvestors(node.entity, year, limit, node.skipInvestors);
        if (ownerships) {
          const { nodes: simulationNodes, links: simulationLinks } = graphSimulation(
            graphConfig,
            ownerships,
            node,
            nodes,
            links,
            node.y - graphConfig.nodeDimensions.height
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
          toast(`Lastet ${ownerships.length} av investorene i ${node.entity.name}`, { type: toast.TYPE.SUCCESS });
          const duplicates = getDuplicateCount(ownerships.length, nodes?.length ?? 0, simulationNodes.length);
          if (duplicates > 0) {
            toast(`${duplicates} av investorene var allerede i grafen`, { type: toast.TYPE.INFO });
          }
        }
      },
      loadInvestments: async (node: IGraphNode) => {
        const ownerships = await getInvestments(node.entity, year, limit, node.skipInvestments);
        if (ownerships) {
          const { nodes: simulationNodes, links: simulationLinks } = graphSimulation(
            graphConfig,
            ownerships,
            node,
            nodes,
            links,
            node.y + graphConfig.nodeDimensions.height
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
          toast(`Lastet ${ownerships.length} av investeringene til ${node.entity.name}`, { type: toast.TYPE.SUCCESS });
          const duplicates = getDuplicateCount(ownerships.length, nodes?.length ?? 0, simulationNodes.length);
          if (duplicates > 0) {
            toast(`${duplicates} av investeringene var allerede i grafen`, { type: toast.TYPE.INFO });
          }
        }
      },
      openInNewWindow: (node: IGraphNode) => {
        const key = isCompany(node.entity) ? "_id" : "shareholder_id";
        const baseUrl =
          window.location.hostname === "localhost"
            ? `http://${window.location.hostname}:${window.location.port}`
            : `https://${window.location.hostname}`;
        window.open(`${baseUrl}/graph?${key}=${node.entity._id}`);
      },
      showDetails: (node: IGraphNode) => {
        setSelectedEntity(node.entity);
      },
      openInNewGraph: (node: IGraphNode) => {
        resetState();
        setEntity(node.entity);
        // If nodeEntity is a shareholder, use shareholderId, else assume it's a company and use _id
        history.push(
          `/graph?${isShareholder(node.entity) ? "shareholder_id=" + node.entity._id : "_id=" + node.entity._id}`
        );
      },
      showInvestmentTable: async (node: IGraphNode) => {
        setInvestor(node.entity as IShareholder);
      },
      showInvestorTable: async (node: IGraphNode) => {
        setInvestment(node.entity);
      },
    });
  }, [entity, history, limit, links, nodes, setInvestment, setInvestments, setInvestor, setInvestors, year]);

  if (loadingInvestments || loadingInvestors || !nodes || !links || !actions || !nodeActions)
    return <Loading color={theme.primary} backgroundColor={theme.background} />;

  return (
    <GraphContext.Provider
      value={{
        year,
        setYear,
        limit: 5,
        actions,
        nodeActions,
        setNodes,
        setLinks,
        hoveredNode,
        setHoveredNode,
        svgTransform,
        setSvgTransform,
        resetZoom,
        setResetZoom,
      }}
    >
      {selectedEntity && <GraphDetailsModal entity={selectedEntity} setEntity={setSelectedEntity} />}
      <GraphView year={year} nodeDimensions={graphConfig.nodeDimensions} nodes={nodes} links={links} />
    </GraphContext.Provider>
  );
};
