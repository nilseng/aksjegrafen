import { useContext } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { GraphLink as IGraphLink } from "../../models/models";
import { RootState } from "../../store";

export const GraphLink = ({ link }: { link: IGraphLink }) => {
  const { theme } = useContext(AppContext);

  const roleTypes = useSelector<RootState, RootState["roles"]["data"]>((state) => state.roles.data);

  return (
    <>
      <line className="graph-link" stroke={theme.primary} strokeWidth={1} />
      <g className="graph-link-arrow">
        <line x1={-5} y1={-5} x2={0} y2={0} stroke={theme.primary} strokeWidth="2" strokeLinecap="round" />
        <line x1={0} y1={0} x2={5} y2={-5} stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
        <foreignObject width={200} height={50} transform={"translate(30, -100) rotate(90)"}>
          <p className="font-bold text-primary text-xs text-center">
            {roleTypes?.find((role) => role.kode === link.type)?.beskrivelse ??
              (link.type === "OWNS" ? "Eier" : link.type)}
          </p>
        </foreignObject>
        {link.type === "OWNS" && (
          <foreignObject
            className="text-xs text-primary text-center"
            width={200}
            height={50}
            transform={"translate(-10, -100) rotate(90)"}
          >
            <p>{link.properties.stocks?.toLocaleString(navigator.language)} aksjer</p>
            <p>{((link.properties.share ?? 0) * 100).toFixed(0)}%</p>
          </foreignObject>
        )}
      </g>
    </>
  );
};
