import { faList, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { GraphNode, GraphNodeLabel, GraphType } from "../../models/models";
import { setSource } from "../../slices/graphSlice";
import { ModalContent, close, setContent } from "../../slices/modalSlice";
import { RootState } from "../../store";
import { GraphLogo } from "../GraphLogo";
import { SearchComponent } from "../SearchComponent";

export const NodeSearch = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { theme } = useContext(AppContext);
  const { source } = useSelector<RootState, RootState["graph"]["data"]>((state) => state.graph.data);

  return (
    <div className="w-full h-14">
      <SearchComponent
        inputContainerClassName="w-full md:w-3/4 rounded-lg bg-gray-50 dark:bg-gray-700"
        inputClassName="ag-input focus:outline-none text-primary dark:text-white bg-transparent font-bold p-4"
        searchListClassName="w-full md:w-3/4 dark:text-white"
        placeholder="Selskap, aksjonær eller rolleinnehaver..."
        apiPath="/api/node"
        mapResultToListItem={(node: GraphNode) => ({
          key: node.properties.uuid,
          name: node.properties.name,
          tags: [],
          buttons: [
            {
              name: "investors-button",
              condition: node.labels.includes(GraphNodeLabel.Company),
              buttonContent: (
                <div>
                  <FontAwesomeIcon icon={faList} className="text-primary" size="lg" />
                  <p className="text-xs text-muted">investorer</p>
                </div>
              ),
              handleClick: (node: GraphNode) => {
                dispatch(setSource(node));
                dispatch(setContent(ModalContent.InvestorTable));
              },
            },
            {
              name: "investments-button",
              condition: node.labels.includes(GraphNodeLabel.Shareholder),
              buttonContent: (
                <div>
                  <FontAwesomeIcon icon={faList} className="text-primary" size="lg" />
                  <p className="text-xs text-muted">investeringer</p>
                </div>
              ),
              handleClick: (node: GraphNode) => {
                dispatch(setSource(node));
                dispatch(setContent(ModalContent.InvestmentTable));
              },
            },
            {
              name: "graph-button",
              condition: true,
              buttonContent: (
                <div>
                  <GraphLogo inputColor={theme.secondary} width={"1.5rem"} height={"1.5rem"} />
                  <p className="text-xs text-muted">graf</p>
                </div>
              ),
              handleClick: (node: GraphNode) => {
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
                <div>
                  <FontAwesomeIcon icon={faRoute} style={{ color: theme.primary }} size="lg" />
                  <p className="text-xs text-muted">relasjoner</p>
                </div>
              ),
              handleClick: (node: GraphNode) => {
                history.push({
                  pathname: `/`,
                  search: `?graphType=${GraphType.ShortestPath}&sourceUuid=${node.properties.uuid}&isDirected=true`,
                });
                dispatch(setSource(node));
                dispatch(setContent(ModalContent.PathSearch));
              },
            },
          ],
        })}
        initialResult={source ? [source] : undefined}
      />
    </div>
  );
};
