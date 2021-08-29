import { KonvaEventObject } from "konva/lib/Node";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import * as d3 from "d3";

import { AppContext } from "../../App";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { ICompany, IOwnership } from "../../models/models";
import {
  useGetCompany,
  useGetOwnershipCount,
  useGetShareholderOwnerships,
  useGetCompanyOwnerships,
} from "../../services/apiService";
import { useQuery } from "../../hooks/useQuery";
import { useHistory } from "react-router-dom";
import { isAksjeselskap } from "../../utils/isAksjeselskap";
import Loading from "../Loading";

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

  const [companyId, setCompanyId] = useState<string>();
  const [orgnr, setOrgnr] = useState<string>();
  const company = useGetCompany(companyId, orgnr);
  const ownershipCount = useGetOwnershipCount(company, 2020);

  useEffect(() => {
    const _id = query.get("_id");
    const orgnr = query.get("orgnr");
    setCompanyId(_id ?? undefined);
    setOrgnr(orgnr ?? undefined);
  }, [query]);

  useEffect(() => {
    setScroll({ stageScale: 1, stageX: 0, stageY: 0 });
  }, [companyId, orgnr]);

  const { shareholderOwnerships, setShareholderOwnerships } =
    useGetShareholderOwnerships(company);
  const { companyOwnerships, setCompanyOwnerships } =
    useGetCompanyOwnerships(company);

  const [shareholderNodes, setShareholderNodes] =
    useState<d3.HierarchyPointNode<ICompany | IOwnership>[]>();

  const [companyNodes, setCompanyNodes] =
    useState<d3.HierarchyPointNode<ICompany | IOwnership>[]>();

  const [shareholderLinks, setShareholderLinks] =
    useState<d3.HierarchyPointLink<ICompany | IOwnership>[]>();

  const [companyLinks, setCompanyLinks] =
    useState<d3.HierarchyPointLink<ICompany | IOwnership>[]>();

  const shareholderTree = useRef(d3.tree());
  const companyTree = useRef(d3.tree());
  const nodeWidth = 200;
  const nodeHeight = 100;
  const verticalMargin = 100;
  const horizontalMargin = 40;
  shareholderTree.current.size([width, height]);
  shareholderTree.current.nodeSize([
    nodeWidth + horizontalMargin,
    nodeHeight + verticalMargin,
  ]);
  companyTree.current.size([width, height]);
  companyTree.current.nodeSize([
    nodeWidth + horizontalMargin,
    nodeHeight + verticalMargin,
  ]);

  useEffect(() => {
    if (company) {
      const root: d3.HierarchyPointNode<ICompany | IOwnership> =
        shareholderTree.current(
          d3.hierarchy({
            ...company,
            children: shareholderOwnerships
              ?.filter((o) => o.year === 2020)
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

      setShareholderLinks(links);
      setShareholderNodes(nodes);
    }
  }, [width, height, shareholderOwnerships, company]);

  useEffect(() => {
    if (company) {
      const root: d3.HierarchyPointNode<ICompany | IOwnership> =
        companyTree.current(
          d3.hierarchy({
            ...company,
            children: companyOwnerships?.filter((o) => o.year === 2020),
          })
        ) as d3.HierarchyPointNode<ICompany | IOwnership>;

      const nodes = root.descendants();

      // Aligning company tree with shareholder tree
      nodes.forEach((node) => {
        node.x += width / 2;
        node.y = node.y + height / 2;
      });
      const links = root.links();

      setCompanyLinks(links);
      setCompanyNodes(nodes);
    }
  }, [company, height, companyOwnerships, width]);

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

  if (!shareholderOwnerships)
    return (
      <Loading
        height={`${height - 58.78}px`}
        color={theme.primary}
        backgroundColor={theme.background}
      />
    );

  return (
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
        {shareholderLinks &&
          companyLinks &&
          [...shareholderLinks, ...companyLinks]?.map((l) => (
            <Line
              key={`${l.source.data._id}-${l.target.data._id}`}
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
        {shareholderNodes?.map((node) => (
          <TreeNode
            key={node.data._id}
            data={node.data}
            x={node.x}
            y={node.y}
            theme={theme}
            width={nodeWidth}
            height={nodeHeight}
            company={company}
            history={history}
            ownerCount={ownershipCount}
            setShareholderOwnerships={setShareholderOwnerships}
            setCompanyOwnerships={setCompanyOwnerships}
          />
        ))}
      </Layer>
      <Layer>
        {companyNodes?.slice(1).map((node) => (
          <TreeNode
            key={node.data._id}
            data={node.data}
            x={node.x}
            y={node.y}
            theme={theme}
            width={nodeWidth}
            height={nodeHeight}
            company={company}
            history={history}
            ownerCount={ownershipCount}
            setShareholderOwnerships={setShareholderOwnerships}
            setCompanyOwnerships={setCompanyOwnerships}
          />
        ))}
      </Layer>
    </Stage>
  );
};

interface ITreeNodeProps {
  data: ICompany | IOwnership;
  x: number;
  y: number;
  width: number;
  height: number;
  theme: any;
  company?: ICompany;
  history: any;
  ownerCount?: number;
  setShareholderOwnerships?: React.Dispatch<
    React.SetStateAction<IOwnership[] | undefined>
  >;
  setCompanyOwnerships?: React.Dispatch<
    React.SetStateAction<IOwnership[] | undefined>
  >;
}

const TreeNode = ({
  data,
  x,
  y,
  width,
  height,
  theme,
  company,
  history,
  ownerCount,
  setShareholderOwnerships,
  setCompanyOwnerships,
}: ITreeNodeProps) => {
  const handleClick = () => {
    if (isAksjeselskap((data as IOwnership)?.shareholder)) {
      if (setShareholderOwnerships) setShareholderOwnerships(undefined);
      if (setCompanyOwnerships) setCompanyOwnerships(undefined);
      history.push(
        `/ownership-chart?orgnr=${(data as IOwnership).shareholder?.orgnr}`
      );
    } else if ((data as IOwnership).company) {
      if (setShareholderOwnerships) setShareholderOwnerships(undefined);
      if (setCompanyOwnerships) setCompanyOwnerships(undefined);
      history.push(
        `/ownership-chart?orgnr=${(data as IOwnership).company?.orgnr}`
      );
    }
  };

  const companyOwnershipShare =
    data.stocks && (data as IOwnership)?.company?.stocks
      ? (data?.stocks / (data as any).company.stocks) * 100
      : NaN;

  return (
    <Group
      onMouseEnter={(e) => {
        if (
          isAksjeselskap((data as IOwnership)?.shareholder) ||
          (data as IOwnership).company
        ) {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = "pointer";
        }
      }}
      onMouseLeave={(e) => {
        if (
          isAksjeselskap((data as IOwnership)?.shareholder) ||
          (data as IOwnership).company
        ) {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = "default";
        }
      }}
      onClick={handleClick}
      onTap={handleClick}
    >
      <ChartRect x={x} y={y} theme={theme} width={width} height={height} />
      <Text
        x={x - width / 2}
        y={y - height / 2 + 4}
        width={width}
        text={
          (data as ICompany)?.name ||
          (data as IOwnership)?.shareholder?.name ||
          (data as IOwnership)?.company?.name
        }
        fill={theme.text}
        align={"left"}
        wrap={"none"}
        ellipsis={true}
        padding={8}
        fontSize={12}
        fontStyle={"bold"}
      />
      {company?.stocks &&
        data.stocks &&
        ((data as IOwnership)?.company || (data as IOwnership)?.shareholder) &&
        !(data as IOwnership)?.company && (
          <Text
            x={x - width / 2}
            y={y - height / 2 + 4 + 24}
            width={width}
            text={`${(
              (data.stocks / company.stocks) *
              100
            ).toFixed()}% eierskap`}
            fill={theme.primary}
            align={"left"}
            padding={12}
            fontSize={12}
            fontStyle={"bold"}
          />
        )}
      {company?.stocks &&
        (data as IOwnership)?.company?.stocks &&
        data.stocks && (
          <Text
            x={x - width / 2}
            y={y - height / 2 + 4 + 24}
            width={width}
            text={`${companyOwnershipShare.toFixed()}% eid av ${company.name}`}
            fill={theme.primary}
            align={"left"}
            wrap={"none"}
            ellipsis={true}
            padding={12}
            fontSize={12}
            fontStyle={"bold"}
          />
        )}
      {!(data as IOwnership)?.company && !(data as IOwnership)?.shareholder && (
        <Text
          x={x - width / 2}
          y={y - height / 2 + 4 + 24}
          width={width}
          text={
            ownerCount
              ? ownerCount === 1
                ? `${ownerCount?.toLocaleString()} aksjonær`
                : `${ownerCount?.toLocaleString()} aksjonærer`
              : ""
          }
          fill={theme.primary}
          align={"left"}
          wrap={"none"}
          ellipsis={true}
          padding={12}
          fontSize={12}
          fontStyle={"bold"}
        />
      )}
      <Text
        x={x - width / 2}
        y={y - height / 2 + 4 + 60}
        width={width}
        text={`${data.stocks?.toLocaleString()} aksjer`}
        fill={theme.text}
        align={"left"}
        wrap={"none"}
        ellipsis={true}
        padding={12}
        fontSize={12}
      />
    </Group>
  );
};

interface IChartRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  theme: any;
}

const ChartRect = ({ x, y, width, height, theme }: IChartRectProps) => {
  const handleClick = (e: any) => {
    console.log(e);
  };
  const [offset, setOffset] = useState<{ x: number; y: number }>();

  useEffect(() => {
    setOffset({ x: width / 2, y: height / 2 });
  }, [height, width]);

  if (!offset) return null;

  return (
    <Rect
      x={x - offset.x}
      y={y - offset.y}
      width={width}
      height={height}
      fill={theme.background}
      shadowColor={theme.shadowColor}
      shadowBlur={3}
      cornerRadius={4}
      shadowOpacity={0.2}
      onClick={handleClick}
    />
  );
};
