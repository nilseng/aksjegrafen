import { faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { NeuButton } from "../NeuButton";

export const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen)
    return (
      <div className="absolute flex right-0 top-0 p-2">
        <div className="relative glassy rounded-lg w-60 p-5">
          <NeuButton
            className="absolute top-0 right-0 h-5 w-5 p-1 m-1"
            style={{ borderRadius: "100%" }}
            textClassName="text-primary text-xl"
            icon={faTimes}
            action={() => setIsOpen(false)}
          />
          <h2 className="text-primary font-bold text-sm pb-2">Relasjoner</h2>
          <div>
            <label className="text-sm">
              <input className="mr-2" type="checkbox" checked={true} disabled={true} />
              Roller
            </label>
          </div>
          <div>
            <label className="text-sm">
              <input className="mr-2" type="checkbox" checked={true} disabled={true} />
              Eierskap
            </label>
          </div>
          <label className="text-xs">Min.</label>
          <input
            className="w-6 ag-input focus:outline-none text-right text-primary text-xs dark:text-white bg-gray-50 dark:bg-gray-700 rounded p-[0.1rem] mx-1"
            type="number"
            defaultValue={0}
            disabled
          />
          <label className="text-xs">%</label>
        </div>
      </div>
    );

  return (
    <div className="absolute flex right-0 top-0 p-2">
      <NeuButton
        icon={faFilter}
        className="text-primary p-2"
        action={() => {
          setIsOpen(true);
        }}
      />
    </div>
  );
};
