import { faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { ModalContent, close, setContent } from "../../slices/modalSlice";
import { RootState } from "../../store";
import { NeuButton } from "../NeuButton";
import { NodeSearch } from "./NodeSearch";
import { TargetSearch } from "./TargetSearch";

export const Modal = () => {
  const dispatch = useDispatch();

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
        {content !== ModalContent.NodeSearch && (
          <NeuButton
            className="absolute top-0 left-0 h-12 w-12 p-2 m-2 sm:m-4"
            style={{ borderRadius: "100%" }}
            textClassName="text-primary/60 text-xl"
            icon={faArrowLeft}
            action={() => dispatch(setContent(ModalContent.NodeSearch))}
          />
        )}
        {content === ModalContent.NodeSearch && <NodeSearch />}
        {content === ModalContent.PathSearch && <TargetSearch />}
      </div>
    </div>
  );
};
