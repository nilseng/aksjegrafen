import { faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ChangeEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GraphLinkType } from "../../models/models";
import { setFilter } from "../../slices/graphSlice";
import { RootState, useAppDispatch } from "../../store";
import { getRoleLinkTypes } from "../../utils/getRoleLinkTypes";
import { NeuButton } from "../NeuButton";

const getLinkTypes = ({ withRoles, withOwnership }: { withRoles: boolean; withOwnership: boolean }) => {
  const linkTypes = [];
  if (withOwnership) linkTypes.push(GraphLinkType.OWNS);
  if (withRoles) linkTypes.push(...getRoleLinkTypes());
  return linkTypes;
};

export const Settings = () => {
  const dispatch = useAppDispatch();

  const filter = useSelector<RootState, RootState["graph"]["data"]["filter"]>((state) => state.graph.data.filter);

  const [isOpen, setIsOpen] = useState(false);
  const [isRolesChecked, setIsRolesChecked] = useState(true);
  const [isOwnershipChecked, setIsOwnershipChecked] = useState(true);
  const [threshold, setThreshold] = useState(`${filter.ownershipShareThreshold}`);

  useEffect(() => {
    setThreshold(`${filter.ownershipShareThreshold}`);
  }, [filter.ownershipShareThreshold, isOpen]);

  const handleRolesFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsRolesChecked(e.target.checked);
    dispatch(
      setFilter({
        ...filter,
        linkTypes: getLinkTypes({ withRoles: e.target.checked, withOwnership: isOwnershipChecked }),
      })
    );
  };

  const handleOwnershipFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsOwnershipChecked(e.target.checked);
    dispatch(
      setFilter({ ...filter, linkTypes: getLinkTypes({ withRoles: isRolesChecked, withOwnership: e.target.checked }) })
    );
  };

  const handleThresholdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setThreshold(e.target.value);
    const threshold = e?.target?.value ? +e.target.value : undefined;
    if (!threshold && threshold !== 0) return;
    dispatch(setFilter({ ...filter, ownershipShareThreshold: threshold }));
  };

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
          <h2 className="text-primary font-bold text-sm">Relasjoner</h2>
          <div className="py-4">
            <label className="text-sm">
              <input className="mr-2" type="checkbox" checked={isRolesChecked} onChange={handleRolesFilterChange} />
              Roller
            </label>
          </div>
          <div>
            <label className="text-sm">
              <input
                className="mr-2"
                type="checkbox"
                checked={isOwnershipChecked}
                onChange={handleOwnershipFilterChange}
              />
              Eierskap
            </label>
          </div>
          <label className="text-xs">Min.</label>
          <input
            className="w-6 ag-input focus:outline-none text-right text-primary text-xs dark:text-white bg-gray-50 dark:bg-gray-700 rounded p-[0.1rem] mx-1"
            type="number"
            value={threshold}
            min={0}
            max={100}
            onChange={handleThresholdChange}
            disabled={!isOwnershipChecked}
          />
          <label className="text-xs">%</label>
          <p className="text-warning text-xs pt-4">Filtrering er under implementering og fungerer snart!</p>
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
