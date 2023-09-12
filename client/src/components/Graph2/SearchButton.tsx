import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { GraphState } from "../../slices/graphSlice";
import { ModalContent, open, setContent } from "../../slices/modalSlice";
import { RootState } from "../../store";
import { NeuButton } from "../NeuButton";

export const SearchButton = () => {
  const dispatch = useDispatch();

  const { source } = useSelector<RootState, GraphState["data"]>((state) => state.graph.data);

  return (
    <div className="absolute flex left-0 top-0 p-2">
      <NeuButton
        icon={faSearch}
        className="text-primary p-2"
        action={() => {
          dispatch(setContent({ content: ModalContent.NodeSearch, source }));
          dispatch(open());
        }}
      />
    </div>
  );
};
