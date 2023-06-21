import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { useGetCompany, useInvestors } from "../../services/apiService";
import { close } from "../../slices/modalSlice";
import { RootState } from "../../store";
import Loading from "../Loading";
import { OwnershipTable } from "../OwnershipTable";

export const InvestorTable = () => {
  const dispatch = useDispatch();
  const { theme } = useContext(AppContext);
  const { source } = useSelector<RootState, RootState["graph"]["data"]>((state) => state.graph.data);
  const { company, loading: isLoadingCompany } = useGetCompany(undefined, source?.properties.orgnr);
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const { investors, loading: isLoadingInvestors } = useInvestors(company, undefined, limit, skip);
  if (isLoadingCompany || isLoadingInvestors) return <Loading color={theme.primary} backgroundColor="transparent" />;
  if (investors)
    return (
      <div className="h-full overflow-auto mt-12">
        <h5 className="text-center text-lg pb-2">
          <span className="font-semibold mr-2">Aksjonærer i {company?.name}</span>{" "}
          <span style={{ color: theme.muted }}>({company?.orgnr})</span>
        </h5>
        <OwnershipTable investment={company} ownerships={investors} closeModal={() => dispatch(close())} />
        <div className="w-full flex justify-between pt-2">
          <button
            className="rounded text-white p-2"
            style={{ backgroundColor: skip < limit ? theme.muted : theme.primary }}
            disabled={skip < limit}
            onClick={() => {
              if (skip >= limit) setSkip(skip - limit);
            }}
          >
            Forrige {limit}
          </button>
          <button
            className="rounded text-white p-2"
            style={{
              backgroundColor: !!(((investors?.length ?? 0) + (investors?.length ?? 0)) % limit)
                ? theme.muted
                : theme.primary,
            }}
            disabled={!!(((investors?.length ?? 0) + (investors?.length ?? 0)) % limit)}
            onClick={() => {
              if (!(((investors?.length ?? 0) + (investors?.length ?? 0)) % limit)) setSkip(skip + limit);
            }}
          >
            Neste {limit}
          </button>
        </div>
      </div>
    );
  return <p>Noe ser ut til å være galt...🤔</p>;
};
