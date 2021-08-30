import { Group, Text } from "react-konva";
import { ICompany, IOwnership, IShareholder } from "../../models/models";
import { isAksjeselskap } from "../../utils/isAksjeselskap";
import { ChartRect } from "./ChartRect";

interface ITreeNodeProps {
  data: ICompany | IOwnership;
  x: number;
  y: number;
  width: number;
  height: number;
  theme: any;
  company?: ICompany;
  shareholder?: IShareholder;
  history: any;
  ownerCount?: number;
  owneeCount?: number;
  setShareholderOwnerships?: React.Dispatch<
    React.SetStateAction<IOwnership[] | undefined>
  >;
  setCompanyOwnerships?: React.Dispatch<
    React.SetStateAction<IOwnership[] | undefined>
  >;
}

export const TreeNode = ({
  data,
  x,
  y,
  width,
  height,
  theme,
  company,
  shareholder,
  history,
  ownerCount,
  owneeCount,
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
    } else if (
      (data as IOwnership).company &&
      (data as IOwnership).company?._id !== company?._id
    ) {
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
            text={`${
              (data.stocks / company.stocks) * 100 < 1
                ? ((data.stocks / company.stocks) * 100).toPrecision(2)
                : ((data.stocks / company.stocks) * 100).toFixed(2)
            }% eierskap`}
            fill={theme.primary}
            align={"left"}
            padding={12}
            fontSize={12}
            fontStyle={"bold"}
          />
        )}
      {((data as IShareholder).kind || (data as IShareholder).kind === 0) &&
      shareholder &&
      owneeCount ? (
        <Text
          x={x - width / 2}
          y={y - height / 2 + 4 + 24}
          width={width}
          text={
            owneeCount
              ? owneeCount !== 1
                ? `${owneeCount} investeringer`
                : `${owneeCount} investering`
              : ""
          }
          fill={theme.primary}
          align={"left"}
          padding={12}
          fontSize={12}
          fontStyle={"bold"}
        />
      ) : (
        <Text text="" />
      )}
      {(company?.stocks || shareholder?.kind || shareholder?.kind === 0) &&
      (data as IOwnership)?.company?.stocks &&
      data.stocks ? (
        <Text
          x={x - width / 2}
          y={y - height / 2 + 4 + 24}
          width={width}
          text={`${
            companyOwnershipShare < 1
              ? companyOwnershipShare.toPrecision(2)
              : companyOwnershipShare.toFixed(2)
          }% eid av ${company?.name || shareholder?.name}`}
          fill={theme.primary}
          align={"left"}
          wrap={"none"}
          ellipsis={true}
          padding={12}
          fontSize={12}
          fontStyle={"bold"}
        />
      ) : (
        <Text text="" />
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
      {!((data as IShareholder).kind || (data as IShareholder).kind === 0) && (
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
      )}
    </Group>
  );
};
