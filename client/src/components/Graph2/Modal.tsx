import { faRoute, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useGraph } from "../../hooks/useGraph";
import { GraphNode, GraphType } from "../../models/models";
import { ModalContent, close } from "../../slices/modalSlice";
import { RootState } from "../../store";
import { NeuButton } from "../NeuButton";
import { SearchComponent } from "../SearchComponent";
import { NodeSearch } from "./NodeSearch";

export const Modal = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const content = useSelector<RootState, ModalContent>((state) => state.modalHandler.content);

  const {
    data: { source },
  } = useGraph();

  return (
    <div className="absolute w-full h-full z-50 flex justify-center items-center">
      <div className="absolute w-full h-full" onClick={() => dispatch(close())}></div>
      <div className="relative w-full sm:w-3/4 max-w-2xl h-1/2 flex justify-center items-center bg-gray-50 dark:bg-gray-800 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-md dark:backdrop-blur-lg bg-opacity-60 dark:bg-opacity-40 border border-white dark:border-gray-500 p-2 sm:p-4 m-2 sm:m-0">
        <NeuButton
          className="absolute top-0 right-0 h-12 w-12 p-2 m-2 sm:m-4"
          style={{ borderRadius: "100%" }}
          textClassName="text-primary/60 text-xl"
          icon={faTimes}
          action={() => dispatch(close())}
        />
        {content === ModalContent.NodeSearch && <NodeSearch />}
        {content === ModalContent.PathSearch && (
          <>
            <p>Finn relasjoner fra {source?.properties.name} til...</p>
            <div style={{ height: "38px" }}>
              <SearchComponent
                inputContainerClassName="w-full"
                inputStyle={{
                  backgroundColor: "transparent",
                  backgroundClip: "padding-box",
                  borderColor: "transparent",
                }}
                inputClassName="focus:outline-none p-2"
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
                placeholder="Søk og velg selskap..."
                apiPath="/api/node"
                query={{ limit: 10 }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
