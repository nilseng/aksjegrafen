import { faList, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { GraphNode } from "../../models/models";
import { GraphLogo } from "../GraphLogo";
import { SearchComponent } from "../SearchComponent";

export const NodeSearch = () => {
  const { theme } = useContext(AppContext);

  return (
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
  );
};
