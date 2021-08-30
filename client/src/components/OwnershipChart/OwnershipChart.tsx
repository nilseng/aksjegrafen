import { KonvaEventObject } from "konva/lib/Node";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { Layer, Line, Stage } from "react-konva";
import * as d3 from "d3";

import { AppContext } from "../../App";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { ICompany, IOwnership, IShareholder } from "../../models/models";
import {
  useGetCompany,
  useGetOwnershipCount,
  useGetOwneeOwnerships,
  useGetShareholder,
  useGetOwnerOwnerships,
} from "../../services/apiService";
import { useQuery } from "../../hooks/useQuery";
import { useHistory } from "react-router-dom";
import Loading from "../Loading";
import { TreeNode } from "./TreeNode";

export const OwnershipChart = () => {
  const { theme } = useContext(AppContext);

  const { width, height } = useWindowDimensions();

  const [scroll, setScroll] = useState<{
    stageScale: number;
    stageX: number;
    stageY: number;
  }>({ stageScale: 1, stageX: 0, stageY: 0 });

  const history = useHistory();
  const query = useQuery();

  const [year, setYear] = useState<2019 | 2020>(2020);
  const [companyId, setCompanyId] = useState<string>();
  const [shareholder_id, setShareholder_id] = useState<string>();
  const [orgnr, setOrgnr] = useState<string>();
  const company = useGetCompany(companyId, orgnr);
  const shareholder = useGetShareholder(shareholder_id);
  const ownershipCount = useGetOwnershipCount(company, year);

  useEffect(() => {
    const c_id = query.get("_id");
    const orgnr = query.get("orgnr");
    const s_id = query.get("shareholder_id");
    setCompanyId(c_id ?? undefined);
    setOrgnr(orgnr ?? undefined);
    setShareholder_id(s_id ?? undefined);
  }, [query]);

  useEffect(() => {
    setScroll({ stageScale: 1, stageX: 0, stageY: 0 });
    setOwnerLinks(undefined);
    setOwneeLinks(undefined);
  }, [companyId, orgnr, shareholder_id]);

  const { ownerOwnerships, setOwnerOwnerships } =
    useGetOwnerOwnerships(company);
  const { owneeOwnerships, setOwneeOwnerships } = useGetOwneeOwnerships(
    company,
    shareholder?.orgnr ? undefined : shareholder
  );

  const [ownerNodes, setOwnerNodes] =
    useState<d3.HierarchyPointNode<ICompany | IOwnership>[]>();

  const [owneeNodes, setOwneeNodes] =
    useState<d3.HierarchyPointNode<ICompany | IOwnership | IShareholder>[]>();

  const [ownerLinks, setOwnerLinks] =
    useState<d3.HierarchyPointLink<ICompany | IOwnership>[]>();

  const [owneeLinks, setOwneeLinks] =
    useState<d3.HierarchyPointLink<ICompany | IOwnership | IShareholder>[]>();

  const ownerTree = useRef(d3.tree());
  const owneeTree = useRef(d3.tree());
  const nodeWidth = 200;
  const nodeHeight = 100;
  const verticalMargin = 100;
  const horizontalMargin = 40;
  ownerTree.current.size([width, height]);
  ownerTree.current.nodeSize([
    nodeWidth + horizontalMargin,
    nodeHeight + verticalMargin,
  ]);
  owneeTree.current.size([width, height]);
  owneeTree.current.nodeSize([
    nodeWidth + horizontalMargin,
    nodeHeight + verticalMargin,
  ]);

  useEffect(() => {
    if (company) {
      const root: d3.HierarchyPointNode<ICompany | IOwnership> =
        ownerTree.current(
          d3.hierarchy({
            ...company,
            children: ownerOwnerships
              ?.filter((o) => o.year === year)
              .slice(0, 5),
          })
        ) as d3.HierarchyPointNode<ICompany | IOwnership>;

      const nodes = root.descendants();

      // Centering tree, turning it "upside down" and adding top margin
      nodes.forEach((node) => {
        node.x += width / 2;
        node.y = height - node.y - height / 2;
      });
      const links = root.links();

      links.forEach((l) => ((l as any).keyPrefix = "owner"));

      setOwnerLinks(links);
      setOwnerNodes(nodes);
    }
    return () => setOwnerLinks(undefined);
  }, [width, height, ownerOwnerships, company, year]);

  useEffect(() => {
    if (company || shareholder) {
      const root: d3.HierarchyPointNode<ICompany | IOwnership | IShareholder> =
        company
          ? (owneeTree.current(
              d3.hierarchy({
                ...company,
                children: owneeOwnerships?.filter((o) => o.year === year),
              })
            ) as d3.HierarchyPointNode<ICompany | IOwnership>)
          : (owneeTree.current(
              d3.hierarchy({
                ...shareholder,
                children: owneeOwnerships?.filter((o) => o.year === year),
              })
            ) as d3.HierarchyPointNode<ICompany | IOwnership>);

      const nodes = root.descendants();

      // Aligning company tree with shareholder tree
      nodes.forEach((node) => {
        node.x += width / 2;
        node.y = node.y + height / 2;
      });
      const links = root.links();

      links.forEach((l) => ((l as any).keyPrefix = "ownee"));

      setOwneeLinks(links);
      setOwneeNodes(nodes);
    }
    return () => setOwneeLinks(undefined);
  }, [company, height, width, owneeOwnerships, shareholder, year]);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.04;
    const stage = e.target.getStage();
    if (
      stage &&
      stage.getPointerPosition()?.x &&
      stage.getPointerPosition()?.y
    ) {
      const oldScale = stage.scaleX();
      const mousePointTo = {
        x: stage.getPointerPosition()!.x / oldScale - stage.x() / oldScale,
        y: stage.getPointerPosition()!.y / oldScale - stage.y() / oldScale,
      };

      const newScale =
        e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      stage.scale({ x: newScale, y: newScale });

      setScroll({
        stageScale: newScale,
        stageX:
          -(mousePointTo.x - stage.getPointerPosition()!.x / newScale) *
          newScale,
        stageY:
          -(mousePointTo.y - stage.getPointerPosition()!.y / newScale) *
          newScale,
      });
    }
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    if (scroll?.stageScale)
      setScroll({
        stageScale: scroll?.stageScale,
        stageX: e.target.x(),
        stageY: e.target.y(),
      });
  };

  if (!ownerOwnerships && !owneeOwnerships)
    return (
      <Loading
        height={`${height - 58.78}px`}
        color={theme.primary}
        backgroundColor={theme.background}
      />
    );

  return (
    <>
      <div
        className="w-100 d-flex justify-content-center"
        style={{ position: "absolute", top: 100 }}
      >
        <span
          className="mx-2"
          style={{
            color: theme.text,
            fontWeight: year === 2020 ? "bold" : "normal",
            cursor: "pointer",
            zIndex: 10000,
          }}
          onClick={() => setYear(2020)}
        >
          2020
        </span>
        <span
          className="mx-2"
          style={{
            color: theme.text,
            fontWeight: year === 2019 ? "bold" : "normal",
            cursor: "pointer",
            zIndex: 10000,
          }}
          onClick={() => setYear(2019)}
        >
          2019
        </span>
      </div>
      <Stage
        className="fixed-top"
        width={width}
        height={height}
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        scaleX={scroll?.stageScale}
        scaleY={scroll?.stageScale}
        x={scroll?.stageX}
        y={scroll?.stageY}
        draggable
      >
        <Layer>
          {ownerLinks?.map((l) => (
            <Line
              key={`${(l as any).keyPrefix}-${l.source.data._id}-${
                l.target.data._id
              }`}
              points={[l.source.x, l.source.y, l.target.x, l.target.y]}
              stroke={theme.background}
              strokeWidth={1}
              shadowColor={theme.shadowColor}
              shadowBlur={3}
              cornerRadius={4}
              shadowOpacity={0.2}
            />
          ))}
        </Layer>
        <Layer>
          {owneeLinks?.map((l) => (
            <Line
              key={`${(l as any).keyPrefix}-${l.source.data._id}-${
                l.target.data._id
              }`}
              points={[l.source.x, l.source.y, l.target.x, l.target.y]}
              stroke={theme.background}
              strokeWidth={1}
              shadowColor={theme.shadowColor}
              shadowBlur={3}
              cornerRadius={4}
              shadowOpacity={0.2}
            />
          ))}
        </Layer>
        <Layer>
          {ownerNodes?.map((node) => (
            <TreeNode
              key={"owner-" + node.data._id}
              data={node.data}
              x={node.x}
              y={node.y}
              theme={theme}
              width={nodeWidth}
              height={nodeHeight}
              company={company}
              shareholder={shareholder}
              history={history}
              ownerCount={ownershipCount}
              setShareholderOwnerships={setOwnerOwnerships}
              setCompanyOwnerships={setOwneeOwnerships}
            />
          ))}
        </Layer>
        <Layer>
          {/* Consider the root as an owner node if there are any, otherwise use the first of the ownee nodes */}
          {owneeNodes?.slice(ownerNodes ? 1 : 0).map((node) => (
            <TreeNode
              key={"ownee" + node.data._id}
              data={node.data}
              x={node.x}
              y={node.y}
              theme={theme}
              width={nodeWidth}
              height={nodeHeight}
              company={company}
              shareholder={shareholder}
              history={history}
              ownerCount={ownershipCount}
              owneeCount={
                owneeOwnerships?.filter((o) => o.year === year).length
              }
              setShareholderOwnerships={setOwnerOwnerships}
              setCompanyOwnerships={setOwneeOwnerships}
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
};
