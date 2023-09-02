import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { availableYears } from "../config";
import { useNumberFormatter } from "../hooks/useNumberFormatter";
import { ICompany, IOwnership, IShareholder, Year } from "../models/models";
import { NeuButton } from "./NeuButton";

const getCompanyStocks = (
  o: IOwnership,
  year: Year,
  stockClass?: string,
  investor?: IShareholder,
  investment?: ICompany
): number | undefined => {
  if (investor) return o.investment?.shares?.[year]?.[stockClass ?? "total"];
  if (investment) return investment?.shares?.[year]?.[stockClass ?? "total"];
};

const getOwnershipShare = (
  o: IOwnership,
  year: Year,
  stockClass: string,
  investor?: IShareholder,
  investment?: ICompany
): number | null => {
  const companyStocks = getCompanyStocks(o, year, stockClass, investor, investment);
  if (!companyStocks) return null;
  return (o.holdings[year]?.[stockClass ?? "total"] ?? 0) / companyStocks;
};

const getOwnershipShareText = ({
  ownership,
  year,
  stockClass,
  investor,
  investment,
}: {
  ownership: IOwnership;
  year: Year;
  stockClass: string;
  investor?: IShareholder;
  investment?: ICompany;
}): string => {
  const share = getOwnershipShare(ownership, year, stockClass, investor, investment);
  if (!share) return "";
  return `${(share * 100).toFixed(1)}%`;
};

const getOwnershipChange = (o: IOwnership, year: Year, stockClass: string) => {
  if (year === Math.min(...availableYears)) return null;
  const cy = o.holdings[year]?.[stockClass] ?? 0;
  const ly = o.holdings[(year - 1) as Year]?.[stockClass] ?? 0;
  if (!cy && !ly) return null;
  return cy - ly;
};

const getOwnershipChangeText = (
  o: IOwnership,
  year: Year,
  formatNumber: (num: number) => string | undefined,
  stockClass: string
) => {
  const change = getOwnershipChange(o, year, stockClass);
  if (!change) return <p style={{ height: "1rem" }}></p>;
  if (change > 0)
    return (
      <p className="text-xs text-success m-0" style={{ height: "1rem" }}>
        +{formatNumber(change)}
      </p>
    );
  return (
    <p className="text-xs text-danger m-0" style={{ height: "1rem" }}>
      {formatNumber(change)}
    </p>
  );
};

const getStockClasses = (ownership: IOwnership) => {
  const stockClasses = new Set<string>();
  Object.values(ownership.holdings).forEach((annualHoldings) => {
    if (!annualHoldings) return;
    Object.keys(annualHoldings).forEach((stockClass) => {
      if (stockClass !== "total") stockClasses.add(stockClass);
    });
  });
  return Array.from(stockClasses).sort((a, b) => (a < b ? -1 : 1));
};

export const OwnershipDetail = ({
  ownership,
  investor,
  investment,
}: {
  ownership: IOwnership;
  investor?: IShareholder;
  investment?: ICompany;
}) => {
  const formatNumber = useNumberFormatter();

  const [stockClasses, setStockClasses] = useState<string[]>();

  const [isDetailsVisible, setIsDetailsVisible] = useState<boolean>();

  useEffect(() => {
    setStockClasses(getStockClasses(ownership));
  }, [ownership]);

  return (
    <>
      {availableYears.map((year) => (
        <div key={year} className="w-1/6 px-1 py-2">
          {ownership.holdings[year] ? (
            <>
              <p className="font-bold text-xs m-0" style={{ height: "1rem" }}>
                {getOwnershipShareText({ ownership, year, stockClass: "total", investor, investment })}
              </p>
              {isDetailsVisible && (
                <>
                  <p className="text-xs font-bold">Totalt</p>
                  <p className="text-xs m-0" style={{ height: "1rem" }}>
                    {ownership.holdings[year]?.total ? formatNumber(ownership.holdings[year]?.total!) : ""}
                  </p>
                  {getOwnershipChangeText(ownership, year, formatNumber, "total")}
                  {stockClasses?.map((stockClass: string) => (
                    <div key={stockClass}>
                      {ownership.holdings[year] ? (
                        <p className="font-bold text-xs text-ellipsis overflow-hidden">{stockClass}</p>
                      ) : null}
                      <p className="text-xs m-0" style={{ height: "1rem" }}>
                        {ownership.holdings[year]?.[stockClass]
                          ? formatNumber(ownership.holdings[year]?.[stockClass]!)
                          : ""}
                      </p>
                      {getOwnershipChangeText(ownership, year, formatNumber, stockClass)}
                    </div>
                  ))}
                </>
              )}
            </>
          ) : null}
        </div>
      ))}
      <div className="w-1/12">
        <NeuButton
          className="w-6 sm:w-8 h-6 sm:h-8 p-1 sm:p-2"
          style={{ borderRadius: "100%" }}
          textClassName="text-primary"
          icon={isDetailsVisible ? faChevronDown : faChevronRight}
          action={() => setIsDetailsVisible(!isDetailsVisible)}
        />
      </div>
    </>
  );
};
