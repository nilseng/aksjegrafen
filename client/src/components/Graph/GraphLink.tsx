import { format } from "d3";
import { useContext } from "react";
import { useSelector } from "react-redux";
import { AppContext } from "../../AppContext";
import { GraphLinkType, GraphLink as IGraphLink } from "../../models/models";
import { RootState } from "../../store";
import { graphConfig } from "./GraphConfig";

const formatNumber = (num: number) => (num >= 100 ? format(".3s")(num) : format(".0f")(num));

export const GraphLink = ({ link }: { link: IGraphLink }) => {
  const { theme } = useContext(AppContext);

  const roleTypes = useSelector<RootState, RootState["roles"]["data"]>((state) => state.roles.data);

  if (link.source.properties.uuid === link.target.properties.uuid)
    return (
      <>
        <circle
          className="graph-circle-link"
          fill="transparent"
          stroke={theme.primary}
          strokeWidth="1"
          cx={graphConfig.nodeDimensions.width / 2}
          cy={0}
          r="40"
        />
        <g className="graph-link-arrow">
          <line
            x1={graphConfig.nodeDimensions.width / 2 + 35}
            y1={-5}
            x2={graphConfig.nodeDimensions.width / 2 + 40}
            y2={0}
            stroke={theme.primary}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={graphConfig.nodeDimensions.width / 2 + 40}
            y1={0}
            x2={graphConfig.nodeDimensions.width / 2 + 45}
            y2={-5}
            stroke={theme.secondary}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <foreignObject
            className="text-primary text-xs text-center"
            width={200}
            height={50}
            transform={`translate(${graphConfig.nodeDimensions.width / 2 + 4}, -12)`}
          >
            {link.type !== GraphLinkType.OWNS && (
              <p className="font-bold">
                {roleTypes?.find((role) => role.kode === link.type)?.beskrivelse ?? link.type}
              </p>
            )}
            {link.properties.stocks && (
              <p>
                <span className="font-bold pr-1">{((link.properties.share ?? 0) * 100).toFixed(0)}%</span>(
                {formatNumber(link.properties.stocks)}){" "}
              </p>
            )}
          </foreignObject>
        </g>
      </>
    );

  return (
    <>
      <line className="graph-link" stroke={theme.primary} strokeWidth={1} />
      <g className="graph-link-arrow">
        <line x1={-5} y1={-5} x2={0} y2={0} stroke={theme.primary} strokeWidth="2" strokeLinecap="round" />
        <line x1={0} y1={0} x2={5} y2={-5} stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
      </g>
      <foreignObject
        className="graph-link-text text-primary text-xs text-center pt-2"
        width={200}
        height={100}
        transform={"translate(0, 0)"}
      >
        {link.type !== GraphLinkType.OWNS && (
          <span className="bg-gray-50/90 dark:bg-gray-800/90 rounded py-1 px-2">
            <span className="font-bold">
              {roleTypes?.find((role) => role.kode === link.type)?.beskrivelse ?? link.type}
            </span>
          </span>
        )}
        {link.properties.stocks && (
          <span className="bg-gray-50/90 dark:bg-gray-800/90 rounded py-1 px-2">
            <span className="font-bold pr-1">{((link.properties.share ?? 0) * 100).toFixed(0)}%</span>(
            {formatNumber(link.properties.stocks)}){" "}
          </span>
        )}
      </foreignObject>
    </>
  );
};
