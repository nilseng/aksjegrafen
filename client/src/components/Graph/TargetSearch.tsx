import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { ReactComponent as AllPathsIcon } from "../../icons/all_paths.svg";
import { ReactComponent as DirectedGraphIcon } from "../../icons/directed_graph.svg";
import { ReactComponent as UndirectGraphIcon } from "../../icons/undirected_graph.svg";
import { GraphNode, GraphType } from "../../models/models";
import { GraphState } from "../../slices/graphSlice";
import { ModalState, close } from "../../slices/modalSlice";
import { RootState } from "../../store";
import { SearchComponent } from "../SearchComponent";

export const TargetSearch = () => {
  const { theme } = useContext(AppContext);
  const history = useHistory();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();

  const { isDirected: isGraphDirected } = useSelector<RootState, GraphState["data"]>((state) => state.graph.data);
  const [isDirected, setIsDirected] = useState(isGraphDirected);
  const { source, target } = useSelector<RootState, ModalState>((state) => state.modalHandler);

  return (
    <div className="w-full flex flex-col justify-center items-center dark:text-white">
      <div className="w-full md:max-w-sm flex justify-center items-center pb-8">
        <button
          className="w-20 flex flex-col justify-center items-center p-1 mr-2"
          style={isDirected !== false ? { ...theme.lowering } : { ...theme.button }}
          onClick={() => {
            setIsDirected(true);
          }}
        >
          <div className="h-8">
            <DirectedGraphIcon />
          </div>
          <p className="text-xs text-muted">rettet</p>
        </button>
        <button
          className="w-20 flex flex-col justify-center items-center text-primary p-1 ml-2"
          style={isDirected !== false ? { ...theme.button } : { ...theme.lowering }}
          onClick={() => {
            setIsDirected(false);
          }}
        >
          <div className="h-8">
            <UndirectGraphIcon />
          </div>
          <p className="text-xs text-muted">ikke rettet</p>
        </button>
      </div>
      <p className="pb-4">
        Finn relasjoner fra <span className="text-primary font-bold">{source?.properties.name}</span> til...
      </p>
      <div className="h-[2.375rem] w-full md:max-w-sm">
        <SearchComponent
          inputContainerClassName="w-full rounded-lg bg-gray-50 dark:bg-gray-700"
          inputStyle={{
            backgroundColor: "transparent",
            backgroundClip: "padding-box",
            borderColor: "transparent",
          }}
          inputClassName="ag-input focus:outline-none text-primary dark:text-white bg-transparent font-bold p-4"
          maxHeight={width >= 768 ? "10rem" : "7rem"}
          mapResultToListItem={(node: GraphNode) => ({
            key: node.properties.uuid,
            name: node.properties.name,
            tags: [],
            buttons: [
              {
                name: "shortest-path-button",
                condition: true,
                buttonContent: (
                  <div className="w-[4.125rem]">
                    <FontAwesomeIcon icon={faRoute} className="text-primary" size="lg" />
                    <p className="text-xs text-muted">korteste vei</p>
                  </div>
                ),
                handleClick: (node: GraphNode) => {
                  history.push({
                    pathname: `/`,
                    search: `?graphType=${GraphType.ShortestPath}&sourceUuid=${source?.properties.uuid}&targetUuid=${
                      node.properties.uuid
                    }&isDirected=${isDirected === false ? false : true}`,
                  });
                  dispatch(close());
                },
              },
              {
                name: "all-paths-button",
                condition: true,
                buttonContent: (
                  <div className="w-[4.125rem]">
                    <div className="h-6">
                      <AllPathsIcon />
                    </div>
                    <p className="text-xs text-muted">flere veier</p>
                  </div>
                ),
                handleClick: (node: GraphNode) => {
                  history.push({
                    pathname: `/`,
                    search: `?graphType=${GraphType.AllPaths}&sourceUuid=${source?.properties.uuid}&targetUuid=${
                      node.properties.uuid
                    }&isDirected=${isDirected === false ? false : true}`,
                  });
                  dispatch(close());
                },
              },
            ],
          })}
          placeholder="Selskap, aksjonær eller rolleinnehaver..."
          apiPath="/api/node"
          query={{ limit: 10 }}
          initialResult={target ? [target] : undefined}
        />
      </div>
    </div>
  );
};
