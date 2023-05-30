import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch } from "react-redux";
import { close } from "../../slices/modalSlice";
import { SearchComponent } from "../SearchComponent";

export const Modal = () => {
  const dispatch = useDispatch();

  return (
    <div className="absolute w-full h-full z-50 flex justify-center items-center">
      <div className="absolute w-full h-full" onClick={() => dispatch(close())}></div>
      <div className="relative w-full sm:w-3/4 max-w-2xl h-1/2 flex justify-center items-center bg-gray-50 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-50 dark:bg-opacity-10 border border-white dark:border-gray-500 p-2 sm:p-4 m-2 sm:m-0">
        <button className="absolute top-0 right-0 text-white m-2 sm:m-4">
          <FontAwesomeIcon icon={faTimes} onClick={() => dispatch(close())} />
        </button>
        <SearchComponent
          focus={true}
          inputContainerClassName="w-full md:w-3/4 rounded-lg bg-gray-50/70 dark:bg-gray-700/70"
          inputClassName="ag-input focus:outline-none text-primary bg-transparent font-bold p-4"
          placeholder="Selskap, aksjonær eller rolleinnehaver..."
          apiPath="/api/node"
          mapResultToListItem={() => ({ key: "0", name: "", tags: [] })}
        />
      </div>
    </div>
  );
};
