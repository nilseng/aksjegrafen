import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { ReactComponent as DirectedGraphIcon } from "../../icons/directed_graph.svg";
import { ReactComponent as UndirectGraphIcon } from "../../icons/undirected_graph.svg";
import { GraphNode, GraphType } from "../../models/models";
import { close } from "../../slices/modalSlice";
import { SearchComponent } from "../SearchComponent";

export const TargetSearch = ({ source }: { source?: GraphNode }) => {
  const { theme } = useContext(AppContext);

  const history = useHistory();

  const dispatch = useDispatch();

  const [isDirected, setIsDirected] = useState(true);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <p className="pb-4">
        Finn relasjoner fra <span className="text-primary font-bold">{source?.properties.name}</span> til...
      </p>
      <div className="w-full md:max-w-sm flex justify-around items-center pb-4">
        <button
          className="w-20 flex flex-col justify-center items-center p-1"
          style={isDirected ? { ...theme.lowering } : { ...theme.button }}
          onClick={() => setIsDirected(true)}
        >
          <div className="h-8">
            <DirectedGraphIcon />
          </div>
          <p className="text-xs text-muted">rettet</p>
        </button>
        <button
          className="w-20 flex flex-col justify-center items-center p-1"
          style={isDirected ? { ...theme.button } : { ...theme.lowering }}
          disabled={true}
          /* onClick={() => setIsDirected(false)} */
        >
          <div className="h-8">
            <UndirectGraphIcon />
          </div>
          <p className="text-xs text-muted">ikke rettet</p>
        </button>
      </div>
      <div className="h-[2.375rem] w-full md:max-w-sm">
        <SearchComponent
          inputContainerClassName="w-full rounded-lg bg-gray-50 dark:bg-gray-700"
          inputStyle={{
            backgroundColor: "transparent",
            backgroundClip: "padding-box",
            borderColor: "transparent",
          }}
          inputClassName="ag-input focus:outline-none text-primary dark:text-white bg-transparent font-bold p-4"
          mapResultToListItem={(node: GraphNode) => ({
            key: node.properties.uuid,
            name: node.properties.name,
            tags: [],
            buttons: [
              {
                name: "shortest-path-button",
                condition: true,
                buttonContent: (
                  <div>
                    <FontAwesomeIcon icon={faRoute} className="text-primary" size="lg" />
                    <p className="text-xs text-muted">korteste vei</p>
                  </div>
                ),
                handleClick: (node: GraphNode) => {
                  history.push({
                    pathname: `/graph2`,
                    search: `?graphType=${GraphType.ShortestPath}&sourceUuid=${source?.properties.uuid}&targetUuid=${node.properties.uuid}`,
                  });
                  dispatch(close());
                },
              },
            ],
          })}
          placeholder="Selskap, aksjonær eller rolleinnehaver..."
          apiPath="/api/node"
          query={{ limit: 10 }}
        />
      </div>
    </div>
  );
};
