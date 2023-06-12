import { faRoute, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { GraphNode, GraphType } from "../../models/models";
import { ModalContent, close } from "../../slices/modalSlice";
import { RootState } from "../../store";
import { NeuButton } from "../NeuButton";
import { SearchComponent } from "../SearchComponent";
import { NodeSearch } from "./NodeSearch";

export const Modal = ({ source }: { source?: GraphNode }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const content = useSelector<RootState, ModalContent>((state) => state.modalHandler.content);

  return (
    <div className="absolute w-full h-full z-50 flex justify-center items-center">
      <div className="absolute w-full h-full" onClick={() => dispatch(close())}></div>
      <div className="relative w-full sm:w-3/4 max-w-2xl h-1/2 flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-800 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-md dark:backdrop-blur-lg bg-opacity-60 dark:bg-opacity-40 border border-white dark:border-gray-500 p-2 sm:p-4 m-2 sm:m-0">
        <NeuButton
          className="absolute top-0 right-0 h-12 w-12 p-2 m-2 sm:m-4"
          style={{ borderRadius: "100%" }}
          textClassName="text-primary/60 text-xl"
          icon={faTimes}
          action={() => dispatch(close())}
        />
        {content === ModalContent.NodeSearch && <NodeSearch />}
        {content === ModalContent.PathSearch && (
          <div className="w-full flex flex-col justify-center items-center">
            <p className="pb-4">
              Finn relasjoner fra <span className="text-primary font-bold">{source?.properties.name}</span> til...
            </p>
            <div className="h-[2.375rem] w-full">
              <SearchComponent
                inputContainerClassName="w-full md:w-3/4 rounded-lg bg-gray-50 dark:bg-gray-700"
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
        )}
      </div>
    </div>
  );
};
