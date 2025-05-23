import { faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { ModalContent, close, setContent } from "../../slices/modalSlice";
import { RootState } from "../../store";
import { NeuButton } from "../NeuButton";
import { Financials } from "./Financials";
import { InvestmentTable } from "./InvestmentTable";
import { InvestorTable } from "./InvestorTable";
import { NodeSearch } from "./NodeSearch";
import { TargetSearch } from "./TargetSearch";
import { UnitInformation } from "./UnitInformation";

export const Modal = () => {
  const dispatch = useDispatch();

  const content = useSelector<RootState, ModalContent>((state) => state.modalHandler.content);

  return (
    <div className="absolute w-full h-full z-50 flex justify-center items-center">
      <div className="absolute w-full h-full" onClick={() => dispatch(close())}></div>
      <div className="relative w-full sm:w-3/4 max-w-3xl h-5/6 flex flex-col justify-center items-center rounded-lg glassy p-2 sm:p-5 sm:pb-8 m-2 sm:m-0">
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
            action={() => dispatch(setContent({ content: ModalContent.NodeSearch }))}
          />
        )}
        {content === ModalContent.NodeSearch && <NodeSearch />}
        {content === ModalContent.PathSearch && <TargetSearch />}
        {content === ModalContent.InvestmentTable && <InvestmentTable />}
        {content === ModalContent.InvestorTable && <InvestorTable />}
        {content === ModalContent.Financials && <Financials />}
        {content === ModalContent.Details && <UnitInformation />}
      </div>
    </div>
  );
};
