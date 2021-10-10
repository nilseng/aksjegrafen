import { KonvaEventObject } from "konva/lib/Node";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { Layer, Line, Stage } from "react-konva";

import { AppContext } from "../../App";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { ICompany, IShareholder } from "../../models/models";
import {
  useGetCompany,
  useInvestorCount,
  useInvestments,
  useGetShareholder,
  useInvestors,
} from "../../services/apiService";
import { useQuery } from "../../hooks/useQuery";
import { useHistory } from "react-router-dom";
import Loading from "../Loading";
import { TreeNode } from "./TreeNode";
import { ITreeDimensions, useSimpleTree } from "../Graph/GraphUtils";

const treeConfig: ITreeDimensions = {
  width: 1000,
  height: 1000,
  nodeMargins: {
    horisontal: 40,
    vertical: 100,
  },
  nodeDimensions: {
    width: 200,
    height: 100,
  },
};

export const OwnershipChart = () => {
  const { theme } = useContext(AppContext);

  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (width && height) {
      treeConfig.width = width;
      treeConfig.height = height;
    }
  }, [width, height]);

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
  const [entity, setEntity] = useState<ICompany | IShareholder>();
  const { count: ownershipCount, loading: loadingOwnershipCount } =
    useInvestorCount(company, year);

  useEffect(() => {
    const c_id = query.get("_id");
    const orgnr = query.get("orgnr");
    const s_id = query.get("shareholder_id");
    setCompanyId(c_id ?? undefined);
    setOrgnr(orgnr ?? undefined);
    setShareholder_id(s_id ?? undefined);
  }, [query]);

  useEffect(() => {
    setEntity(company ?? shareholder);
  }, [company, shareholder]);

  const {
    investors,
    setInvestors,
    loading: loadingOwnerOwnerships,
  } = useInvestors(company, year, 5);

  const {
    investments,
    setInvestments,
    loading: loadingOwneeOwnerships,
  } = useInvestments(entity, year, 5);

  useEffect(() => {
    if (shareholder?.orgnr) setOrgnr(shareholder.orgnr);
  }, [shareholder]);

  const {
    investorNodes,
    investorLinks,
    setInvestorLinks,
    investmentNodes,
    investmentLinks,
    setInvestmentLinks,
  } = useSimpleTree(treeConfig, entity, investors, investments);

  // Hack to reset state when query changes
  useEffect(() => {
    setScroll({ stageScale: 1, stageX: 0, stageY: 0 });
    setInvestorLinks(undefined);
    setInvestmentLinks(undefined);
  }, [companyId, orgnr, setInvestmentLinks, setInvestorLinks, shareholder_id]);

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

  if (loadingOwnerOwnerships || loadingOwneeOwnerships || loadingOwnershipCount)
    return <Loading color={theme.primary} backgroundColor={theme.background} />;

  return (
    <>
      <div
        className="w-100 d-flex justify-content-center"
        style={{ position: "absolute", top: 100 }}
      >
        <span
          className="py-2 px-4"
          style={
            year === 2020
              ? {
                  color: theme.primary,
                  fontWeight: "bold",
                  cursor: "pointer",
                  zIndex: 10000,
                }
              : {
                  color: theme.muted,
                  fontWeight: "normal",
                  cursor: "pointer",
                  zIndex: 10000,
                  ...theme.button,
                }
          }
          onClick={() => setYear(2020)}
        >
          2020
        </span>
        <span
          className="py-2 px-4"
          style={
            year === 2019
              ? {
                  color: theme.primary,
                  fontWeight: "bold",
                  cursor: "pointer",
                  zIndex: 10000,
                }
              : {
                  color: theme.muted,
                  fontWeight: "normal",
                  cursor: "pointer",
                  zIndex: 10000,
                  ...theme.button,
                }
          }
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
          {investorLinks?.map((l) => (
            <Line
              key={`${(l as any).keyPrefix}-${l.source.data.entity._id}-${
                l.target.data.entity._id
              }`}
              points={[
                l.source.x + treeConfig.nodeDimensions.width / 2,
                l.source.y + treeConfig.nodeDimensions.height / 2,
                l.target.x + treeConfig.nodeDimensions.width / 2,
                l.target.y + treeConfig.nodeDimensions.height / 2,
              ]}
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
          {investmentLinks?.map((l) => (
            <Line
              key={`${(l as any).keyPrefix}-${l.source.data.entity._id}-${
                l.target.data.entity._id
              }`}
              points={[
                l.source.x + treeConfig.nodeDimensions.width / 2,
                l.source.y + treeConfig.nodeDimensions.height / 2,
                l.target.x + treeConfig.nodeDimensions.width / 2,
                l.target.y + treeConfig.nodeDimensions.height / 2,
              ]}
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
          {investorNodes?.map((node) => (
            <TreeNode
              key={"owner-" + node.data.entity._id}
              data={node.data.entity}
              x={node.x}
              y={node.y}
              theme={theme}
              width={treeConfig.nodeDimensions.width}
              height={treeConfig.nodeDimensions.height}
              company={company}
              shareholder={shareholder}
              history={history}
              ownerCount={ownershipCount}
              setShareholderOwnerships={setInvestors}
              setCompanyOwnerships={setInvestments}
            />
          ))}
        </Layer>
        <Layer>
          {/* Consider the root as an owner node if there are any, otherwise use the first of the ownee nodes */}
          {investmentNodes?.slice(investmentNodes ? 1 : 0).map((node) => (
            <TreeNode
              key={"investment" + node.data.entity._id}
              data={node.data.entity}
              x={node.x}
              y={node.y}
              theme={theme}
              width={treeConfig.nodeDimensions.width}
              height={treeConfig.nodeDimensions.height}
              company={company}
              shareholder={shareholder}
              history={history}
              ownerCount={ownershipCount}
              owneeCount={investments?.length}
              setShareholderOwnerships={setInvestors}
              setCompanyOwnerships={setInvestments}
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
};
