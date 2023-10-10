import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { UserEventType } from "../../models/models";
import { useGetShareholder, useInvestments } from "../../services/apiService";
import { close } from "../../slices/modalSlice";
import { captureUserEventThunk } from "../../slices/userEventSlice";
import { RootState, useAppDispatch } from "../../store";
import Loading from "../Loading";
import { OwnershipTable } from "../OwnershipTable";

export const InvestmentTable = () => {
  const dispatch = useAppDispatch();
  const { theme } = useContext(AppContext);
  const { source } = useSelector<RootState, RootState["modalHandler"]>((state) => state.modalHandler);
  const { shareholder, loading: isLoadingShareholder } = useGetShareholder(undefined, source?.properties.shareholderId);
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const { investments, loading: isLoadingInvestments } = useInvestments(shareholder, undefined, limit, skip);

  useEffect(() => {
    if (source) {
      dispatch(
        captureUserEventThunk({
          type: UserEventType.InvestmentTableLoad,
          uuid: source.properties.uuid,
          orgnr: source.properties.orgnr,
        })
      );
    }
  }, [dispatch, source]);

  if (isLoadingInvestments || isLoadingShareholder) {
    return <Loading color={theme.primary} backgroundColor="transparent" />;
  }

  if (investments) {
    return (
      <div className="flex flex-col h-full overflow-auto mt-12">
        <h5 className="text-center text-lg pb-2">
          <span className="font-semibold mr-2">Investeringene til {shareholder?.name}</span>{" "}
          {shareholder?.orgnr && <span style={{ color: theme.muted }}>({shareholder?.orgnr})</span>}
        </h5>
        <div className="flex-grow overflow-auto border border-primary rounded">
          <OwnershipTable investor={shareholder} ownerships={investments} closeModal={() => dispatch(close())} />
        </div>
        <div className="w-full flex justify-between pt-2">
          <button
            className="rounded text-white text-xs px-2 py-1"
            style={{ backgroundColor: skip < limit ? theme.muted : theme.primary }}
            disabled={skip < limit}
            onClick={() => {
              if (skip >= limit) setSkip(skip - limit);
            }}
          >
            Forrige {limit}
          </button>
          <button
            className="rounded text-white text-xs px-2 py-1"
            style={{
              backgroundColor: !!((investments?.length ?? 0) % limit) ? theme.muted : theme.primary,
            }}
            disabled={!!((investments?.length ?? 0) % limit)}
            onClick={() => {
              if (!((investments?.length ?? 0) % limit)) setSkip(skip + limit);
            }}
          >
            Neste {limit}
          </button>
        </div>
      </div>
    );
  }
  return <p>Noe ser ut til å være galt...🤔</p>;
};
