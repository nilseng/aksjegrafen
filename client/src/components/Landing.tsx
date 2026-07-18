import { faHistory, faList, faRoute, faSearch, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
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

const useCaseIcons = [faSearch, faRoute, faHistory, faShieldAlt];

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
      {/* Hero: fills the initial view; search mirrors the graph's search modal */}
      <div className="w-full h-full flex justify-center px-2">
        <div className="w-full sm:w-3/4 max-w-3xl h-full flex flex-col justify-between items-center">
          <div className="h-1/2 w-full flex flex-col items-center justify-end text-center pb-10 overflow-hidden">
            <div className="flex justify-center pb-6">
              <GraphLogo inputColor={theme.primary} width="4rem" height="4rem" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold pb-3">Se hvem som eier norsk næringsliv</h1>
            <p className="text-sm w-full md:w-3/4 max-w-xl" style={{ color: theme.muted }}>
              Interaktiv graf over eierskap og roller i norske selskaper — historikk tilbake til 2015, bygget på
              offentlige registre. Gratis, uten registrering.
            </p>
          </div>
          <SearchComponent
            focus
            inputContainerClassName="w-full md:w-3/4 rounded-lg bg-gray-50 dark:bg-gray-700"
            inputClassName="ag-input focus:outline-none text-primary dark:text-white bg-transparent font-bold p-4"
            placeholder="Selskap, aksjonær eller rolleinnehaver..."
            apiPath="/api/node"
            mapResultToListItem={(node: GraphNode) => ({
              key: node.properties.uuid,
              name: node.properties.name,
              tags: [node.properties.orgnr, node.properties.yearOfBirth, node.properties.location].filter(
                (tag) => !!tag
              ) as (string | number)[],
              handleTitleClick: node.properties.orgnr ? openModalOnGraph(ModalContent.Details) : openInGraph,
              buttons: [
                {
                  name: "investors-button",
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
                  name: "investments-button",
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
                  name: "graph-button",
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
                  name: "relation-finder-button",
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
      </div>
      {/* Use cases: their own section below the fold */}
      <section className="w-full flex flex-col items-center px-4 pt-16 pb-10">
        <h2 className="text-xl font-bold pb-8 text-center">Hva kan du bruke Aksjegrafen til?</h2>
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6 pb-10">
          {useCases.map((useCase, i) => (
            <div
              key={useCase.title}
              className="flex flex-col rounded-lg p-6"
              style={{ backgroundColor: theme.backgroundSecondary, ...theme.elevation }}
            >
              <div className="flex items-center pb-3">
                <span
                  className="flex items-center justify-center h-10 w-10 rounded-full mr-3 shrink-0"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <FontAwesomeIcon icon={useCaseIcons[i]} style={{ color: theme.primary }} />
                </span>
                <h5 className="text-base font-bold m-0">{useCase.title}</h5>
              </div>
              <p className="text-sm pb-4" style={{ color: theme.muted }}>
                {useCase.ingress}
              </p>
              <Link to="/graf" className="mt-auto">
                <button
                  className="rounded text-white text-xs font-bold px-3 py-2"
                  style={{ backgroundColor: theme.primary }}
                >
                  {useCase.cta} →
                </button>
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs pb-2 text-center" style={{ color: theme.muted }}>
          Alle data kommer fra offentlige registre, med kilde og årgang oppgitt.{" "}
          <Link to="/bruksomrader" className="underline">
            Les mer om hva du kan bruke grafen til
          </Link>
          .
        </p>
        <div className="flex justify-center">
          <InfoPageNav />
        </div>
      </section>
    </div>
  );
};
