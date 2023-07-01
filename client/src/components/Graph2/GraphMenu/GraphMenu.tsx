import { faListAlt } from "@fortawesome/free-regular-svg-icons";
import { faDollarSign, faList, faWindowRestore, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppContext } from "../../../AppContext";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import { GraphNode, GraphNodeLabel, GraphType } from "../../../models/models";
import { closeMenu, setSource } from "../../../slices/graphSlice";
import { ModalContent, open as openModal, setContent } from "../../../slices/modalSlice";
import { getBaseUrl } from "../../../utils/utils";
import { GraphLogo } from "../../GraphLogo";
import { GraphMenuItem } from "./GraphMenuItem";

export interface MenuItem {
  node: GraphNode;
  name: string;
  icon?: IconDefinition;
  svgIcon?: JSX.Element;
  border?: boolean;
  action?: ((node: GraphNode) => Promise<void>) | ((node: GraphNode) => void);
  condition?: boolean;
}

export interface Menu {
  open: boolean;
  node?: GraphNode;
  x?: number;
  y?: number;
}

export const GraphMenu = ({ open, node, x, y }: Menu) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { theme } = useContext(AppContext);
  const { width, height } = useWindowDimensions();

  const [pos, setPos] = useState<{ x: number; y: number }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>();

  // If there is not enough space to display the ctx menu to the right/below clicked item,
  // adjust the position with the height/width of the ctx menu.
  useEffect(() => {
    if ((x || x === 0) && (y || y === 0) && node) {
      setPos({ x: Math.min(x, width - 200), y: Math.min(y, height - 395) });
    }
    return () => setPos(undefined);
  }, [height, width, x, y, node]);

  useEffect(() => {
    if (node) {
      setMenuItems([
        { name: node.properties.name, border: true, node },
        {
          name: "Regnskap",
          icon: faDollarSign,
          node,
          condition: node.labels.includes(GraphNodeLabel.Company),
          action: () => {
            dispatch(setSource(node));
            dispatch(openModal());
            dispatch(setContent(ModalContent.Financials));
            dispatch(closeMenu());
          },
        },
        {
          name: "Åpne i ny graf",
          svgIcon: <GraphLogo width="16px" height="16px" />,
          node,
          action: () => {
            history.push(`/graph2?graphType=${GraphType.Default}&sourceUuid=${node.properties.uuid}`);
            dispatch(closeMenu());
          },
        },
        {
          name: "Åpne i ny fane",
          icon: faWindowRestore,
          node,
          action: () => {
            window.open(`${getBaseUrl()}/graph2?graphType=${GraphType.Default}&sourceUuid=${node.properties.uuid}`);
            dispatch(closeMenu());
          },
        },
        {
          name: "Investeringstabell",
          condition: !!node.labels.includes(GraphNodeLabel.Shareholder),
          icon: faListAlt,
          node,
          action: () => {
            dispatch(setSource(node));
            dispatch(openModal());
            dispatch(setContent(ModalContent.InvestmentTable));
            dispatch(closeMenu());
          },
        },
        {
          name: "Investortabell",
          condition: !!node.labels.includes(GraphNodeLabel.Company),
          icon: faList,
          node,
          action: () => {
            dispatch(setSource(node));
            dispatch(openModal());
            dispatch(setContent(ModalContent.InvestorTable));
            dispatch(closeMenu());
          },
        },
      ]);
    }
  }, [dispatch, history, node]);

  if (!open || !node || !menuItems) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: pos?.y ?? y,
        left: pos?.x ?? x,
        backgroundColor: theme.background,
        ...theme.elevation,
        borderRadius: "8px",
      }}
    >
      {menuItems?.map((item) =>
        item.condition !== false ? (
          <GraphMenuItem
            key={item.name}
            name={item.name}
            node={node}
            icon={item.icon}
            svgIcon={item.svgIcon}
            action={item.action}
            border={item.border}
          />
        ) : null
      )}
    </div>
  );
};
