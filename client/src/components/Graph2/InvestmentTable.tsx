import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { useGetShareholder, useInvestments } from "../../services/apiService";
import { close } from "../../slices/modalSlice";
import { RootState } from "../../store";
import Loading from "../Loading";
import { OwnershipTable } from "../OwnershipTable";

export const InvestmentTable = () => {
  const dispatch = useDispatch();
  const { theme } = useContext(AppContext);
  const { source } = useSelector<RootState, RootState["graph"]["data"]>((state) => state.graph.data);
  const { shareholder, loading: isLoadingShareholder } = useGetShareholder(undefined, source?.properties.shareholderId);
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const { investments, loading: isLoadingInvestments } = useInvestments(shareholder, undefined, limit, skip);
  if (isLoadingInvestments || isLoadingShareholder)
    return <Loading color={theme.primary} backgroundColor="transparent" />;
  if (investments)
    return (
      <div className="h-full overflow-auto mt-12">
        <h5 className="text-center text-lg pb-2">
          <span className="font-semibold mr-2">Investeringene til {shareholder?.name}</span>{" "}
          <span style={{ color: theme.muted }}>({shareholder?.orgnr})</span>
        </h5>
        <OwnershipTable investor={shareholder} ownerships={investments} closeModal={() => dispatch(close())} />
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
              backgroundColor: !!(((investments?.length ?? 0) + (investments?.length ?? 0)) % limit)
                ? theme.muted
                : theme.primary,
            }}
            disabled={!!(((investments?.length ?? 0) + (investments?.length ?? 0)) % limit)}
            onClick={() => {
              if (!(((investments?.length ?? 0) + (investments?.length ?? 0)) % limit)) setSkip(skip + limit);
            }}
          >
            Neste {limit}
          </button>
        </div>
      </div>
    );
  return <p>Noe ser ut til å være galt...🤔</p>;
};
