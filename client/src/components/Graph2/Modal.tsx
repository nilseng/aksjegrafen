import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { close } from "../../slices/modalSlice";
import { NeuButton } from "../NeuButton";
import { NodeSearch } from "./NodeSearch";

export const Modal = () => {
  const dispatch = useDispatch();

  return (
    <div className="absolute w-full h-full z-50 flex justify-center items-center">
      <div className="absolute w-full h-full" onClick={() => dispatch(close())}></div>
      <div className="relative w-full sm:w-3/4 max-w-2xl h-1/2 flex justify-center items-center bg-gray-50 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-50 dark:bg-opacity-10 border border-white dark:border-gray-500 p-2 sm:p-4 m-2 sm:m-0">
        <NeuButton
          className="absolute top-0 right-0 h-12 w-12 p-2 m-2 sm:m-4"
          style={{ borderRadius: "100%" }}
          textClassName="text-primary/60 text-xl"
          icon={faTimes}
          action={() => dispatch(close())}
        />
        <NodeSearch />
      </div>
    </div>
  );
};
