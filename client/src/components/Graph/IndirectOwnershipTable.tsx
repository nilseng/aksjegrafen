import { Fragment, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { IndirectOwnership, OwnershipChain, UserEventType } from "../../models/models";
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
  const [investorType, setInvestorType] = useState<"all" | "person">("person");
  const [owners, setOwners] = useState<IndirectOwnership[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUuid, setExpandedUuid] = useState<string>();
  const [chainsByInvestor, setChainsByInvestor] = useState<{ [uuid: string]: OwnershipChain[] }>({});
  const [loadingChainsFor, setLoadingChainsFor] = useState<string>();

  useEffect(() => {
    if (!source?.properties.uuid) return;
    const abortController = new AbortController();
    setIsLoading(true);
    setExpandedUuid(undefined);
    fetch(
      `/api/graph/indirect-investors?uuid=${source.properties.uuid}&investorType=${investorType}&limit=${limit}&skip=${skip}`,
      {
        signal: abortController.signal,
      }
    )
      .then((res) => res.json())
      .then((data: { investors: IndirectOwnership[] }) => {
        setOwners(data.investors);
        setIsLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setIsLoading(false);
      });
    return () => abortController.abort();
  }, [source, investorType, limit, skip]);

  // The cached chains describe routes into the current company only.
  useEffect(() => {
    setChainsByInvestor({});
  }, [source]);

  const toggleChains = (ownership: IndirectOwnership) => {
    const investorUuid = ownership.investor.properties.uuid;
    if (expandedUuid === investorUuid) {
      setExpandedUuid(undefined);
      return;
    }
    setExpandedUuid(investorUuid);
    if (!chainsByInvestor[investorUuid] && source?.properties.uuid) {
      setLoadingChainsFor(investorUuid);
      fetch(
        `/api/graph/ownership-chains?investorUuid=${investorUuid}&targetUuid=${source.properties.uuid}&maxDepth=${
          ownership.minDepth + 2
        }`
      )
        .then((res) => res.json())
        .then((chains: OwnershipChain[]) => {
          setChainsByInvestor((previous) => ({ ...previous, [investorUuid]: chains }));
          setLoadingChainsFor(undefined);
        })
        .catch(() => setLoadingChainsFor(undefined));
    }
  };

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
        <div className="flex justify-center pb-2">
          {(["all", "person"] as const).map((type) => (
            <button
              key={type}
              className="rounded text-xs px-2 py-1 mx-1"
              style={{
                backgroundColor: investorType === type ? theme.primary : "transparent",
                color: investorType === type ? "white" : theme.muted,
                border: `1px solid ${investorType === type ? theme.primary : theme.muted}`,
              }}
              onClick={() => {
                if (investorType !== type) {
                  setSkip(0);
                  setInvestorType(type);
                }
              }}
            >
              {type === "all" ? "Alle eiere" : "Kun personer"}
            </button>
          ))}
        </div>
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
                  <th
                    className="font-normal p-2 text-right"
                    title="Antall ulike eierskapskjeder fra eieren til selskapet. Klikk på en rad for å se kjedene."
                  >
                    Kjeder
                  </th>
                </tr>
              </thead>
              <tbody>
                {owners.map((o) => (
                  <Fragment key={o.investor.properties.uuid}>
                    <tr
                      className="border-t border-primary/20 cursor-pointer"
                      onClick={() => toggleChains(o)}
                      title="Klikk for å se eierskapskjedene"
                    >
                      <td className="p-2">
                        <p>
                          <span className="text-xs mr-1" style={{ color: theme.muted }}>
                            {expandedUuid === o.investor.properties.uuid ? "▾" : "▸"}
                          </span>
                          {o.investor.properties.name}
                        </p>
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
                    {expandedUuid === o.investor.properties.uuid && (
                      <tr className="border-t border-primary/10">
                        <td colSpan={5} className="px-4 pb-3 pt-1">
                          {loadingChainsFor === o.investor.properties.uuid ? (
                            <p className="text-xs" style={{ color: theme.muted }}>
                              Henter eierskapskjeder...
                            </p>
                          ) : (
                            <div>
                              {(chainsByInvestor[o.investor.properties.uuid] ?? []).map((chain, i) => (
                                <p key={i} className="text-xs py-0.5">
                                  {chain.nodes.map((node, j) => (
                                    <Fragment key={node.uuid + j}>
                                      {j > 0 && (
                                        <span style={{ color: theme.muted }}>
                                          {" "}
                                          →&nbsp;{formatShare(chain.shares[j - 1])}&nbsp;→{" "}
                                        </span>
                                      )}
                                      <span className={j === 0 ? "font-semibold" : undefined}>{node.name}</span>
                                    </Fragment>
                                  ))}
                                  <span style={{ color: theme.muted }}> (bidrag: {formatShare(chain.product)})</span>
                                </p>
                              ))}
                              {(chainsByInvestor[o.investor.properties.uuid] ?? []).length === (10 as number) && (
                                <p className="text-xs pt-1" style={{ color: theme.muted }}>
                                  Viser de 10 største kjedene.
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
