import { faList, faRoute, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { useDispatch } from "react-redux";
import { AppContext } from "../../AppContext";
import { GraphNode } from "../../models/models";
import { close } from "../../slices/modalSlice";
import { GraphLogo } from "../GraphLogo";
import { SearchComponent } from "../SearchComponent";

export const Modal = () => {
  const { theme } = useContext(AppContext);

  const dispatch = useDispatch();

  return (
    <div className="absolute w-full h-full z-50 flex justify-center items-center">
      <div className="absolute w-full h-full" onClick={() => dispatch(close())}></div>
      <div className="relative w-full sm:w-3/4 max-w-2xl h-1/2 flex justify-center items-center bg-gray-50 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-50 dark:bg-opacity-10 border border-white dark:border-gray-500 p-2 sm:p-4 m-2 sm:m-0">
        <button className="absolute top-0 right-0 text-white m-2 sm:m-4">
          <FontAwesomeIcon icon={faTimes} onClick={() => dispatch(close())} />
        </button>
        <div className="w-full h-14">
          <SearchComponent
            focus={true}
            inputContainerClassName="w-full md:w-3/4 rounded-lg bg-gray-50/70 dark:bg-gray-700/70"
            inputClassName="ag-input focus:outline-none text-primary dark:text-white bg-transparent font-bold p-4"
            searchListClassName="w-full md:w-3/4 dark:text-white"
            placeholder="Selskap, aksjonær eller rolleinnehaver..."
            apiPath="/api/node"
            mapResultToListItem={(node: GraphNode) => ({
              key: node.elementId,
              name: node.properties.name,
              tags: [],
              buttons: [
                {
                  name: "table-button",
                  buttonContent: <FontAwesomeIcon icon={faList} className="text-primary" size="lg" />,
                  handleClick: (node: GraphNode) => {},
                },
                {
                  name: "graph-button",
                  buttonContent: (
                    <span
                      className="flex justify-center items-center p-2"
                      style={{
                        ...theme.button,
                        borderRadius: "100%",
                      }}
                    >
                      <GraphLogo inputColor={theme.secondary} width={"1.5rem"} height={"1.5rem"} />
                    </span>
                  ),
                  handleClick: (node: GraphNode) => {},
                },
                {
                  name: "relation-finder-button",
                  buttonContent: <FontAwesomeIcon icon={faRoute} style={{ color: theme.primary }} size="lg" />,
                  handleClick: (ndoe: GraphNode) => {},
                },
              ],
            })}
          />
        </div>
      </div>
    </div>
  );
};
