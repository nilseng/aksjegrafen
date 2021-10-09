import { useContext, useEffect, useRef, useState } from "react";

import { AppContext } from "../../App";
import { useQuery } from "../../hooks/useQuery";
import { ICompany, IOwnership, IShareholder } from "../../models/models";
import {
  useGetCompany,
  useGetShareholder,
  useInvestments,
  useInvestors,
} from "../../services/apiService";
import { GraphNode } from "./GraphNode";
import { useForceSimulation, useZoom } from "./GraphUtils";

const nodeWidth = 400;
const nodeHeight = 200;

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

  /* const { count: investorCount, loading: loadingOwnerCount } = useInvestorCount(
    company,
    year
  ); */

  const { investors } = useInvestors(company, year, 10);
  const { investments } = useInvestments(entity, year, 10);
  const [ownerships, setOwnerships] = useState<IOwnership[]>();

  useEffect(() => {
    const o = [];
    if (investors) o.push(...investors);
    if (investments) o.push(...investments);
    setOwnerships(o);
  }, [investors, investments]);

  const forceSimulation = useForceSimulation(entity, ownerships);

  const svgRef = useRef<SVGSVGElement>(null);
  const svgTranslate = useZoom(svgRef);

  /*   if (loadingOwnerCount)
    return <Loading color={theme.primary} backgroundColor={theme.background} />; */

  return (
    <div className="d-flex w-100 h-100 p-4">
      <div className="d-flex w-100" style={{ ...theme.lowering }}>
        <svg
          ref={svgRef}
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={"0 0 1000 1000"}
        >
          <g transform={svgTranslate}>
            {forceSimulation?.nodes()?.map((node) => {
              return (
                <GraphNode
                  key={node.index}
                  {...node}
                  width={nodeWidth - 2}
                  height={nodeHeight - 2}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
