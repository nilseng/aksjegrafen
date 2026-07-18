import { faList, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { AppContext } from "../AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { GraphNode, GraphNodeLabel, GraphType } from "../models/models";
import { setSource as setGraphSource } from "../slices/graphSlice";
import { ModalContent, close, open, setContent } from "../slices/modalSlice";
import { useAppDispatch } from "../store";
import { useCases } from "./Bruksomrader";
import { GraphLogo } from "./GraphLogo";
import { InfoPageNav } from "./InfoPageNav";
import { SearchComponent } from "./SearchComponent";

const Shortcut = ({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) => (
  <button
    title={label}
    aria-label={label}
    className="px-2 py-1.5 rounded hover:bg-gray-300/60 dark:hover:bg-gray-500/60 transition-colors"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    {children}
  </button>
);

export const Landing = () => {
  const dispatch = useAppDispatch();
  const { theme } = useContext(AppContext);
  const history = useHistory();
  useDocumentTitle("Aksjegrafen – se hvem som eier norske selskaper");

  const goToGraph = (node: GraphNode) => {
    dispatch(setGraphSource(undefined));
    history.push({
      pathname: "/graf",
      search: `?graphType=${GraphType.Default}&sourceUuid=${node.properties.uuid}`,
    });
  };

  const openInGraph = (node: GraphNode) => {
    goToGraph(node);
    dispatch(close());
  };

  // The Modal only renders on the graph route, so the shortcuts open it there
  // with the node's graph loading behind it.
  const openModalOnGraph = (content: ModalContent) => (node: GraphNode) => {
    dispatch(setContent({ content, source: node }));
    dispatch(open());
    goToGraph(node);
  };

  return (
    <div className="w-full h-full overflow-y-auto" style={{ color: theme.text }}>
      <div className="flex flex-col items-center w-full px-4 pb-8">
        <div className="w-full max-w-2xl pt-4 sm:pt-12 pb-8 text-center">
          <div className="flex justify-center pb-4">
            <GraphLogo inputColor={theme.primary} width="4rem" height="4rem" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold pb-2">Se hvem som eier norsk næringsliv</h1>
          <p className="text-sm pb-6" style={{ color: theme.muted }}>
            Interaktiv graf over eierskap og roller i norske selskaper — med historikk tilbake til 2015. Bygget på
            offentlige registre. Gratis, uten registrering.
          </p>
          <div className="relative w-full">
            <SearchComponent
              focus
              inputContainerClassName="w-full rounded-lg bg-gray-50 dark:bg-gray-700"
              inputClassName="ag-input focus:outline-none text-primary dark:text-white bg-transparent font-bold p-4 w-full"
              listContainerClassName="absolute top-full left-0 right-0 mt-2 z-20 overflow-auto rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 px-2 py-1 shadow-lg empty:hidden"
              listItemClassName="w-full max-w-full flex items-center rounded-md px-3 py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              maxHeight="20rem"
              placeholder="Selskap, aksjonær eller rolleinnehaver..."
              apiPath="/api/node"
              handleClick={openInGraph}
              mapResultToListItem={(node: GraphNode) => ({
                key: node.properties.uuid,
                name: node.properties.name,
                tags: [],
              })}
              renderItemContent={(node: GraphNode) => (
                <div className="w-full flex items-center justify-between gap-2">
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-gray-700 dark:text-gray-100 m-0">
                      {node.properties.name}
                    </p>
                    <p className="truncate text-xs text-muted m-0">
                      {[node.properties.orgnr, node.properties.location, node.properties.yearOfBirth]
                        .filter((tag) => !!tag)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center shrink-0">
                    {node.labels.includes(GraphNodeLabel.Company) && (
                      <Shortcut label="Investorer" onClick={() => openModalOnGraph(ModalContent.InvestorTable)(node)}>
                        <FontAwesomeIcon icon={faList} className="text-primary" />
                      </Shortcut>
                    )}
                    {node.labels.includes(GraphNodeLabel.Shareholder) && (
                      <Shortcut label="Investeringer" onClick={() => openModalOnGraph(ModalContent.InvestmentTable)(node)}>
                        <FontAwesomeIcon icon={faList} className="text-primary" />
                      </Shortcut>
                    )}
                    <Shortcut label="Åpne i graf" onClick={() => openInGraph(node)}>
                      <GraphLogo inputColor={theme.secondary} width="1rem" height="1rem" />
                    </Shortcut>
                    <Shortcut label="Finn relasjoner" onClick={() => openModalOnGraph(ModalContent.PathSearch)(node)}>
                      <FontAwesomeIcon icon={faRoute} style={{ color: theme.primary }} />
                    </Shortcut>
                  </div>
                </div>
              )}
            />
          </div>
          <p className="text-xs pt-4" style={{ color: theme.muted }}>
            Skatteetatens aksjonærregister · Brønnøysundregistrene · Eierforhold per år, 2015–i dag
          </p>
        </div>
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="rounded p-4"
              style={{ backgroundColor: theme.backgroundSecondary, ...theme.elevation }}
            >
              <h5 className="text-base font-bold pb-2" style={{ color: theme.primary }}>
                {useCase.title}
              </h5>
              <p className="text-sm pb-2">{useCase.ingress}</p>
              <Link to="/graf" className="text-sm font-bold underline" style={{ color: theme.primary }}>
                {useCase.cta} →
              </Link>
            </div>
          ))}
        </div>
        <div className="w-full max-w-2xl text-center">
          <p className="text-xs pb-2" style={{ color: theme.muted }}>
            Alle data kommer fra offentlige registre, med kilde og årgang oppgitt.{" "}
            <Link to="/bruksomrader" className="underline">
              Les mer om hva du kan bruke grafen til
            </Link>
            .
          </p>
          <div className="flex justify-center">
            <InfoPageNav />
          </div>
        </div>
      </div>
    </div>
  );
};
