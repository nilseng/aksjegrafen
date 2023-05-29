import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch } from "react-redux";
import { close } from "../../slices/modalSlice";

export const Modal = () => {
  const dispatch = useDispatch();

  return (
    <div className="absolute w-full h-full z-50 flex justify-center items-center">
      <div className="absolute w-full h-full" onClick={() => dispatch(close())}></div>
      <div className="relative w-full sm:w-3/4 h-1/2 flex justify-center items-center bg-gray-50 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-white dark:border-gray-500 p-2 sm:p-4 m-2 sm:m-0">
        <button>
          <FontAwesomeIcon
            className="absolute top-0 right-0 text-white m-2 sm:m-4"
            icon={faTimes}
            onClick={() => dispatch(close())}
          />
        </button>
        <input
          className="w-full md:w-3/4 rounded-xl focus:outline-none p-4"
          placeholder="Selskap, aksjonær eller rolleinnehaver..."
        />
      </div>
    </div>
  );
};
