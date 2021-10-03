import * as d3 from "d3";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../../App";
import { useQuery } from "../../hooks/useQuery";
import {
  useGetCompany,
  useGetShareholder,
  useOwnershipCount,
} from "../../services/apiService";
import Loading from "../Loading";
import { GraphNode } from "./GraphNode";

const nodeWidth = 200;
const nodeHeight = 100;

export const Graph = () => {
  const { theme } = useContext(AppContext);

  const query = useQuery();

  const [year] = useState<2019 | 2020>(2020);
  const [companyId, setCompanyId] = useState<string>();
  const [shareholder_id, setShareholder_id] = useState<string>();
  const [orgnr, setOrgnr] = useState<string>();
  const company = useGetCompany(companyId, orgnr);
  const shareholder = useGetShareholder(shareholder_id);
  const { count: ownerCount, loading: loadingOwnerCount } = useOwnershipCount(
    company,
    year
  );

  useEffect(() => {
    const c_id = query.get("_id");
    const orgnr = query.get("orgnr");
    const s_id = query.get("shareholder_id");
    setCompanyId(c_id ?? undefined);
    setOrgnr(orgnr ?? undefined);
    setShareholder_id(s_id ?? undefined);
  }, [query]);

  useEffect(() => {
    if (shareholder?.orgnr) setOrgnr(shareholder.orgnr);
  }, [shareholder]);

  const svgRef = useRef<SVGSVGElement>(null);
  const [svgTranslate, setSvgTranslate] = useState("translate(0,0) scale(1)");

  useLayoutEffect(() => {
    const svg: any = d3.select(svgRef.current);
    const zoom = d3.zoom().on("zoom", zoomed);
    svg.call(zoom);
  });

  const zoomed = (event: any) => {
    let svgTransform = event.transform;
    if (svgTransform.k >= 4) {
      svgTransform.k = 4;
      return;
    }
    setSvgTranslate(
      `translate(${svgTransform.x},${svgTransform.y}) scale(${svgTransform.k})`
    );
  };

  if (loadingOwnerCount)
    return <Loading color={theme.primary} backgroundColor={theme.background} />;

  return (
    <div className="d-flex w-100 h-100 p-sm-5 p-2">
      <div
        className="d-flex w-100"
        style={{ ...theme.lowering, height: "90%" }}
      >
        <svg ref={svgRef} height="100%" width="100%" viewBox={"0 0 1000 1000"}>
          <g transform={svgTranslate}>
            <GraphNode
              data={{ entity: { ...company, ...shareholder }, ownerCount }}
              x={500 - (nodeWidth - 2) / 2}
              y={500 - nodeHeight / 2}
              width={nodeWidth - 2}
              height={nodeHeight - 2}
            />
          </g>
        </svg>
      </div>
    </div>
  );
};
