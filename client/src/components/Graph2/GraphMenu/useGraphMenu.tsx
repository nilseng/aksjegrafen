import { faDollarSign, faList, faListAlt, faWindowRestore } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { GraphNode, GraphNodeLabel, GraphType } from "../../../models/models";
import { closeMenu, setSource } from "../../../slices/graphSlice";
import { ModalContent, open as openModal, setContent } from "../../../slices/modalSlice";
import { getBaseUrl } from "../../../utils/utils";
import { GraphLogo } from "../../GraphLogo";
import { MenuItem } from "./GraphMenu";

export const useGraphMenu = (node?: GraphNode) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const [menuItems, setMenuItems] = useState<MenuItem[]>();

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
      ]);
    }
  }, [dispatch, history, node]);

  return menuItems;
};
