import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { open } from "../../slices/modalSlice";
import { NeuButton } from "../NeuButton";

export const Toolbar = () => {
  const dispatch = useDispatch();
  return (
    <div className="absolute flex right-0 top-0 p-2 mb-2 sm:mb-4">
      <NeuButton icon={faSearch} className="text-primary text-2xl p-2" action={() => dispatch(open())} />
    </div>
  );
};
