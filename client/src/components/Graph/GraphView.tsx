import { useContext, useRef } from "react";
import { AppContext } from "../../App";
import { ICompany, IShareholder, isOwnership } from "../../models/models";
import { GraphNode } from "./GraphNode";
import {
  IForceSimulationNode,
  INodeDimensions,
  ISimpleTreeNode,
  isSimpleTreeNode,
  useZoom,
} from "./GraphUtils";

interface IProps {
  nodeDimensions: INodeDimensions;
  nodes: (IForceSimulationNode | ISimpleTreeNode)[];
}

export const GraphView = ({ nodeDimensions, nodes }: IProps) => {
  const { theme } = useContext(AppContext);

  const svgRef = useRef<SVGSVGElement>(null);
  const svgTranslate = useZoom(svgRef);
  return (
    <div className="d-flex w-100 h-100 p-4">
      <div className="d-flex w-100 h-100" style={{ ...theme.lowering }}>
        <svg
          ref={svgRef}
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={"0 0 1000 1000"}
        >
          <g transform={svgTranslate}>
            {nodes.map((node) => {
              if (isSimpleTreeNode(node)) {
                const ownership = isOwnership(node.data.entity)
                  ? node.data.entity
                  : null;
                const company = ownership?.company;
                const shareholder = ownership?.shareholder;
                if (company && company?.orgnr) {
                  return (
                    <GraphNode
                      key={ownership?._id}
                      {...node}
                      id={company.orgnr}
                      entity={company}
                      {...nodeDimensions}
                    />
                  );
                }
                if (shareholder) {
                  return (
                    <GraphNode
                      key={ownership?._id}
                      {...node}
                      id={shareholder.id}
                      entity={shareholder}
                      {...nodeDimensions}
                    />
                  );
                } else {
                  return (
                    <GraphNode
                      key={node.data.entity._id}
                      {...node}
                      {...node.data}
                      entity={node.data.entity as ICompany | IShareholder}
                      {...nodeDimensions}
                    />
                  );
                }
              } else {
                return (
                  <GraphNode
                    key={node.entity._id}
                    {...node}
                    {...nodeDimensions}
                  />
                );
              }
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
