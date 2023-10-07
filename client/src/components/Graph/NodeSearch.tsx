import { faList, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { GraphNode, GraphNodeLabel, GraphType } from "../../models/models";
import { setSource as setGraphSource } from "../../slices/graphSlice";
import { ModalContent, close, setContent, setSource } from "../../slices/modalSlice";
import { RootState, useAppDispatch } from "../../store";
import { GraphLogo } from "../GraphLogo";
import { SearchComponent } from "../SearchComponent";

export const NodeSearch = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { theme } = useContext(AppContext);
  const { source, popularNodes } = useSelector<RootState, RootState["modalHandler"]>((state) => state.modalHandler);
  const { source: graphSource } = useSelector<RootState, RootState["graph"]["data"]>((state) => state.graph.data);

  useEffect(() => {
    if (!source && graphSource) dispatch(setSource(graphSource));
  }, [dispatch, graphSource, source]);

  return (
    <div className="flex flex-col justify-between items-center w-full h-full max-h-full overflow-hidden">
      <div className="h-1/2 overflow-hidden"></div>
      <SearchComponent
        inputContainerClassName="w-full md:w-3/4 rounded-lg bg-gray-50 dark:bg-gray-700"
        inputClassName="ag-input focus:outline-none text-primary dark:text-white bg-transparent font-bold p-4"
        searchListClassName="h-1/2 w-full md:w-3/4 dark:text-white overflow-auto"
        placeholder="Selskap, aksjonær eller rolleinnehaver..."
        apiPath="/api/node"
        mapResultToListItem={(node: GraphNode) => ({
          key: node.properties.uuid,
          name: node.properties.name,
          tags: [node.properties.orgnr, node.properties.yearOfBirth, node.properties.location].filter(
            (tag) => !!tag
          ) as (string | number)[],
          handleTitleClick: node.properties.orgnr
            ? (node: GraphNode) => {
                dispatch(setContent({ content: ModalContent.Details, source: node }));
              }
            : undefined,
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
              handleClick: (node: GraphNode) => {
                dispatch(setContent({ content: ModalContent.InvestorTable, source: node }));
              },
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
              handleClick: (node: GraphNode) => {
                dispatch(setContent({ content: ModalContent.InvestmentTable, source: node }));
              },
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
              handleClick: (node: GraphNode) => {
                dispatch(setGraphSource(undefined));
                history.push({
                  pathname: `/`,
                  search: `?graphType=${GraphType.Default}&sourceUuid=${node.properties.uuid}`,
                });
                dispatch(close());
              },
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
              handleClick: (node: GraphNode) => {
                dispatch(setContent({ content: ModalContent.PathSearch, source: node }));
              },
            },
          ],
        })}
        initialResult={source ? [source] : popularNodes}
      />
    </div>
  );
};
