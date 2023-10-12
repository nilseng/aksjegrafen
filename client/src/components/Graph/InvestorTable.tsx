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
      <div className="flex flex-col justify-between w-full h-full overflow-auto mt-12">
        <h5 className="text-center text-lg pb-2">
          <span className="font-semibold mr-2">Aksjonærer i {company?.name}</span>{" "}
          <span style={{ color: theme.muted }}>({company?.orgnr})</span>
        </h5>
        <div className="w-full flex-grow overflow-y-auto overflow-x-hidden border border-primary rounded">
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
            Forrige
          </button>
          <button
            className="rounded text-white text-xs px-2 py-1"
            style={{
              backgroundColor: theme.primary,
            }}
            onClick={() => {
              setSkip(skip + limit);
            }}
          >
            Neste
          </button>
        </div>
      </div>
    );
  }
  return <p>Noe ser ut til å være galt...🤔</p>;
};
