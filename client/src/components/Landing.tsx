import { faList, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
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
              listContainerClassName="absolute top-full left-0 right-0 mt-2 z-20 overflow-auto rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white px-2 py-1 shadow-lg empty:hidden"
              listItemClassName="w-full max-w-full flex flex-col items-center justify-between rounded-md p-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              maxHeight="20rem"
              placeholder="Selskap, aksjonær eller rolleinnehaver..."
              apiPath="/api/node"
              handleClick={openInGraph}
              mapResultToListItem={(node: GraphNode) => ({
                key: node.properties.uuid,
                name: node.properties.name,
                tags: [node.properties.orgnr, node.properties.yearOfBirth, node.properties.location].filter(
                  (tag) => !!tag
                ) as (string | number)[],
                buttons: [
                  {
                    name: "investorer",
                    condition: node.labels.includes(GraphNodeLabel.Company),
                    buttonContent: (
                      <span className="flex flex-col justify-center items-center">
                        <FontAwesomeIcon icon={faList} className="text-primary" />
                        <span className="text-xs text-muted">investorer</span>
                      </span>
                    ),
                    handleClick: openModalOnGraph(ModalContent.InvestorTable),
                  },
                  {
                    name: "investeringer",
                    condition: node.labels.includes(GraphNodeLabel.Shareholder),
                    buttonContent: (
                      <span className="flex flex-col justify-center items-center">
                        <FontAwesomeIcon icon={faList} className="text-primary" />
                        <span className="text-xs text-muted">investeringer</span>
                      </span>
                    ),
                    handleClick: openModalOnGraph(ModalContent.InvestmentTable),
                  },
                  {
                    name: "graf",
                    condition: true,
                    buttonContent: (
                      <span className="flex flex-col items-center">
                        <GraphLogo inputColor={theme.secondary} width={"1rem"} height={"1rem"} />
                        <span className="text-xs text-muted">graf</span>
                      </span>
                    ),
                    handleClick: openInGraph,
                  },
                  {
                    name: "relasjoner",
                    condition: true,
                    buttonContent: (
                      <span className="flex flex-col justify-center items-center">
                        <FontAwesomeIcon icon={faRoute} style={{ color: theme.primary }} />
                        <span className="text-xs text-muted">relasjoner</span>
                      </span>
                    ),
                    handleClick: openModalOnGraph(ModalContent.PathSearch),
                  },
                ],
              })}
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
