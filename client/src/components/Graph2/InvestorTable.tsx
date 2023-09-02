import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { UserEventType } from "../../models/models";
import { useGetCompany, useInvestors } from "../../services/apiService";
import { close } from "../../slices/modalSlice";
import { captureUserEventThunk } from "../../slices/userEventSlice";
import { RootState, useAppDispatch } from "../../store";
import Loading from "../Loading";
import { OwnershipTable } from "../OwnershipTable";

export const InvestorTable = () => {
  const dispatch = useAppDispatch();
  const { theme } = useContext(AppContext);
  const { source } = useSelector<RootState, RootState["modalHandler"]>((state) => state.modalHandler);
  const { company, loading: isLoadingCompany } = useGetCompany(undefined, source?.properties.orgnr);
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const { investors, loading: isLoadingInvestors } = useInvestors(company, undefined, limit, skip);

  useEffect(() => {
    if (source) {
      dispatch(
        captureUserEventThunk({
          type: UserEventType.InvestorTableLoad,
          uuid: source.properties.uuid,
          orgnr: source.properties.orgnr,
        })
      );
    }
  }, [dispatch, source]);

  if (isLoadingCompany || isLoadingInvestors) return <Loading color={theme.primary} backgroundColor="transparent" />;

  if (investors) {
    return (
      <div className="flex flex-col justify-between h-full overflow-auto mt-12">
        <h5 className="text-center text-lg pb-2">
          <span className="font-semibold mr-2">Aksjonærer i {company?.name}</span>{" "}
          <span style={{ color: theme.muted }}>({company?.orgnr})</span>
        </h5>
        <div className="flex-grow overflow-auto border border-primary rounded">
          <OwnershipTable investment={company} ownerships={investors} closeModal={() => dispatch(close())} />
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
  }
  return <p>Noe ser ut til å være galt...🤔</p>;
};
