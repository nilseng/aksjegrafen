import { useContext } from "react";
import { AppContext } from "../../AppContext";
import { GraphLink as IGraphLink } from "../../models/models";
import { useRoleTypes } from "../../services/brregService";

export const GraphLink = ({ link }: { link: IGraphLink }) => {
  const { theme } = useContext(AppContext);

  const roleTypes = useRoleTypes();

  return (
    <>
      <line className="graph-link" stroke={theme.primary} strokeWidth={1} />
      <g className="graph-link-arrow">
        <line x1={-5} y1={-5} x2={0} y2={0} stroke={theme.primary} strokeWidth="2" strokeLinecap="round" />
        <line x1={0} y1={0} x2={5} y2={-5} stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
        <foreignObject width={200} height={50} transform={"translate(30, -24) rotate(90)"}>
          <p className="font-bold text-primary">
            {roleTypes?.find((role) => role.kode === link.type)?.beskrivelse ??
              (link.type === "OWNS" ? "Eier" : link.type)}
          </p>
        </foreignObject>
      </g>
    </>
  );
};
