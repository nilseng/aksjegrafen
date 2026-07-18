import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { OwnershipChange, OwnershipChangeType, OwnershipChanges, UserEventType, Year } from "../../models/models";
import { captureUserEventThunk } from "../../slices/userEventSlice";
import { RootState, useAppDispatch } from "../../store";
import Loading from "../Loading";

// The registry starts in 2015, so 2016 is the earliest year with a previous year to diff
// against. The latest year comes from the server's first response instead of being
// hardcoded (it follows the data).
const EARLIEST_DIFF_YEAR = 2016;

const typeLabels: { [type in OwnershipChangeType]: string } = {
  [OwnershipChangeType.New]: "Ny",
  [OwnershipChangeType.Exited]: "Ute",
  [OwnershipChangeType.Increased]: "Økt",
  [OwnershipChangeType.Decreased]: "Redusert",
  [OwnershipChangeType.Unchanged]: "Uendret",
};

const formatShare = (share?: number) =>
  share === undefined
    ? "–"
    : `${(share * 100).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;

const delta = (change: OwnershipChange) => (change.share.current ?? 0) - (change.share.previous ?? 0);

const formatDelta = (change: OwnershipChange) => {
  const points = delta(change) * 100;
  const formatted = points.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${points > 0 ? "+" : ""}${formatted} pp`;
};

export const OwnershipChangesTable = () => {
  const dispatch = useAppDispatch();
  const { theme } = useContext(AppContext);
  const { source } = useSelector<RootState, RootState["modalHandler"]>((state) => state.modalHandler);
  const [year, setYear] = useState<Year>();
  const [latestYear, setLatestYear] = useState<Year>();
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [data, setData] = useState<OwnershipChanges>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!source?.properties.orgnr) return;
    const abortController = new AbortController();
    setIsLoading(true);
    fetch(
      `/api/ownership-changes?orgnr=${source.properties.orgnr}${year ? `&year=${year}` : ""}&limit=${limit}&skip=${skip}`,
      {
        signal: abortController.signal,
      }
    )
      .then((res) => res.json())
      .then((changes: OwnershipChanges) => {
        setData(changes);
        // The first response (no explicit year) tells us the latest data year.
        setLatestYear((previous) => previous ?? changes.year);
        setIsLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setIsLoading(false);
      });
    return () => abortController.abort();
  }, [source, year, limit, skip]);

  useEffect(() => {
    if (source) {
      dispatch(
        captureUserEventThunk({
          type: UserEventType.OwnershipChangesLoad,
          uuid: source.properties.uuid,
          orgnr: source.properties.orgnr,
        })
      );
    }
  }, [dispatch, source]);

  if (isLoading) return <Loading color={theme.primary} backgroundColor="transparent" />;

  if (data) {
    const { summary } = data;
    return (
      <div className="flex flex-col justify-between w-full h-full overflow-auto mt-12">
        <h5 className="text-center text-lg pb-1">
          <span className="font-semibold mr-2">Endringer i eierskap i {source?.properties.name}</span>{" "}
          {source?.properties.orgnr && <span style={{ color: theme.muted }}>({source?.properties.orgnr})</span>}
        </h5>
        <div className="flex justify-center items-center pb-1 text-xs">
          <span style={{ color: theme.muted }}>Fra</span>
          <span className="px-1 font-semibold">{data.compareYear}</span>
          <span style={{ color: theme.muted }}>til</span>
          <select
            className="mx-1 rounded border border-primary bg-transparent font-semibold"
            value={year ?? data.year}
            onChange={(e) => {
              setSkip(0);
              setYear(+e.target.value as Year);
            }}
          >
            {Array.from(
              { length: Math.max((latestYear ?? data.year) - EARLIEST_DIFF_YEAR + 1, 1) },
              (_, i) => (latestYear ?? data.year) - i
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <p className="text-center text-xs pb-2" style={{ color: theme.muted }}>
          {summary[OwnershipChangeType.New]} nye · {summary[OwnershipChangeType.Exited]} ute ·{" "}
          {summary[OwnershipChangeType.Increased]} økt · {summary[OwnershipChangeType.Decreased]} redusert ·{" "}
          {summary[OwnershipChangeType.Unchanged]} uendret
        </p>
        <div className="w-full flex-grow overflow-y-auto overflow-x-auto border border-primary rounded">
          {data.changes.length === 0 ? (
            <p className="text-center text-sm p-4">
              Fant ingen aksjonærer i {data.compareYear} eller {data.year}.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: theme.muted }}>
                  <th className="font-normal p-2">Aksjonær</th>
                  <th className="font-normal p-2 text-right">{data.compareYear}</th>
                  <th className="font-normal p-2 text-right">{data.year}</th>
                  <th className="font-normal p-2 text-right">Endring</th>
                  <th className="font-normal p-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.changes.map((change) => (
                  <tr key={change.investor.shareholderId} className="border-t border-primary/20">
                    <td className="p-2">
                      <p>{change.investor.name ?? change.investor.shareholderId}</p>
                      <p className="text-xs" style={{ color: theme.muted }}>
                        {change.investor.orgnr ??
                          [change.investor.yearOfBirth, change.investor.location].filter((part) => part).join(", ")}
                      </p>
                    </td>
                    <td className="p-2 text-right">{formatShare(change.share.previous)}</td>
                    <td className="p-2 text-right">{formatShare(change.share.current)}</td>
                    <td
                      className="p-2 text-right font-semibold"
                      style={{
                        color: delta(change) > 0 ? theme.primary : delta(change) < 0 ? theme.danger : theme.muted,
                      }}
                    >
                      {formatDelta(change)}
                    </td>
                    <td className="p-2 text-right">{typeLabels[change.type]}</td>
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
            style={{ backgroundColor: data.changes.length < limit ? theme.muted : theme.primary }}
            disabled={data.changes.length < limit}
            onClick={() => {
              if (data.changes.length >= limit) setSkip(skip + limit);
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
