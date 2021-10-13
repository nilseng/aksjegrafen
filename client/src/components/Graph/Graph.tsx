import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";

import { useQuery } from "../../hooks/useQuery";
import { ICompany, IShareholder } from "../../models/models";
import {
  useGetCompany,
  useGetShareholder,
  useInvestments,
  useInvestors,
} from "../../services/apiService";
import Loading from "../Loading";
import {
  ITreeDimensions,
  //useForceSimulation,
  useSimpleTree,
} from "./GraphUtils";
import { GraphView } from "./GraphView";

const treeConfig: ITreeDimensions = {
  width: 1000,
  height: 1000,
  nodeMargins: {
    horisontal: 0,
    vertical: 100,
  },
  nodeDimensions: {
    width: 400,
    height: 240,
  },
};

export const Graph = () => {
  const { theme } = useContext(AppContext);

  const query = useQuery();

  const [year] = useState<2019 | 2020>(2020);
  const [companyId, setCompanyId] = useState<string>();
  const [shareholder_id, setShareholder_id] = useState<string>();
  const [orgnr, setOrgnr] = useState<string>();

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
  /* const [ownerships, setOwnerships] = useState<IOwnership[]>();

  useEffect(() => {
    const o = [];
    if (investors) o.push(...investors);
    if (investments) o.push(...investments);
    setOwnerships(o);
  }, [investors, investments]); */

  /* const { nodes } = useForceSimulation(
    nodeWidth,
    nodeHeight,
    entity,
    ownerships
  ); */

  const { nodes } = useSimpleTree(treeConfig, entity, investors, investments);

  if (loadingInvestments || loadingInvestors)
    return <Loading color={theme.primary} backgroundColor={theme.background} />;

  if (!nodes) return null;

  return <GraphView nodeDimensions={treeConfig.nodeDimensions} nodes={nodes} />;
};
