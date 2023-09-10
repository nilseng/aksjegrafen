import { format } from "d3";
import { useContext } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { GraphLink as IGraphLink } from "../../models/models";
import { RootState } from "../../store";

const formatNumber = (num: number) => (num >= 100 ? format(".3s")(num) : format(".0f")(num));

export const GraphLink = ({ link }: { link: IGraphLink }) => {
  const { theme } = useContext(AppContext);

  const roleTypes = useSelector<RootState, RootState["roles"]["data"]>((state) => state.roles.data);

  return (
    <>
      <line className="graph-link" stroke={theme.primary} strokeWidth={1} />
      <g className="graph-link-arrow">
        <line x1={-5} y1={-5} x2={0} y2={0} stroke={theme.primary} strokeWidth="2" strokeLinecap="round" />
        <line x1={0} y1={0} x2={5} y2={-5} stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
        <foreignObject
          className="text-primary text-xs text-center"
          width={200}
          height={50}
          transform={"translate(24, -100) rotate(90)"}
        >
          {link.type !== "OWNS" && (
            <p className="font-bold">{roleTypes?.find((role) => role.kode === link.type)?.beskrivelse ?? link.type}</p>
          )}
          {link.properties.stocks && (
            <p>
              <span className="font-bold pr-1">{((link.properties.share ?? 0) * 100).toFixed(0)}%</span>(
              {formatNumber(link.properties.stocks)} aksjer){" "}
            </p>
          )}
        </foreignObject>
      </g>
    </>
  );
};
