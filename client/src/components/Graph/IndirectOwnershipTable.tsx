import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { IndirectOwnership, UserEventType } from "../../models/models";
import { captureUserEventThunk } from "../../slices/userEventSlice";
import { RootState, useAppDispatch } from "../../store";
import Loading from "../Loading";

const formatShare = (share: number) =>
  `${(share * 100).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;

export const IndirectOwnershipTable = () => {
  const dispatch = useAppDispatch();
  const { theme } = useContext(AppContext);
  const { source } = useSelector<RootState, RootState["modalHandler"]>((state) => state.modalHandler);
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [owners, setOwners] = useState<IndirectOwnership[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!source?.properties.uuid) return;
    const abortController = new AbortController();
    setIsLoading(true);
    fetch(`/api/graph/indirect-investors?uuid=${source.properties.uuid}&limit=${limit}&skip=${skip}`, {
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((data: { investors: IndirectOwnership[] }) => {
        setOwners(data.investors);
        setIsLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setIsLoading(false);
      });
    return () => abortController.abort();
  }, [source, limit, skip]);

  useEffect(() => {
    if (source) {
      dispatch(
        captureUserEventThunk({
          type: UserEventType.IndirectOwnershipLoad,
          uuid: source.properties.uuid,
          orgnr: source.properties.orgnr,
        })
      );
    }
  }, [dispatch, source]);

  if (isLoading) return <Loading color={theme.primary} backgroundColor="transparent" />;

  if (owners) {
    return (
      <div className="flex flex-col justify-between w-full h-full overflow-auto mt-12">
        <h5 className="text-center text-lg pb-1">
          <span className="font-semibold mr-2">Indirekte eierskap i {source?.properties.name}</span>{" "}
          {source?.properties.orgnr && <span style={{ color: theme.muted }}>({source?.properties.orgnr})</span>}
        </h5>
        <p className="text-center text-xs pb-1" style={{ color: theme.muted }}>
          Effektiv eierandel er summen over alle eierskapskjeder av produktet av eierandelene i hvert ledd.
        </p>
        <p className="text-center text-xs pb-2">
          <span style={{ color: theme.muted }}>Last ned eierskapsrapport: </span>
          <a
            className="underline font-semibold"
            style={{ color: theme.primary }}
            href={`/api/ownership-report?uuid=${source?.properties.uuid}&format=pdf`}
            download
          >
            PDF
          </a>
          <span style={{ color: theme.muted }}> · </span>
          <a
            className="underline font-semibold"
            style={{ color: theme.primary }}
            href={`/api/ownership-report?uuid=${source?.properties.uuid}&format=csv`}
            download
          >
            CSV
          </a>
        </p>
        <div className="w-full flex-grow overflow-y-auto overflow-x-auto border border-primary rounded">
          {owners.length === 0 ? (
            <p className="text-center text-sm p-4">Fant ingen aksjonærer for dette selskapet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: theme.muted }}>
                  <th className="font-normal p-2">Aksjonær</th>
                  <th className="font-normal p-2 text-right">Effektiv andel</th>
                  <th className="font-normal p-2 text-right">Direkte</th>
                  <th className="font-normal p-2 text-right">Indirekte</th>
                  <th className="font-normal p-2 text-right">Kjeder</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((o) => (
                  <tr key={o.investor.properties.uuid} className="border-t border-primary/20">
                    <td className="p-2">
                      <p>{o.investor.properties.name}</p>
                      <p className="text-xs" style={{ color: theme.muted }}>
                        {o.investor.properties.orgnr ??
                          [o.investor.properties.yearOfBirth, o.investor.properties.location]
                            .filter((p) => p)
                            .join(", ")}
                      </p>
                    </td>
                    <td className="p-2 text-right font-semibold">{formatShare(o.effectiveShare)}</td>
                    <td className="p-2 text-right">{formatShare(o.directShare)}</td>
                    <td className="p-2 text-right">{formatShare(o.effectiveShare - o.directShare)}</td>
                    <td className="p-2 text-right">{o.pathCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
            style={{ backgroundColor: owners.length < limit ? theme.muted : theme.primary }}
            disabled={owners.length < limit}
            onClick={() => {
              if (owners.length >= limit) setSkip(skip + limit);
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
